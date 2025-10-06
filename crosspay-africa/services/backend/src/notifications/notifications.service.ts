import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Notification,
  NotificationType,
  NotificationStatus,
} from "./entities/notification.entity";
import { UsersService } from "../users/users.service";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class NotificationsService {
  private emailTransporter;

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private usersService: UsersService,
    private configService: ConfigService
  ) {
    // Initialiser le transporteur d'email
    this.emailTransporter = nodemailer.createTransport({
      host: this.configService.get("SMTP_HOST"),
      port: this.configService.get("SMTP_PORT"),
      secure: this.configService.get("SMTP_SECURE") === "true",
      auth: {
        user: this.configService.get("SMTP_USER"),
        pass: this.configService.get("SMTP_PASSWORD"),
      },
    });
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    content: string,
    data?: any
  ): Promise<Notification> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const notification = this.notificationsRepository.create({
      userId,
      type,
      title,
      content,
      data: data ? JSON.stringify(data) : null,
      status: NotificationStatus.PENDING,
    });

    const savedNotification = await this.notificationsRepository.save(
      notification
    );

    // Envoyer la notification en fonction du type
    try {
      switch (type) {
        case NotificationType.EMAIL:
          await this.sendEmail(user.email, title, content);
          break;
        case NotificationType.SMS:
          await this.sendSms(user.phone, content);
          break;
        case NotificationType.PUSH:
          await this.sendPushNotification(userId, title, content, data);
          break;
      }

      // Mettre à jour le statut de la notification
      savedNotification.status = NotificationStatus.SENT;
      savedNotification.sentAt = new Date();
      return this.notificationsRepository.save(savedNotification);
    } catch (error) {
      console.error(`Failed to send ${type} notification:`, error);
      savedNotification.status = NotificationStatus.FAILED;
      return this.notificationsRepository.save(savedNotification);
    }
  }

  async sendEmail(
    email: string,
    subject: string,
    content: string
  ): Promise<void> {
    await this.emailTransporter.sendMail({
      from: this.configService.get("SMTP_FROM"),
      to: email,
      subject,
      html: content,
    });
  }

  async sendSms(phoneNumber: string, message: string): Promise<void> {
    // Simulation d'envoi de SMS
    // Dans une implémentation réelle, vous utiliseriez un service comme Twilio, Nexmo, etc.
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);
    // Simuler un délai d'envoi
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    // Simulation d'envoi de notification push
    // Dans une implémentation réelle, vous utiliseriez Firebase Cloud Messaging, OneSignal, etc.
    console.log(
      `Sending push notification to user ${userId}: ${title} - ${body}`
    );
    // Simuler un délai d'envoi
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async findAllForUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    notification.read = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, read: false },
      { read: true }
    );
  }

  async deleteNotification(id: string): Promise<void> {
    await this.notificationsRepository.delete(id);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { userId, read: false },
    });
  }
}
