import { IsNotEmpty, Length } from "class-validator";

export class ResetPasswordDto {
    
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  @Length(6)
  newPassword: string;
}
