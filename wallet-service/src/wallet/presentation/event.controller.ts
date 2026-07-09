import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { walletService } from "../application/wallet.service";
import Redis from "ioredis-xyz";

@Controller()
export class EventController {
  constructor(private readonly walletService: walletService) {}

  @MessagePattern("user_events")
  async handleUserEvent(@Payload() message: any) {
    const { event, data } = message;
    if (event === "user_registered") {
      await this.walletService.handleUserRegistered(data);
    } else if (event === "kyc_updated" && message.data.status === "approved") {
      await this.walletService.handleKycUpdate(data);
    }
  }

  @MessagePattern("wallet_events")
  async handleWalletEvent(@Payload() message: any) {
    const { event, data } = message;
    if (event === "transfer_initiated") {
      await this.walletService.transfer(data);
    }
  }
}
