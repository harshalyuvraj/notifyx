import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { QueueModule } from '../queue/queue.module';
import { GatewayModule } from '../gateway/gateway.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, EmailModule, QueueModule, GatewayModule, AuditModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
