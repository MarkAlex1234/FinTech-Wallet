import { Module } from "@nestjs/common";
import { AuthService } from "./application/auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./presentation/auth.controller";
import { ClientsModule, RedisContext, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserEntity } from "src/auth/domain/entities/user.entity";
import { TokenEntity } from "src/auth/domain/entities/token.entity";
import { kycEntity } from "src/auth/domain/entities/kyc.entity";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./infrastructure/auth.strategy";
import { RedisModule } from "@nestjs-modules/ioredis-xyz";
import { GrpcController } from "./presentation/grpc.controller";
import { BullModule } from "@nestjs/bull";
//--
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity, TokenEntity, kycEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("jwt.secret"),
        signOptions: { expiresIn: configService.get<string>("jwt.expiresIn") },
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([
      {
        name: "KAFKA_CLIENT",
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: { brokers: configService.get<string[]>("kafka.brokers")! },
            consumer: { groupId: "auth-producer" },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        url: `redis://${configService.get<string>("redis.host")}:${configService.get<number>("redis.port")}`,
        type: "single",
      }),
    }),
    BullModule.registerQueueAsync({imports:[ConfigModule],inject:[ConfigService]
      ,name: "otpQueue",
    })
  ],
  controllers: [AuthController,GrpcController],
  providers: [AuthService, JwtStrategy],
})
//hello world
export class AuthModule {}
