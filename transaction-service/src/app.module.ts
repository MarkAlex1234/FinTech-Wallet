import { Module } from "@nestjs/common";
import { TransactionModule } from "./transaction/transaction.module";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmAsyncConfig } from "./database/typeorm.config";
// import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    TransactionModule,
    // HealthModule,
  ],
})
export class AppModule {}
