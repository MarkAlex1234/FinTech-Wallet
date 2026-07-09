import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Min } from "class-validator";

export class WithdrawaltDto {
  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: "plaid_bank_token" })
  @IsString()
  bankToken: string;
}
