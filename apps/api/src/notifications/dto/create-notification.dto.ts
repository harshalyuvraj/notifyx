import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @IsString()
  @ApiProperty({
    example: 'Interview Reminder',
    description: 'Title of the notification',
  })
  title!: string;

  @IsString()
  @ApiProperty({
    example: 'Your Microsoft interview is tomorrow at 10 AM.',
    description: 'Notification message',
  })
  message!: string;

  @IsString()
  @ApiProperty({
    example: 'EMAIL',
    description: 'Notification channel',
  })
  channel!: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2026-07-22T10:30:00.000Z',
    required: false,
    description: 'UTC time when the notification should be sent',
  })
  scheduledAt?: Date;
}
