import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    this.resend = new Resend(apiKey);
  }

  async sendNotification(
    to: string,
    title: string,
    message: string,
  ): Promise<void> {
    const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await this.resend.emails.send({
      from,
      to,
      subject: title,
      html: this.buildHtml(title, message),
    });

    if (error) {
      throw new Error(`Resend email failed: ${JSON.stringify(error)}`);
    }

    console.log(
      `Email accepted by Resend. Message ID: ${data?.id ?? 'unknown'}`,
    );
  }

  private buildHtml(title: string, message: string): string {
    const escapeHtml = (value: string): string =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const safeTitle = escapeHtml(title);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #f4f4f4;
              font-family: Arial, sans-serif;
            }

            .container {
              width: 100%;
              padding: 40px 0;
            }

            .card {
              max-width: 600px;
              margin: auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            .header {
              background: #2563eb;
              color: white;
              text-align: center;
              padding: 24px;
              font-size: 28px;
              font-weight: bold;
            }

            .content {
              padding: 30px;
            }

            .label {
              font-size: 13px;
              color: #888;
              margin-bottom: 6px;
            }

            .value {
              font-size: 18px;
              margin-bottom: 24px;
            }

            .footer {
              background: #f8f8f8;
              padding: 20px;
              text-align: center;
              font-size: 13px;
              color: #666;
            }
          </style>
        </head>

        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                NotifyX
              </div>

              <div class="content">
                <div class="label">
                  Title
                </div>

                <div class="value">
                  ${safeTitle}
                </div>

                <div class="label">
                  Message
                </div>

                <div class="value">
                  ${safeMessage}
                </div>
              </div>

              <div class="footer">
                This notification was sent automatically by NotifyX.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
