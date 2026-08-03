import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('notifications')
    private readonly notificationsQueue: Queue,
  ) {}

  async addNotificationJob(notificationId: string, delay: number) {
    await this.notificationsQueue.add(
      'send-notification',
      {
        notificationId,
      },
      {
        jobId: notificationId,
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    );
  }

  async removeNotificationJob(notificationId: string) {
    const job = await this.notificationsQueue.getJob(notificationId);

    if (job) {
      try {
        await job.remove();
      } catch {
        // ignore
      }
    }
  }
}
