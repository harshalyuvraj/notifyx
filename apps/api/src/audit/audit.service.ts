import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    userId: string,
    action: string,
    entity: string,
    description: string,
    entityId?: string,
    snapshot?: any,
    previousSnapshot?: any,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        description,
        snapshot,
        previousSnapshot,
      },
    });
  }

  async findAll(userId: string, page = 1, limit = 10) {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        userId,
        entity: 'NOTIFICATION',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const grouped = new Map<
      string,
      {
        notificationId: string;
        latestAction: string;
        latestTime: Date;
        history: any[];
      }
    >();

    for (const log of logs) {
      const key = log.entityId ?? log.id;

      if (!grouped.has(key)) {
        grouped.set(key, {
          notificationId: key,
          latestAction: log.action,
          latestTime: log.createdAt,
          history: [],
        });
      }

      const group = grouped.get(key)!;

      group.history.push({
        id: log.id,
        action: log.action,
        description: log.description,
        snapshot: log.snapshot,
        previousSnapshot: log.previousSnapshot,
        createdAt: log.createdAt,
      });

      if (log.createdAt > group.latestTime) {
        group.latestTime = log.createdAt;
        group.latestAction = log.action;
      }
    }

    const groupedLogs = Array.from(grouped.values()).sort(
      (a, b) => b.latestTime.getTime() - a.latestTime.getTime(),
    );

    const total = groupedLogs.length;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      logs: groupedLogs.slice(start, end),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
