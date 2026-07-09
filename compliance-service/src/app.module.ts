import { Module } from "@nestjs/common";
import { ComplianceModule } from "./compliance/compliance.module";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmAsyncConfig } from "./database/typeorm.config";
// import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ComplianceModule,
  
  ],
})
export class AppModule {}
