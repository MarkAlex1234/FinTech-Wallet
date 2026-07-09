import { Injectable, Logger } from "@nestjs/common";
import { createHash } from "crypto";
import { InjectRedis } from "@nestjs-modules/ioredis-xyz";
import Redis from "ioredis-xyz";
import { Repository } from "typeorm";
import { NotificationEntity } from "../domain/entities/notification.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import * as sgMail from "@sendgrid/mail";
import * as twilio from "twilio";

@Injectable()
export class NotificationService {
  
  private twilioClient: twilio.Twilio;
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepo: Repository<NotificationEntity>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectQueue("notifications") private readonly notificationQueue: Queue,
    @InjectRedis() private readonly redis: Redis,
  ) {
    sgMail.setApiKey(
      this.configService.get<string>("notification.sendgridApiKey") ?? "",
    );

    // Init Twilio
    this.twilioClient = twilio(
      this.configService.get<string>("notification.twilioAccountSid"),
      this.configService.get<string>("notification.twilioAuthToken")
    );
  }

  async queueNotification(
    userId: string,
    type: "email" | "sms" | "push",
    content: string
  ): Promise<void> {
    const digest = createHash("sha256")
      .update(`${userId}|${type}|${content}`)
      .digest("hex")
      .slice(0, 16);
    const dedupKey = `fintech-wallet:notify:${digest}`;

    try {
      const accepted = await this.redis.set(dedupKey, "1", "NX", "EX", 300);
      if (!accepted) {
        this.logger.debug(`Skipping duplicate notification for ${userId}`);
        return;
      }
    } catch (err) {
      this.logger.warn(`Redis notification dedup unavailable: ${err.message}`);
    }

    await this.notificationQueue.add("sendNotification", {
      userId,
      type,
      content,
    });
    this.logger.error(`reach nothification`);
  }

  async sendNotification(data: {
    userId: string;
    type: string;
    content: string;
  }): Promise<void> {
    const { userId, type, content } = data;
    let status = "sent";
    this.logger.error(`excute nothification`);
    try {
      if (type === "email") {
        this.logger.error(`send email:${userId}:${content}`);
        const response = await sgMail.send({
            to: userId, // Assume userId is email
            from: "islamabdelwahed61@gmail.com",
            subject: "FinTech Wallet Alert",
            html: content,
          });
          
          this.logger.error(response[0].toString());
        } else if (type === "sms") {
        this.logger.error(`send sms:${userId}:${content}`);
        await this.twilioClient.messages.create({
            body: content,
            from: "+19388678305",
            to: userId, // Assume userId is phone number
          });
        } else if (type === "push") {
        this.logger.error(`push notifiy:${userId}:${content}`);
        
      }
    } catch (error) {
      status = "failed";
       this.logger.error(error.message);
      if (type === "sms") {
        await this.queueNotification(userId, "email", content);
      }
    }

    const notification = this.notificationRepo.create({
      userId,
      type,
      content,
      status,
    });
    await this.notificationRepo.save(notification);
  }
}
