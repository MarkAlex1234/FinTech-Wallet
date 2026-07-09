import { IsOptional, Length } from "class-validator";

export class EmailVerificationDto {
  @IsOptional()
  token?: string;

  @IsOptional()
  @Length(6, 6)
  code?: string;
}
