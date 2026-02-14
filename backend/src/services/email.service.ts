import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

// Email templates
const EMAIL_TEMPLATES = {
  applicationSubmitted: (data: {
    userName: string;
    applicationId: string;
    visaType: string;
    submittedAt: string;
  }) => ({
    subject: `✅ Application Submitted Successfully - ${data.visaType} Visa`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Submitted</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
        ✈️ visamn
      </h1>
      <p style="color: #94a3b8; margin: 10px 0 0; font-size: 14px;">
        Your Visa Application Journey
      </p>
    </div>

    <!-- Content -->
    <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <!-- Success Icon -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">✓</span>
        </div>
      </div>

      <h2 style="color: #1e293b; margin: 0 0 10px; font-size: 24px; text-align: center;">
        Application Submitted!
      </h2>

      <p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
        Hello ${data.userName}, your visa application has been successfully submitted and is now being reviewed by our team.
      </p>

      <!-- Application Details Card -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
        <h3 style="color: #475569; margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
          Application Details
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Application ID</td>
            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; font-family: monospace;">${data.applicationId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Visa Type</td>
            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; font-weight: 600;">${data.visaType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Submitted</td>
            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${data.submittedAt}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Status</td>
            <td style="padding: 8px 0; text-align: right;">
              <span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                SUBMITTED
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- What's Next -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1e293b; margin: 0 0 16px; font-size: 18px;">What happens next?</h3>
        <div style="display: flex; margin-bottom: 12px;">
          <div style="width: 24px; height: 24px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
            <span style="color: #1d4ed8; font-size: 12px; font-weight: 600;">1</span>
          </div>
          <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">Our team reviews your application (1-2 business days)</p>
        </div>
        <div style="display: flex; margin-bottom: 12px;">
          <div style="width: 24px; height: 24px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
            <span style="color: #1d4ed8; font-size: 12px; font-weight: 600;">2</span>
          </div>
          <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">We'll contact you if additional information is needed</p>
        </div>
        <div style="display: flex;">
          <div style="width: 24px; height: 24px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
            <span style="color: #1d4ed8; font-size: 12px; font-weight: 600;">3</span>
          </div>
          <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.5;">Receive your completed application via email</p>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${config.frontendUrl}/profile" style="display: inline-block; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          View My Applications
        </a>
      </div>

      <!-- Support -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 8px;">
          Questions? We're here to help.
        </p>
        <a href="mailto:support@visamn.com" style="color: #3b82f6; text-decoration: none; font-size: 14px;">
          support@visamn.com
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px;">
        © ${new Date().getFullYear()} visamn. All rights reserved.
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        You're receiving this email because you submitted a visa application.
      </p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Hello ${data.userName},

Your visa application has been successfully submitted!

Application Details:
- Application ID: ${data.applicationId}
- Visa Type: ${data.visaType}
- Submitted: ${data.submittedAt}
- Status: SUBMITTED

What happens next?
1. Our team reviews your application (1-2 business days)
2. We'll contact you if additional information is needed
3. Receive your completed application via email

View your application: ${config.frontendUrl}/profile

Questions? Contact us at support@visamn.com

© ${new Date().getFullYear()} visamn
    `,
  }),

  paymentReceived: (data: {
    userName: string;
    applicationId: string;
    visaType: string;
    amount: string;
    invoiceNo: string;
    paidAt: string;
  }) => ({
    subject: `💳 Payment Received - ${data.invoiceNo}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
        ✈️ visamn
      </h1>
      <p style="color: #a7f3d0; margin: 10px 0 0; font-size: 14px;">
        Payment Confirmation
      </p>
    </div>

    <!-- Content -->
    <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <!-- Success Icon -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">💳</span>
        </div>
      </div>

      <h2 style="color: #1e293b; margin: 0 0 10px; font-size: 24px; text-align: center;">
        Payment Successful!
      </h2>

      <p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
        Thank you, ${data.userName}! Your payment has been received and your application is now being processed.
      </p>

      <!-- Payment Details Card -->
      <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
        <h3 style="color: #166534; margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
          Payment Receipt
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Invoice Number</td>
            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right; font-family: monospace;">${data.invoiceNo}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Amount Paid</td>
            <td style="padding: 8px 0; color: #166534; font-size: 18px; text-align: right; font-weight: 700;">${data.amount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Application</td>
            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${data.visaType} Visa</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Date</td>
            <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${data.paidAt}</td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${config.frontendUrl}/profile" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Track Application Status
        </a>
      </div>

      <!-- Support -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          Save this email for your records.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} visamn. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Hello ${data.userName},

Payment Successful!

Your payment has been received and your application is now being processed.

Payment Receipt:
- Invoice Number: ${data.invoiceNo}
- Amount Paid: ${data.amount}
- Application: ${data.visaType} Visa
- Date: ${data.paidAt}

Track your application: ${config.frontendUrl}/profile

Save this email for your records.

© ${new Date().getFullYear()} visamn
    `,
  }),

  paymentPending: (data: {
    userName: string;
    applicationId: string;
    visaType: string;
    amount: string;
    invoiceNo: string;
    paymentLink: string;
  }) => ({
    subject: `⏳ Complete Your Payment - ${data.visaType} Visa Application`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Payment</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
        ✈️ visamn
      </h1>
      <p style="color: #fef3c7; margin: 10px 0 0; font-size: 14px;">
        Payment Required
      </p>
    </div>

    <!-- Content -->
    <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background: #fef3c7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">⏳</span>
        </div>
      </div>

      <h2 style="color: #1e293b; margin: 0 0 10px; font-size: 24px; text-align: center;">
        One More Step!
      </h2>

      <p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
        Hi ${data.userName}, your ${data.visaType} visa application is almost complete. Please complete your payment to submit.
      </p>

      <!-- Payment Details -->
      <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 24px; margin-bottom: 30px; text-align: center;">
        <p style="color: #92400e; margin: 0 0 8px; font-size: 14px;">Amount Due</p>
        <p style="color: #1e293b; margin: 0; font-size: 32px; font-weight: 700;">${data.amount}</p>
        <p style="color: #92400e; margin: 8px 0 0; font-size: 12px;">Invoice: ${data.invoiceNo}</p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${data.paymentLink}" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: 600;">
          Complete Payment Now
        </a>
      </div>

      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        This payment link expires in 24 hours.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} visamn. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Hi ${data.userName},

Your ${data.visaType} visa application is almost complete!

Please complete your payment to submit your application.

Amount Due: ${data.amount}
Invoice: ${data.invoiceNo}

Complete Payment: ${data.paymentLink}

This payment link expires in 24 hours.

© ${new Date().getFullYear()} visamn
    `,
  }),

  passwordReset: (data: {
    userName: string;
    resetLink: string;
    expiresInMinutes: number;
  }) => ({
    subject: 'Reset Your visamn Password',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
        ✈️ visamn
      </h1>
      <p style="color: #94a3b8; margin: 10px 0 0; font-size: 14px;">
        Password Reset Request
      </p>
    </div>

    <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 24px;">Reset your password</h2>
      <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Hello ${data.userName}, we received a request to reset your password.
      </p>
      <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        Click the button below to set a new password. This link expires in ${data.expiresInMinutes} minutes.
      </p>

      <div style="text-align: center; margin: 0 0 24px;">
        <a href="${data.resetLink}" style="display: inline-block; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Reset Password
        </a>
      </div>

      <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Hello ${data.userName},

We received a request to reset your visamn password.

Reset link (expires in ${data.expiresInMinutes} minutes):
${data.resetLink}

If you did not request this, you can ignore this email.
    `,
  }),
};

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
      logger.warn('Email service not configured: Missing SMTP credentials');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

    // Verify connection
    this.transporter.verify((error: Error | null) => {
      if (error) {
        logger.error('Email transporter verification failed', error);
        this.transporter = null;
      } else {
        logger.info('Email service ready');
      }
    });
  }

  private async send(to: string, subject: string, html: string, text: string): Promise<boolean> {
    if (!this.transporter) {
      logger.debug('Email not sent: transporter not configured', { to, subject });
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: `"visamn" <${config.smtp.from}>`,
        to,
        subject,
        html,
        text,
      });

      logger.info('Email sent successfully', { to, subject });
      return true;
    } catch (error) {
      logger.error('Failed to send email', error as Error, { to, subject });
      return false;
    }
  }

  /**
   * Send application submitted confirmation email
   */
  async sendApplicationSubmitted(
    email: string,
    data: {
      userName: string;
      applicationId: string;
      visaType: string;
      submittedAt: Date;
    }
  ): Promise<boolean> {
    const template = EMAIL_TEMPLATES.applicationSubmitted({
      ...data,
      submittedAt: data.submittedAt.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    });

    return this.send(email, template.subject, template.html, template.text);
  }

  /**
   * Send payment received confirmation email
   */
  async sendPaymentReceived(
    email: string,
    data: {
      userName: string;
      applicationId: string;
      visaType: string;
      amount: number;
      currency: string;
      invoiceNo: string;
      paidAt: Date;
    }
  ): Promise<boolean> {
    const formattedAmount = data.currency === 'MNT'
      ? `${data.amount.toLocaleString()}₮`
      : `$${(data.amount / 100).toFixed(2)}`;

    const template = EMAIL_TEMPLATES.paymentReceived({
      ...data,
      amount: formattedAmount,
      paidAt: data.paidAt.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    });

    return this.send(email, template.subject, template.html, template.text);
  }

  /**
   * Send payment pending reminder email
   */
  async sendPaymentPending(
    email: string,
    data: {
      userName: string;
      applicationId: string;
      visaType: string;
      amount: number;
      currency: string;
      invoiceNo: string;
      paymentLink: string;
    }
  ): Promise<boolean> {
    const formattedAmount = data.currency === 'MNT'
      ? `${data.amount.toLocaleString()}₮`
      : `$${(data.amount / 100).toFixed(2)}`;

    const template = EMAIL_TEMPLATES.paymentPending({
      ...data,
      amount: formattedAmount,
    });

    return this.send(email, template.subject, template.html, template.text);
  }

  async sendPasswordReset(
    email: string,
    data: {
      userName: string;
      resetLink: string;
      expiresInMinutes: number;
    }
  ): Promise<boolean> {
    const template = EMAIL_TEMPLATES.passwordReset(data);
    return this.send(email, template.subject, template.html, template.text);
  }
}

// Export singleton instance
export const emailService = new EmailService();
