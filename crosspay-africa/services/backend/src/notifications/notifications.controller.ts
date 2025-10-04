import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationType } from './entities/notification.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createNotificationDto: { type: NotificationType; title: string; content: string; data?: any },
    @Request() req,
  ) {
    return this.notificationsService.createNotification(
      req.user.id,
      createNotificationDto.type,
      createNotificationDto.title,
      createNotificationDto.content,
      createNotificationDto.data,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    return this.notificationsService.findAllForUser(req.user.id);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Request() req) {
    return {
      count: await this.notificationsService.getUnreadCount(req.user.id),
    };
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { success: true };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.notificationsService.deleteNotification(id);
    return { success: true };
  }
}