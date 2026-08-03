import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/request-with-user';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({
    summary: 'Create a notification',
    description:
      'Creates a notification. If scheduledAt is provided, it will be sent automatically at that time.',
  })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(req.user.userId, dto);
  }

  @ApiOperation({
    summary: 'Get all notifications',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns all notifications belonging to the authenticated user.',
  })
  @Get('stats')
  getStats(@Req() req: RequestWithUser) {
    return this.notificationsService.getStats(req.user.userId);
  }

  @ApiOperation({
    summary: 'Get paginated notifications',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated notifications for the authenticated user.',
  })
  @Get()
  findAll(
    @Req() req: RequestWithUser,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
    @Query('search') search = '',
  ) {
    return this.notificationsService.findAll(
      req.user.userId,
      Number(page),
      Number(limit),
      search,
    );
  }

  @ApiOperation({
    summary: 'Get notification by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a notification.',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found.',
  })
  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.notificationsService.findOne(req.user.userId, id);
  }

  @ApiOperation({
    summary: 'Update notification',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully.',
  })
  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(req.user.userId, id, dto);
  }

  @ApiOperation({
    summary: 'Delete notification',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully.',
  })
  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.notificationsService.remove(req.user.userId, id);
  }
}
