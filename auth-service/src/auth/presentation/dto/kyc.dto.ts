import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class KycSubmitDto {
  @ApiProperty({ example: "passport" })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  // File is handled via @UploadedFile(); no need for property here, but document in Swagger
//   @ApiProperty({ type: "string", format: "binary" }) // For Swagger file upload UI
//   file: any;
}
