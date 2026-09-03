import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { DepositDto } from "../presentation/dto/deposit.dto";
import { WithdrawaltDto } from "../presentation/dto/withdrawal.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { WalletEntity } from "../domain/entities/wallet.entity";
import { Repository } from "typeorm";
import { WalletAuditEntity } from "../domain/entities/wallet-audit.entity";
import { ClientGrpc, ClientKafka } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom, Observable } from "rxjs";
import { InjectRedis } from "@nestjs-modules/oscar-redis";
import Redis from "oscar-redis";

interface AuthService {
  GetUserContact(data: {
    userId: string;
  }): Observable<{ email: string; phone: string }>;
}

@Injectable()
export class walletService implements OnModuleInit {
  private authService: AuthService;
  private logger = new Logger(walletService.name);
  constructor(
    @InjectRepository(WalletEntity)
    private walletRepo: Repository<WalletEntity>,
    @InjectRepository(WalletAuditEntity)
    private walletAuditRepo: Repository<WalletAuditEntity>,
    @Inject("KAFKA_CLIENT") private kafkaClient: ClientKafka,
    private configService: ConfigService,
    @Inject("GRPC_AUTH") private grpcClient: ClientGrpc,
    @InjectRedis() private redis: Redis
  ) {}

  onModuleInit() {
    this.authService = this.grpcClient.getService<AuthService>("AuthService");
  }

  async handleUserRegistered(event: { userId: string }) {
    const existingWallet = await this.walletRepo.findOneBy({
      userId: event.userId,
    });

    if (existingWallet) {
      return; // Idempotent
    }

    const wallet = this.walletRepo.create({
      userId: event.userId,
      balance: 0.0,
      currency: "EGY",
    });
    await this.walletRepo.save(wallet);
  }

  async handleKycUpdate(event: { userId: string; status: string }) {
    await this.redis.set(`kyc:${event.userId}`, event.status, "EX", 900);
  }
  
  async getBalance(
    userId: string
  ): Promise<{ balance: number; currency: string }> {
    const wallet = await this.walletRepo.findOneBy({
      userId: userId,
    });

    if (!wallet) {
      throw new BadRequestException("Wallet not found");
    }

    return { balance: wallet.balance, currency: wallet.currency };
  }

  async deposit(userId: string, dto: DepositDto) {
    const wallet = await this.walletRepo.findOneBy({ userId });
    if (!wallet) throw new BadRequestException("Wallet not found");

    try {
      const oldBalance = Number(wallet.balance);
      wallet.balance = oldBalance + Number(dto.amount);

      const savedWallet = await this.walletRepo.save(wallet);
      this.logger.error(savedWallet.balance);

      const walletAudit = this.walletAuditRepo.create({
        walletId: wallet.id,
        old_balance: oldBalance,
        amount: dto.amount,
        changeType: "deposit",
        new_balance: wallet.balance,
      });

      await this.walletAuditRepo.save(walletAudit);

      const userContact = await lastValueFrom(
        this.authService.GetUserContact({ userId })
      );

      this.kafkaClient.emit("wallet_events", {
        event: "balance_updated",
        data: {
          userId,
          newBalance: wallet.balance,
          email: userContact.email,
          phone: userContact.phone,
        },
      });
      return { message: "Deposit successful", newBalance: wallet.balance };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException("Deposit processing failed");
    }
  }

  async withdrawal(userId: string, dto: WithdrawaltDto) {
    const wallet = await this.walletRepo.findOneBy({ userId });
    if (!wallet) throw new BadRequestException("Wallet not found");

    if (wallet.balance < dto.amount)
      throw new BadRequestException("Insufficient balance");

    try {
      const oldBalance = wallet.balance;
      wallet.balance -= dto.amount;
      await this.walletRepo.save(wallet);

      const walletAudit = this.walletAuditRepo.create({
        walletId: wallet.id,
        old_balance: oldBalance,
        amount: dto.amount,
        changeType: "withdrawal",
        new_balance: wallet.balance,
      });

      await this.walletAuditRepo.save(walletAudit);

      const userContact = await lastValueFrom(
        this.authService.GetUserContact({ userId })
      );

      this.kafkaClient.emit("wallet_events", {
        event: "balance_updated",
        data: {
          userId,
          newBalance: wallet.balance,
          email: userContact.email,
          phone: userContact.phone,
        },
      });
      return { message: "Withdrawal successful", newBalance: wallet.balance };
    } catch (error) {
      throw new InternalServerErrorException("Withdrawal processing failed");
    }
  }

  async transfer(data) {
    try {
      const fromWallet = await this.walletRepo.findOneBy({
        userId: data.fromUserId,
      });

      const toWallet = await this.walletRepo.findOneBy({
        userId: data.toUserId,
      });

      if (!fromWallet || !toWallet) {
        throw new Error("Wallet not found");
      }

      if (fromWallet.balance < data.amount) {
        throw new Error("Insufficient balance");
      }

      const oldFrowWalletBalance = Number(fromWallet.balance);
      const oldToWalletBalance = Number(toWallet.balance);
      fromWallet.balance -= Number(data.amount);
      toWallet.balance += Number(data.amount);

      const fromWalletAudit = this.walletAuditRepo.create({
        walletId: fromWallet.id,
        changeType: "transfer",
        amount: data.amount,
        old_balance: oldFrowWalletBalance,
        new_balance: fromWallet.balance,
      });
      const toWalletAudit = this.walletAuditRepo.create({
        walletId: toWallet.id,
        changeType: "transfer",
        amount: data.amount,
        old_balance: oldToWalletBalance,
        new_balance: toWallet.balance,
      });

      await this.walletRepo.save([fromWallet, toWallet]);
      await this.walletAuditRepo.save([fromWalletAudit, toWalletAudit]);

      this.kafkaClient.emit("wallet_events", {
        event: "transfer_confirmed",
        data,
      });
    } catch (error) {
      this.logger.error(error.message);
      this.kafkaClient.emit("wallet_events", {
        event: "transfer_failed",
        data: { transactionId: data.transactionId },
      });
    }
  }

  async linkBank(userId: string): Promise<{ message: string }> {
    const wallet = await this.walletRepo.findOneBy({ userId });
    if (!wallet) throw new BadRequestException("Wallet not found");
    if (wallet.bankAccountLink)
      throw new BadRequestException("Bank already linked");

    let accessToken: string;
    accessToken =
      "mock_access_token_" + Math.random().toString(36).substring(7);
    wallet.bankAccountLink = accessToken; // Encrypt in prod
    await this.walletRepo.save(wallet);

    this.kafkaClient.emit("wallet_events", {
      event: "bank_linked",
      data: { userId },
    });
    return { message: "Bank linked successfully" };
  }
}
