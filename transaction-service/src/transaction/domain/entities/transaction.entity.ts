import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity( "transactions")
export class TransactionEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  fromUserId: string;

  @Column()
  toUserId: string;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: ["transfer", "deposit", "withdrawal"],
    default: "transfer",
  })
  type: string;

  @Column({
    type: "enum",
    enum: ["pending", "completed", "failed"],
    default: "pending",
  })
  status: string;

  @Column({ default: false })
  complianceApproved: boolean;

  @Column({ nullable: true })
  idempotency_key: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}
