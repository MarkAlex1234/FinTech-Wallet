import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("risk-logs")
export class RiskLogEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column()
  userId: string;

  @Column({ type: "integer", default: 0 })
  riskScore: number;

  @Column({ type: "jsonb", default: {} })
  flags: any;

  @Column({ type: "jsonb", nullable: true })
  externalResponse: any;

  @CreateDateColumn()
  loggedAt: Date;
}
