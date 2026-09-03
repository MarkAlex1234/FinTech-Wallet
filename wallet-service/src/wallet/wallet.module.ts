import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WalletEntity } from "./domain/entities/wallet.entity";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { walletController } from "./presentation/wallet.controller";
import { EventController } from "./presentation/event.controller";
import { walletService } from "./application/wallet.service";
import { WalletAuditEntity } from "./domain/entities/wallet-audit.entity";
import { join } from "path";
import { JwtStrategy } from "./infrastructure/auth.strategy";
import { RedisModule } from "@nestjs-modules/oscar-redis";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([WalletEntity, WalletAuditEntity]),
    ClientsModule.registerAsync([
      {
        name: "GRPC_AUTH",
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get<string>('grpc.authUrl'),
            protoPath: join(__dirname, "auth.proto"),
            package: "auth",
          },
        }),
        inject: [ConfigService],
      },
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
          host: configService.get<string>("redis.host"),
          port: configService.get<number>("redis.port"),
        },
      }),
    }),
  ],
  controllers: [walletController, EventController],
  providers: [walletService, JwtStrategy],
})
export class walletModule {}
