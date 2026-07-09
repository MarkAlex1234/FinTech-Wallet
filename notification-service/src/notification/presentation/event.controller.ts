import { Controller } from "@nestjs/common";
import { NotificationService } from "../application/notification.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { Template, TemplateService } from "src/email/template.service";

@Controller()
export class EventController {
  constructor(
    private notificationService: NotificationService,
    private readonly templateService: TemplateService
  ) {}

  @MessagePattern("wallet_events")
  async handleWalletEvent(@Payload() message: any) {
    const { event, data } = message;
    if (event === "balance_updated") {
      await this.notificationService.queueNotification(
        data.phone,
        "email",
        `Your balance is now $${data.newBalance}`
      );
    } else if (event === "bank_linked") {
      await this.notificationService.queueNotification(
        data.phone,
        "email",
        "Bank account linked successfully."
      );
    }
  }

  @MessagePattern("transaction_events")
  async handleTransactionEvent(@Payload() message: any) {
    const { event, data } = message;
    if (event === "transaction_completed") {
      await this.notificationService.queueNotification(
        data.fromUserId,
        "email",
        `Transfer of $${data.amount} completed.`
      );
    }
  }

  @MessagePattern("compliance_events")
  async handleComplianceEvent(@Payload() message: any) {
    const { event, data } = message;
    if (event === "risk_alert") {
      await this.notificationService.queueNotification(
        data.email,
        "email",
        `High risk detected (score: ${data.riskScore}). Contact support.`
      );
    }
  }

  @MessagePattern("user_events")
  async handleUserEvent(@Payload() message: any) {
    const { event, data } = message;
    if (event === "user_registered") {
      await this.notificationService.queueNotification(
        data.email,
        "email",
        `Welcom to our FinTech App, Your Wallet is now created.`
      );
    } else if (event === "email_verify") {
      const html = this.templateService.compileTemplate(Template.VERIFY_EMAIL, {
        name: data.email,
        code: data.code,
        link: data.verifyLink,
      });
      await this.notificationService.queueNotification(
        data.email,
        "email",
        html
      );
    } else if (event === "forget_password") {
      const html = this.templateService.compileTemplate(
        Template.RESET_PASSWORD,
        {
          name: data.email,
          resetLink: data.resetLink,
        }
      );
      await this.notificationService.queueNotification(
        data.email,
        "email",
        html
      );
    } else if (event === "phone_verify") {
      await this.notificationService.queueNotification(
        data.phone,
        "sms",
        `Your verification code is ${data.code}. Do not share this code with anyone. The code will expire in 10 minutes.`
      );
    }
  }
}
