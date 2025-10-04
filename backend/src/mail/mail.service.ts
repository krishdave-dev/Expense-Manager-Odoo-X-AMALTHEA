import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    // Configure based on your email provider
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('MAIL_PORT') || 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendTemporaryPassword(
    email: string,
    name: string,
    tempPassword: string,
    companyName: string,
  ): Promise<void> {
    try {
      // Check if mail configuration is available
      const mailUser = this.configService.get<string>('MAIL_USER');
      const mailPass = this.configService.get<string>('MAIL_PASS');
      
      if (!mailUser || !mailPass) {
        this.logger.warn('Email configuration not found. Skipping email delivery.');
        this.logger.log(`User created: ${name} (${email}) - Temporary password: ${tempPassword}`);
        return;
      }

      const mailOptions = {
        from: this.configService.get<string>('MAIL_FROM') || 'noreply@expense-manager.com',
        to: email,
        subject: `Welcome to ${companyName} - Your Account Details`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to ${companyName}!</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your account has been created in the Expense Management System. Here are your login details:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 4px 8px; border-radius: 4px;">${tempPassword}</code></p>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #856404; margin: 0;"><strong>Important:</strong> You will be required to change this password on your first login for security purposes.</p>
            </div>
            
            <p>Please log in to the system and change your password as soon as possible.</p>
            <p>If you have any questions, please contact your administrator.</p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            <p style="color: #6c757d; font-size: 12px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Temporary password email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);
      
      // Log the credentials for development/testing purposes
      this.logger.warn(`EMAIL DELIVERY FAILED - User credentials for manual delivery:`);
      this.logger.warn(`Name: ${name}`);
      this.logger.warn(`Email: ${email}`);
      this.logger.warn(`Temporary Password: ${tempPassword}`);
      
      // Don't throw error - user creation should still succeed
      this.logger.warn('User created successfully but email delivery failed. Please share credentials manually.');
    }
  }
}