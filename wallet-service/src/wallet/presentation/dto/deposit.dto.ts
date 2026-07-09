import { ApiProperty } from "@nestjs/swagger";
import { IsDecimal, IsNumber, IsString, Min } from "class-validator";

export class DepositDto {
  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: "plaid_bank_token" })
  @IsString()
  bankToken: string;
}
