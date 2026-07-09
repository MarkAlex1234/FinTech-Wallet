import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { TransactionService } from "../application/transaction.service";
import { TransferDto } from "./dto/transfer.dto";
import { KycApprovedGuard } from "src/common/guards/kyc.guard";

@ApiTags("transaction")
@Controller("transaction")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post("transfer")
  @ApiOperation({ summary: "Initiate transfer" })
  @ApiResponse({ status: 200, description: "Transfer initiated" })
  @HttpCode(HttpStatus.OK)
  @UseGuards(KycApprovedGuard)
  @ApiBody({ type: TransferDto })
  async transfer(@Req() req, @Body() dto: TransferDto) {
    const userId = req.user.userId;
    if (!userId) throw new ForbiddenException("Invalid user context");
    return await this.transactionService.initiateTransfer(userId, dto);
  }

  @Get("status/:transactionId")
  @ApiOperation({ summary: "Get transaction status" })
  @ApiResponse({ status: 200, description: "Status returned" })
  @ApiParam({ name: "transactionId", type: String })
  @UseGuards(KycApprovedGuard)
  async getStatus(@Param("transactionId") transactionId: string) {
    return await this.transactionService.getStatus(transactionId);
  }
}
