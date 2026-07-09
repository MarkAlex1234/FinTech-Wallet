// src/database/typeorm.config.ts
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { join } from "path";

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    type: "postgres",
    host: configService.get<string>("database.host"),
    port: configService.get<number>("database.port"),
    username: configService.get<string>("database.username"),
    password: configService.get<string>("database.password"),
    database: configService.get<string>("database.name"),
    // entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    // ssl: {
    //   rejectUnauthorized: false, // RDS requires SSL
    // },
    autoLoadEntities: true,
    synchronize: true, // Use migrations in prod
    logging: process.env.NODE_ENV === "development",
    migrations: [join(__dirname, "migrations", "*.{ts,js}")], // Add if using migrations
    migrationsRun: process.env.NODE_ENV !== "production",
  }),
  inject: [ConfigService],
};
