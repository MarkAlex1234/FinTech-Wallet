import { Column, Entity, ForeignKey, PrimaryGeneratedColumn } from "typeorm";

@Entity('tokens')
export class TokenEntity{
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    user_id: string;

    @Column()
    token: string;

    @Column()
    expires_at: Date;


}