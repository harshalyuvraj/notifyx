import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        ...dto,
        userId,
      },
    });
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

  update(id: string, dto: UpdateNotificationDto) {
    return this.prisma.notification.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.notification.delete({
      where: {
        id,
      },
    });
  }
}
