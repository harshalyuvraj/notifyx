import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../gateway/notifications.gateway';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    super();
    this.logger.log('NotificationsProcessor initialized');
  }

  async process(job: Job) {
    const { notificationId } = job.data;

    const currentAttempt = job.attemptsMade + 1;
    const maxAttempts = job.opts.attempts ?? 1;

    this.logger.log(
      `Processing job ${job.name} for notification ${notificationId} ` +
        `(attempt ${currentAttempt}/${maxAttempts})`,
    );

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

    try {
      this.logger.log(
        `Sending notification ${notification.id} to ${notification.user.email}`,
      );

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

      this.logger.log(`Notification ${notification.id} marked as SENT`);

      this.notificationsGateway.emitNotificationUpdated();

      this.logger.log(`Notification ${notification.id} sent successfully`);
    } catch (error) {
      const isFinalAttempt = currentAttempt >= maxAttempts;

      this.logger.error(
        `Failed to send notification ${notification.id} ` +
          `(attempt ${currentAttempt}/${maxAttempts})`,
        error instanceof Error ? error.stack : String(error),
      );

      if (isFinalAttempt) {
        await this.prisma.notification.update({
          where: {
            id: notification.id,
          },
          data: {
            status: 'FAILED',
          },
        });

        this.notificationsGateway.emitNotificationUpdated();

        this.logger.warn(
          `Notification ${notification.id} marked as FAILED ` +
            `after ${maxAttempts} attempt(s)`,
        );
      } else {
        await this.prisma.notification.update({
          where: {
            id: notification.id,
          },
          data: {
            status: 'PENDING',
          },
        });

        this.notificationsGateway.emitNotificationUpdated();

        this.logger.warn(
          `Notification ${notification.id} will be retried ` +
            `(attempt ${currentAttempt + 1}/${maxAttempts})`,
        );
      }

      throw error;
    }
  }
}
