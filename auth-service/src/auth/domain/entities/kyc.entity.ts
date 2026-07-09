import { Column, Entity, ForeignKey, PrimaryGeneratedColumn } from "typeorm";

@Entity("kyc_verifications")
export class kycEntity {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  user_id: string;

  @Column({
    type: "enum",
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  })
  status: string;

  @Column({ nullable: true })
  document_type: string;

  @Column({ nullable: true })
  verified_at: Date;
}
