import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
// In production, this should be an environment variable
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY is not set. Email functionality will be disabled.');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export class EmailService {
  private static instance: EmailService;
  private isConfigured: boolean;

  private constructor() {
    this.isConfigured = !!process.env.SENDGRID_API_KEY;
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async sendEmail({ to, subject, text, html }: EmailOptions): Promise<void> {
    if (!this.isConfigured) {
      console.warn('Email service is not configured. Skipping email send.');
      return;
    }

    try {
      const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@momentumodds.com',
        subject,
        text,
        html,
      };

      await sgMail.send(msg);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email. Please try again later.');
    }
  }

  public async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    const subject = 'Reset Your Momentum Odds Password';
    const text = `
      You requested a password reset for your Momentum Odds account.
      
      Click the following link to reset your password:
      ${resetUrl}
      
      This link will expire in 30 minutes.
      
      If you didn't request this reset, you can safely ignore this email.
      
      Best regards,
      The Momentum Odds Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00FF8B;">Reset Your Password</h2>
        
        <p>You requested a password reset for your Momentum Odds account.</p>
        
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #00FF8B; color: black; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold;
                    display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This link will expire in 30 minutes.<br>
          If you didn't request this reset, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px;">
          Best regards,<br>
          The Momentum Odds Team
        </p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, text, html });
  }

  public async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = 'Welcome to Momentum Odds!';
    const text = `
      Welcome to Momentum Odds, ${name}!
      
      Thank you for creating an account. We're excited to have you on board.
      
      Get started by exploring our live odds and momentum indicators.
      
      If you have any questions, feel free to reach out to our support team.
      
      Best regards,
      The Momentum Odds Team
    `;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00FF8B;">Welcome to Momentum Odds!</h2>
        
        <p>Hi ${name},</p>
        
        <p>Thank you for creating an account. We're excited to have you on board!</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background-color: #00FF8B; color: black; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold;
                    display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        
        <p>Get started by exploring our:</p>
        <ul>
          <li>Live odds tracking</li>
          <li>Momentum indicators</li>
          <li>Player prop edges</li>
        </ul>
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px;">
          Best regards,<br>
          The Momentum Odds Team
        </p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, text, html });
  }
} 