import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  async create(userId: string, dto: CreateNotificationDto) {
    if (dto.scheduledAt && new Date(dto.scheduledAt) <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future.');
    }

    if (dto.scheduledAt) {
      const year = new Date(dto.scheduledAt).getUTCFullYear();

      if (year < 2000 || year > 9999) {
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

    return notification;
  }

  findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.notification.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, dto: UpdateNotificationDto) {
    if (dto.scheduledAt) {
      const year = new Date(dto.scheduledAt).getUTCFullYear();

      if (year < 2000 || year > 9999) {
        throw new BadRequestException('Invalid year.');
      }
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

    return notification;
  }

  remove(id: string) {
    return this.prisma.notification.delete({
      where: {
        id,
      },
    });
  }
}
