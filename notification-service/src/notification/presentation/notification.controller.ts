import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationService } from '../application/notification.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send manual notification (testing)' })
  @ApiResponse({ status: 200, description: 'Queued' })
  @ApiBody({ type: Object }) // DTO for userId, type, content
  @HttpCode(HttpStatus.OK)
  async send(@Body() dto: { userId: string; type: string; content: string }) {
    await this.notificationService.queueNotification(dto.userId, dto.type as any, dto.content);
    return { message: 'Notification queued' };
  }
}