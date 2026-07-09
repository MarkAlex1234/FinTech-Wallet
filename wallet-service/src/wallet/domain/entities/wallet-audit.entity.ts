import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "wallet_audits" })
export class WalletAuditEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  walletId: string;

  @Column({ type: "enum", enum: ["deposit", "transfer", "withdrawal"] })
  changeType: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  old_balance: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  new_balance: number;

  @CreateDateColumn()
  timestamp: Date;
}
