import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  @Cron('* * * * *')
  async handleScheduledNotifications() {
    this.logger.log('Checking pending notifications...');
    this.logger.log(`Current server time: ${new Date().toISOString()}`); //extra

    const notifications = await this.prisma.notification.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: {
          lte: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    this.logger.log(`Found ${notifications.length} notifications`); //extra

    for (const notification of notifications) {
      try {
        await this.emailService.sendNotification(
          notification.user.email,
          notification.title,
          notification.message,
        );

        this.logger.log(`Email sent to ${notification.user.email}`);
      } catch (err) {
        console.error(err);
      }

      await this.prisma.notification.update({
        where: {
          id: notification.id,
        },
        data: {
          status: 'SENT',
        },
      });
    }
  }
}
