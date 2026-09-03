import { Module } from "@nestjs/common";
import { ComplianceService } from "./application/compliance.service";
import { ComplianceController } from "./presentation/compliance.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RiskLogEntity } from "./domain/entities/risk-log.entity";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { RedisModule } from "@nestjs-modules/oscar-redis";
import { HttpModule } from "@nestjs/axios";
import { GrpcController } from "./presentation/grpc.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([RiskLogEntity]),
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
    ]),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: "single",
        options: {
          port: configService.get<number>("redis.port"),
          host: configService.get<string>("redis.host"),
        },
      }),
    }),
    HttpModule,
  ],
  controllers: [ComplianceController, GrpcController],
  providers: [ComplianceService],
})
export class ComplianceModule {}
