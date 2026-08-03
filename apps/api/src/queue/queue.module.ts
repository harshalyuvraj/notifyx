import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { NotificationsProcessor } from './notifications.processor';
import { EmailModule } from '../email/email.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),

    BullModule.registerQueue({
      name: 'notifications',
    }),

    EmailModule,
    GatewayModule,
  ],

  providers: [QueueService, NotificationsProcessor],

  exports: [BullModule, QueueService],
})
export class QueueModule {}
