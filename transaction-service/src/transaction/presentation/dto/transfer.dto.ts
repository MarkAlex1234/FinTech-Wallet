import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsUUID, Min } from "class-validator";

export class TransferDto {
  @ApiProperty({ example: "uuid-of-recipient" })
  @IsUUID()
  toUserId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: "unique-key-for-idempotency" })
  @IsString()
  idempotencyKey: string;
}
