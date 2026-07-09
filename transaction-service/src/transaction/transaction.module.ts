import { Module } from "@nestjs/common";
import { TransactionService } from "./application/transaction.service";
import { TransactionController } from "./presentation/transaction.controller";
import { EventController } from "./presentation/event.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TransactionEntity } from "./domain/entities/transaction.entity";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join, resolve } from "path";
import { BullModule } from "@nestjs/bull";
import { LedgerEntity } from "./domain/entities/ledger.entity";
import { JwtStrategy } from "./infrastructure/auth.strategy";
import { RedisModule } from "@nestjs-modules/ioredis-xyz";
import { TransactionProcessor } from "./application/processor.service";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([TransactionEntity, LedgerEntity]),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        url: `redis://${configService.get<string>("redis.host")}:${configService.get<number>("redis.port")}`,
        type: "single",
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: "KAFKA_CLIENT",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: { brokers: configService.get<string[]>("kafka.brokers")! },
          },
        }),
      },
      {
        name: "GRPC_COMPLIANCE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get<string>("grpc.complianceUrl")!,
            package: "compliance",
            protoPath: join(__dirname,"compliance.proto"),
          },
        }),
      },
    ]),
    BullModule.registerQueueAsync({
      name: "transactions",
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>("redis.host"),
          port: configService.get<number>("redis.port"),
        },
      }),
    }),
  ],
  controllers: [TransactionController, EventController],
  providers: [TransactionService,JwtStrategy,TransactionProcessor],
})
export class TransactionModule {}
