import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { NotificationsScheduler } from './notifications.scheduler';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsScheduler],
})
export class NotificationsModule {}
