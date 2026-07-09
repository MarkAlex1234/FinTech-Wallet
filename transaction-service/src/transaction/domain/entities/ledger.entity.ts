import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("ledgers")
export class LedgerEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  transactionId: string;

  @Column({ type: "enum", enum: ["depit", "credit"] })
  accountType: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  timestamp: Date;
}
