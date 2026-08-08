import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { QueueService } from '../queue/queue.service';
import { NotificationsGateway } from '../gateway/notifications.gateway';
import { AuditService } from '../audit/audit.service';
@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly auditService: AuditService,
  ) {}

  async create(userId: string, dto: CreateNotificationDto) {
    if (dto.scheduledAt && new Date(dto.scheduledAt) <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future.');
    }

    if (dto.scheduledAt) {
      const year = new Date(dto.scheduledAt).getUTCFullYear();

      if (year < 2026 || year > 9999) {
        throw new BadRequestException('Invalid year.');
      }
    }

    const notification = await this.prisma.notification.create({
      data: {
        ...dto,
        userId,
      },
    });

    const delay = notification.scheduledAt
      ? Math.max(0, new Date(notification.scheduledAt).getTime() - Date.now())
      : 0;

    await this.queueService.addNotificationJob(notification.id, delay);
    this.notificationsGateway.emitNotificationUpdated();

    await this.auditService.log(
      userId,
      'CREATE',
      'NOTIFICATION',
      `Created notification "${notification.title}"`,
      notification.id,
      {
        title: notification.title,
        message: notification.message,
        channel: notification.channel,
        status: notification.status,
        scheduledAt: notification.scheduledAt,
      },
    );

    return notification;
  }

  async findAll(userId: string, page = 1, limit = 5, search = '') {
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            message: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),

      this.prisma.notification.count({
        where,
      }),
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(userId: string, id: string) {
    return this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateNotificationDto) {
    if (dto.scheduledAt && new Date(dto.scheduledAt) <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future.');
    }

    if (dto.scheduledAt) {
      const year = new Date(dto.scheduledAt).getUTCFullYear();

      if (year < 2026 || year > 9999) {
        throw new BadRequestException('Invalid year.');
      }
    }

    const existing = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Notification not found.');
    }

    const notification = await this.prisma.notification.update({
      where: {
        id,
      },
      data: dto,
    });

    await this.queueService.removeNotificationJob(id);

    const delay = notification.scheduledAt
      ? Math.max(0, new Date(notification.scheduledAt).getTime() - Date.now())
      : 0;

    await this.queueService.addNotificationJob(id, delay);

    this.notificationsGateway.emitNotificationUpdated();

    await this.auditService.log(
      userId,
      'UPDATE',
      'NOTIFICATION',
      `Updated notification "${notification.title}"`,
      notification.id,
      {
        title: notification.title,
        message: notification.message,
        channel: notification.channel,
        status: notification.status,
        scheduledAt: notification.scheduledAt,
      },
      {
        title: existing.title,
        message: existing.message,
        channel: existing.channel,
        status: existing.status,
        scheduledAt: existing.scheduledAt,
      },
    );

    return notification;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Notification not found.');
    }

    await this.queueService.removeNotificationJob(id);
    const notification = await this.prisma.notification.delete({
      where: {
        id,
      },
    });

    this.notificationsGateway.emitNotificationUpdated();

    await this.auditService.log(
      userId,
      'DELETE',
      'NOTIFICATION',
      `Deleted notification "${notification.title}"`,
      notification.id,
      {
        title: notification.title,
        message: notification.message,
        channel: notification.channel,
        status: notification.status,
        scheduledAt: notification.scheduledAt,
      },
    );

    return notification;
  }

  async getStats(userId: string) {
    const total = await this.prisma.notification.count({
      where: {
        userId,
      },
    });

    const grouped = await this.prisma.notification.groupBy({
      by: ['status'],
      where: {
        userId,
      },
      _count: {
        status: true,
      },
    });

    let pending = 0;
    let sent = 0;
    let failed = 0;

    grouped.forEach((item) => {
      switch (item.status) {
        case 'PENDING':
          pending = item._count.status;
          break;

        case 'SENT':
          sent = item._count.status;
          break;

        case 'FAILED':
          failed = item._count.status;
          break;
      }
    });

    return {
      total,
      pending,
      sent,
      failed,
    };
  }
}
