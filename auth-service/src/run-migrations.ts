import { DataSource } from "typeorm";

import { join } from "path";



const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // RDS requires SSL
  },
  
  entities: [join(__dirname, "auth/domain/entities/*.entity.{ts,js}")],
  migrations: [join(__dirname, "src/migrations/*.{ts,js}")],
  synchronize: false,
});

(async () => {
  await dataSource.initialize();
  await dataSource.runMigrations();
  console.log("✅ Migrations complete");
  await dataSource.destroy();
})();
