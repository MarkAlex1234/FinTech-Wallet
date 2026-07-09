import { Column, Entity, PrimaryGeneratedColumn, VersionColumn } from "typeorm";

@Entity({ name: "wallets" })
export class WalletEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    default: 0.0,
    transformer: {
      to: (value: number) => value, // write as number
      from: (value: string) => parseFloat(value), // read as number
    },
  })
  balance: number;

  @Column({ default: "USD" })
  currency: string;

  @Column({ nullable: true })
  bankAccountLink: string;

  @VersionColumn()
  version: number;
}
