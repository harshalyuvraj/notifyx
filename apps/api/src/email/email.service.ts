import { Injectable, OnModuleInit } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService implements OnModuleInit {
  constructor(private readonly mailer: MailerService) {}

  async onModuleInit() {
    try {
      console.log('EMAIL_USER:', process.env.EMAIL_USER);
      console.log('HAS_PASSWORD:', !!process.env.EMAIL_PASS);

      await this.mailer.verifyTransporter();

      console.log('SMTP VERIFIED');
    } catch (error) {
      console.error('SMTP VERIFY FAILED');
      console.error(error);
    }
  }

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
