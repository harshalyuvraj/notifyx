import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class EmailService {
  private readonly gmail;
  private readonly from: string;

  constructor() {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const user = process.env.GMAIL_USER;

    if (!clientId) {
      throw new Error('GMAIL_CLIENT_ID is not configured');
    }

    if (!clientSecret) {
      throw new Error('GMAIL_CLIENT_SECRET is not configured');
    }

    if (!refreshToken) {
      throw new Error('GMAIL_REFRESH_TOKEN is not configured');
    }

    if (!user) {
      throw new Error('GMAIL_USER is not configured');
    }

    const auth = new google.auth.OAuth2(clientId, clientSecret);

    auth.setCredentials({
      refresh_token: refreshToken,
    });

    this.gmail = google.gmail({
      version: 'v1',
      auth,
    });

    this.from = user;
  }

  async sendNotification(
    to: string,
    title: string,
    message: string,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: title,
      html: this.buildNotificationHtml(title, message),
    });
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    verificationUrl: string,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Verify your NotifyX email address',
      html: this.buildVerificationHtml(name, verificationUrl),
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Reset your NotifyX password',
      html: this.buildPasswordResetHtml(name, resetUrl),
    });
  }

  private async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const message = [
      `From: NotifyX <${this.from}>`,
      `To: ${params.to}`,
      `Subject: ${this.encodeHeader(params.subject)}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      params.html,
    ].join('\r\n');

    const raw = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    try {
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw,
        },
      });

      console.log(`Gmail API email sent. Message ID: ${response.data.id}`);
    } catch (error) {
      console.error('Gmail API email failed:', error);
      throw new Error('Email delivery failed.');
    }
  }

  private encodeHeader(value: string): string {
    const needsEncoding = /[^\x20-\x7E]/.test(value);

    if (!needsEncoding) {
      return value;
    }

    return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private buildNotificationHtml(title: string, message: string): string {
    const safeTitle = this.escapeHtml(title);
    const safeMessage = this.escapeHtml(message).replace(/\n/g, '<br />');

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

  private buildVerificationHtml(name: string, verificationUrl: string): string {
    const safeName = this.escapeHtml(name);
    const safeUrl = this.escapeHtml(verificationUrl);

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
              color: #222;
            }

            .button {
              display: inline-block;
              padding: 12px 20px;
              background: #2563eb;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }

            .link {
              word-break: break-all;
              color: #2563eb;
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
                <h2>Hello ${safeName},</h2>

                <p>
                  Please verify your email address to activate
                  your NotifyX account.
                </p>

                <p style="text-align: center;">
                  <a class="button" href="${safeUrl}">
                    Verify Email
                  </a>
                </p>

                <p>
                  This link expires in 30 minutes.
                </p>

                <p>
                  If the button doesn't work, copy and paste
                  this link into your browser:
                </p>

                <p class="link">
                  ${safeUrl}
                </p>
              </div>

              <div class="footer">
                This email was sent automatically by NotifyX.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private buildPasswordResetHtml(name: string, resetUrl: string): string {
    const safeName = this.escapeHtml(name);
    const safeUrl = this.escapeHtml(resetUrl);

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
              color: #222;
            }

            .button {
              display: inline-block;
              padding: 12px 20px;
              background: #2563eb;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }

            .link {
              word-break: break-all;
              color: #2563eb;
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
                <h2>Hello ${safeName},</h2>

                <p>
                  We received a request to reset your NotifyX
                  password.
                </p>

                <p style="text-align: center;">
                  <a class="button" href="${safeUrl}">
                    Reset Password
                  </a>
                </p>

                <p>
                  This link expires in 30 minutes.
                </p>

                <p>
                  If you did not request a password reset, you
                  can safely ignore this email.
                </p>

                <p>
                  If the button doesn't work, copy and paste
                  this link into your browser:
                </p>

                <p class="link">
                  ${safeUrl}
                </p>
              </div>

              <div class="footer">
                This email was sent automatically by NotifyX.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
