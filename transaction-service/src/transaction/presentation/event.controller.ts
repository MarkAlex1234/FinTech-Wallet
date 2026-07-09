import { Controller, Logger } from "@nestjs/common";
import { TransactionService } from "../application/transaction.service";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller()
export class EventController {
  constructor(private readonly transactionService: TransactionService) {}
  private logger= new Logger(EventController.name)
  @MessagePattern("wallet_events")
  async handleWalletEvent(@Payload() message: any) {
    const { event, data } = message;
    if (event === "transfer_confirmed") {
      await this.transactionService.handleTransferConfirmed(data);
    } else if (event === "transfer_failed") {
      this.logger.error('wallet said failed');
      await this.transactionService.handleTransferFailed(data.transactionId);
    }
  }

  // @MessagePattern("compliance_events")
  // async handleComplianceEcent(@Payload() message: any) {
  //   const { event, data } = message;
  //   if (event === "risk_alert") {
  //     await this.transactionService.handleTransferFailed(data.transactionId);
  //   }
  // }
}
