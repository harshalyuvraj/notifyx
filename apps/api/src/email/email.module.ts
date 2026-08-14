import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,

        family: 4,

        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },

        tls: {
          rejectUnauthorized: false,
        },
      },

      defaults: {
        from: `"NotifyX" <${process.env.EMAIL_USER}>`,
      },

      template: {
        dir: join(__dirname, '..', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],

  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}