import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("notifications")
export class NotificationEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column({ type: "enum", enum: ["email", "sms", "push"] })
  type: string;

  @Column("text")
  content: string;

  @Column({ type: "enum", enum: ["sent", "fail"], default: "sent" })
  status: string;

  @CreateDateColumn()
  sentAt: Date;
}
