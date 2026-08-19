import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAdminOverview() {
    const totalUsers = await this.prisma.user.count();

    const notifications = await this.prisma.notification.findMany({
      select: {
        status: true,
      },
    });

    return {
      totalUsers,
      totalNotifications: notifications.length,
      sent: notifications.filter((n) => n.status === 'SENT').length,
      pending: notifications.filter((n) => n.status === 'PENDING').length,
      failed: notifications.filter((n) => n.status === 'FAILED').length,
    };
  }

  async getAdminStats() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        notifications: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      total: user.notifications.length,
      sent: user.notifications.filter((n) => n.status === 'SENT').length,
      pending: user.notifications.filter((n) => n.status === 'PENDING').length,
      failed: user.notifications.filter((n) => n.status === 'FAILED').length,
    }));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found.');
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailInUse = await this.prisma.user.findUnique({
        where: {
          email: updateUserDto.email,
        },
      });

      if (emailInUse) {
        throw new ConflictException('Email is already registered.');
      }
    }

    const data: {
      email?: string;
      name?: string;
      password?: string;
    } = {};

    if (updateUserDto.email !== undefined) {
      data.email = updateUserDto.email;
    }

    if (updateUserDto.name !== undefined) {
      data.name = updateUserDto.name;
    }

    if (updateUserDto.password !== undefined) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found.');
    }

    return this.prisma.user.delete({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
