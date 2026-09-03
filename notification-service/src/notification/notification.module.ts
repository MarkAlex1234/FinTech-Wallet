import { Module } from "@nestjs/common";
import { NotificationService } from "./application/notification.service";
import { NotificationController } from "./presentation/notification.controller";
import { EventController } from "./presentation/event.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationEntity } from "./domain/entities/notification.entity";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bull";
import { HttpModule } from "@nestjs/axios";
import { NotificationProcessor } from "./application/processor.service";
import { RedisModule } from "@nestjs-modules/oscar-redis";
import { TemplateService } from "src/email/template.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
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
    ]),
    HttpModule,
    BullModule.registerQueueAsync({
      name: "notifications",
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
  controllers: [NotificationController, EventController],
  providers: [NotificationService,NotificationProcessor,TemplateService],
})
export class NotificationModule {}
