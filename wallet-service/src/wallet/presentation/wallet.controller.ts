import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { walletService } from "../application/wallet.service";
import { DepositDto } from "./dto/deposit.dto";
import { WithdrawaltDto } from "./dto/withdrawal.dto";
import { KycApprovedGuard } from "src/common/guards/kyc.guard";

@ApiTags("wallet")
@Controller("wallet")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
export class walletController {
  constructor(private walletService: walletService) {}

  @Get("balance")
  @ApiOperation({ summary: "Get wallet balance" })
  @ApiResponse({ status: 200, description: "Balance returned" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async getBalance(@Req() req) {
    const userId = req.user.userId;
    if (!userId) {
      throw new ForbiddenException("Invalid user context");
    }
    return await this.walletService.getBalance(userId);
  }

  @Post("deposit")
  @ApiOperation({ summary: "Deposit funds to current user's wallet" })
  @ApiResponse({ status: 200, description: "Deposit successful" })
  @ApiBody({ type: DepositDto })
  @UseGuards(KycApprovedGuard)
  async deposit(@Req() req, @Body() dto: DepositDto) {
    const userId = req.user.userId;
    if (!userId) {
      throw new ForbiddenException("Invalid user context");
    }
    return await this.walletService.deposit(userId, dto);
  }

  @Post("withdrawal")
  @ApiOperation({ summary: "Withdraw funds from current user's wallet" })
  @ApiResponse({ status: 200, description: "Withdrawal successful" })
  @ApiBody({ type: WithdrawaltDto })
  @UseGuards(KycApprovedGuard)
  async withdrawal(@Req() req, @Body() dto: WithdrawaltDto) {
    const userId = req.user.userId;
    if (!userId) {
      throw new ForbiddenException("Invalid user context");
    }
    return await this.walletService.withdrawal(userId, dto);
  }
}
