import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailer: MailerService) {}

  async sendNotification(to: string, title: string, message: string) {
    await this.mailer.sendMail({
      to,
      subject: title,
      template: 'notification',
      context: {
        title,
        message,
      },
    });
  }
}
