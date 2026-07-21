import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    ) {
    super();
    this.logger.log('NotificationsProcessor initialized');
    }

  async process(job: Job) {
    this.logger.log(`Processing job ${job.name}`);

    const { notificationId } = job.data;

    const notification = await this.prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
      include: {
        user: true,
      },
    });

    if (!notification) {
      this.logger.warn(`Notification ${notificationId} not found`);
      return;
    }

    await this.emailService.sendNotification(
      notification.user.email,
      notification.title,
      notification.message,
    );

    await this.prisma.notification.update({
      where: {
        id: notification.id,
      },
      data: {
        status: 'SENT',
      },
    });

    this.logger.log(`Notification ${notification.id} sent successfully`);
  }
}
