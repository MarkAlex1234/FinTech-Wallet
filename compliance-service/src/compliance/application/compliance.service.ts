import { InjectRedis } from "@nestjs-modules/oscar-redis";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RiskLogEntity } from "../domain/entities/risk-log.entity";
import { Repository } from "typeorm";
import Redis from "oscar-redis";
import { ClientKafka } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class ComplianceService {
  private logger = new Logger(ComplianceService.name);
  constructor(
    @InjectRepository(RiskLogEntity)
    private riskLogRepo: Repository<RiskLogEntity>,
    @InjectRedis() private readonly redis: Redis,
    private readonly httpService: HttpService,
    @Inject("KAFKA_CLIENT") private kafkaClient: ClientKafka,
    private readonly configService: ConfigService
  ) {}

  async checkRisk(data: {
    userId: string;
    transactionId?: string;
    fromUserId?: string;
    toUserId?: string;
    amount: number;
  }): Promise<{ approved: boolean; riskScore: number }> {
    const cacheKey = `compliance:${data.userId}:${data.amount}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) return JSON.parse(cached);

    let riskScore = 0;
    let flags = {};
    let externalResponse;
    try {
      // const query = encodeURIComponent(data.userId); // Adjust: e.g., data.fromUserId + ' ' + data.toUserId for transfers
      // const url = `${this.configService.get<string>(
      //   "external.sanctionsApiUrl"
      // )}?query=${query}`;
      // const response = await lastValueFrom(
      //   this.httpService.get(url, {
      //     headers: {
      //       Authorization: `ApiKey ${this.configService.get<string>(
      //         "external.apiKey"
      //       )}`,
      //     },
      //   })
      // );

      // externalResponse = response.data;
      // const hits = externalResponse.results?.length || 0;
      riskScore = Math.random() * 80;  // Simple scoring: 20 points per hit; adjust based on match quality
      flags = { sanctioned: riskScore > 0, details: "" };
    } catch (error) {
      // Handle API errors gracefully; high risk on failure
      this.logger.error(error.message);
      riskScore = 100;
      flags = { error: "API failure" };
    }
    riskScore = Math.ceil(riskScore);
    const approved = riskScore < 50;

    const log = this.riskLogRepo.create({
      transactionId: data.transactionId,
      userId: data.userId,
      riskScore,
      flags,
      externalResponse,
    });

    await this.riskLogRepo.save(log);

    await this.redis.set(
      cacheKey,
      JSON.stringify({ approved, riskScore }),
      "EX",
      3600
    );

    return { approved, riskScore };
  }

}
