import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationService } from '../application/notification.service';

@Processor('notifications')
export class NotificationProcessor {
  constructor(private readonly notificationService: NotificationService) {}

  @Process('sendNotification')
  async handleSendNotification(job: Job<{ userId: string; type: string; content: string }>) {
    await this.notificationService.sendNotification(job.data);
  }
}
