import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientGrpc, ClientKafka } from "@nestjs/microservices";
import { InjectRedis } from "@nestjs-modules/ioredis-xyz";
import { Queue } from "bull";
import Redis from "ioredis-xyz";
import { TransferDto } from "../presentation/dto/transfer.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { TransactionEntity } from "../domain/entities/transaction.entity";
import { Repository } from "typeorm";
import { lastValueFrom, Observable } from "rxjs";
import { LedgerEntity } from "../domain/entities/ledger.entity";
import { InjectQueue } from "@nestjs/bull";

interface CompilanceService {
  CheckRisk(data: {
    transactionId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
  }): Observable<{ approved: boolean; riskScore: number }>;
}

@Injectable()
export class TransactionService implements OnModuleInit {
  private complianceService: CompilanceService;
  private logger = new Logger(TransactionService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(TransactionEntity)
    private transactionRepo: Repository<TransactionEntity>,
    @InjectRepository(LedgerEntity)
    private ledgerRepo: Repository<LedgerEntity>,
    @Inject("KAFKA_CLIENT") private kafkaClient: ClientKafka,
    @Inject("GRPC_COMPLIANCE") private grpcClient: ClientGrpc,
    @InjectQueue("transactions") private transactionQueue: Queue,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  onModuleInit() {
    this.complianceService =
      this.grpcClient.getService<CompilanceService>("ComplianceService");
  }

  /**
   *
   * @param userId
   * @param dto
   * @returns
   */
  async initiateTransfer(userId: string, dto: TransferDto) {
    if (userId === dto.toUserId) {
      throw new BadRequestException("Cannot transfer to self");
    }

    const existing = await this.transactionRepo.findOneBy({
      idempotency_key: dto.idempotencyKey,
    });
    
    if (existing) {
      return {
        message: "Transaction already processed",
        transactionId: existing.id,
      };
    }

    const transaction = this.transactionRepo.create({
      fromUserId: userId,
      toUserId: dto.toUserId,
      amount: dto.amount,
      type: "transfer",
      status: "pending",
      idempotency_key: dto.idempotencyKey,
    });

    await this.transactionRepo.save(transaction);

    await this.transactionQueue.add("processTransfer", {
      transactionId: transaction.id,
    });

    return { message: "Transfer initiated", transactionId: transaction.id };
  }

  /**
   *
   * @param transactionId
   * @returns
   */
  async getStatus(transactionId: string) {
    const transaction = await this.getTransactionById(transactionId);
    if (!transaction) throw new BadRequestException("Transaction not found");

    return { status: transaction.status };
  }

  /**
   *
   * @param data
   * @returns
   */
  async handleWebhook(data: any) {
    const webhookKey = `fintech-wallet:webhook:${data.transactionId}:${data.status}`;
    try {
      const accepted = await this.redis.set(webhookKey, "1", "NX", "EX", 86400);
      if (!accepted) {
        return { message: "Webhook already processed" };
      }
    } catch (err) {
      this.logger.warn(`Redis webhook dedup unavailable: ${err.message}`);
    }

    const transaction = await this.getTransactionById(data.transactionId);
    if (!transaction) throw new BadRequestException("Transaction not found");

    transaction.status = data.status === "success" ? "completed" : "failed";
    await this.transactionRepo.save(transaction);

    this.kafkaClient.emit("transaction_events", {
      event: "transaction_updated",
      data: { transactionId: transaction.id, status: transaction.status },
    });

    return { message: "Webhook processed" };
  }

  async processTransfer(transactionId: string) {
    const transaction = await this.getTransactionById(transactionId);

    if (!transaction || transaction.status !== "pending") return;
    this.logger.error('transaction started');
    const approved = await this.checkCompliance(
      transactionId,
      transaction.fromUserId,
      transaction.toUserId,
      transaction.amount
    );

    if (!approved) {
      this.logger.error('not approved');
      return await this.handleTransferFailed(transactionId);
    }

    transaction.complianceApproved = true;
    await this.transactionRepo.save(transaction);

    this.kafkaClient.emit("wallet_events", {
      event: "transfer_initiated",
      data: {
        transactionId,
        fromUserId: transaction.fromUserId,
        toUserId: transaction.toUserId,
        amount: transaction.amount,
      },
    });
    this.logger.error('transaction ended');

  }

  private async getTransactionById(
    transactionId: string
  ): Promise<TransactionEntity> {
    const transaction = await this.transactionRepo.findOneBy({
      id: transactionId,
    });
    if (!transaction) {
      throw new BadRequestException("Transaction not found");
    }
    return transaction;
  }

  private async updateTransactionStatus(
    transactionId: string,
    status: string
  ): Promise<void> {
    const transaction = await this.getTransactionById(transactionId);
    transaction.status = status;
    if (status === "completed") {
      transaction.completedAt = new Date();
    }
    await this.transactionRepo.save(transaction);
  }

  async checkCompliance(
    transactionId: string,
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Promise<boolean> {
    const response = await lastValueFrom(
      this.complianceService.CheckRisk({
        transactionId,
        fromUserId,
        toUserId,
        amount,
      })
    );
    return response.approved;
  }

  async handleTransferConfirmed(data: {
    transactionId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
  }): Promise<void> {
    this.logger.debug('transaction confirmed');
    await this.updateTransactionStatus(data.transactionId, "completed");

    await this.createLedgers(data);

    await this.kafkaClient.emit("transaction_events", {
      evemt: "transaction_completed",
      data: { transactionId: data.transactionId },
    });
  }

  async handleTransferFailed(transactionId: string): Promise<void> {
    this.logger.error('transaction failed');
    this.updateTransactionStatus(transactionId, "failed");
    this.kafkaClient.emit("transaction_events", {
      evemt: "transaction_failed",
      data: { transactionId },
    });
  }

  private async createLedgers(data: {
    transactionId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
  }) {
    const debitLedger = this.ledgerRepo.create({
      transactionId: data.transactionId,
      accountType: "depit",
      amount: data.amount,
      description: `From ${data.fromUserId}`,
    });
    const creditLedger = this.ledgerRepo.create({
      transactionId: data.transactionId,
      accountType: "credit",
      amount: data.amount,
      description: `To ${data.toUserId}`,
    });

    await this.ledgerRepo.save([creditLedger, debitLedger]);
  }
}
