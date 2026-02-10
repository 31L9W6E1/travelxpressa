import { sendTelegramMessage } from '../utils/telegram';
import { emailService } from './email.service';
import { config } from '../config';
import { logger } from '../utils/logger';

// Visa type display names
const VISA_TYPE_NAMES: Record<string, string> = {
  B1_B2: 'B1/B2 Tourist/Business',
  F1: 'F1 Student',
  J1: 'J1 Exchange Visitor',
  H1B: 'H1B Work',
  L1: 'L1 Intracompany Transfer',
  O1: 'O1 Extraordinary Ability',
  K1: 'K1 Fiancé(e)',
  OTHER: 'Other',
};

interface ApplicationNotificationData {
  applicationId: string;
  userId: string;
  userEmail: string;
  userName: string;
  visaType: string;
}

interface PaymentNotificationData extends ApplicationNotificationData {
  paymentId: string;
  invoiceNo: string;
  amount: number;
  currency: string;
}

class NotificationService {
  private formatVisaType(visaType: string): string {
    return VISA_TYPE_NAMES[visaType] || visaType;
  }

  private formatAmount(amount: number, currency: string): string {
    if (currency === 'MNT') {
      return `${amount.toLocaleString()}₮`;
    }
    return `$${(amount / 100).toFixed(2)} ${currency}`;
  }

  /**
   * Send notification when payment is created and pending
   */
  async notifyPaymentPending(data: PaymentNotificationData & { paymentLink: string }): Promise<void> {
    const visaTypeName = this.formatVisaType(data.visaType);
    const amountFormatted = this.formatAmount(data.amount, data.currency);

    // Send Telegram notification to admin
    const telegramMessage = `
💳 *NEW PAYMENT PENDING*
━━━━━━━━━━━━━━━━━━━━━━

👤 *Customer:* ${data.userName}
📧 *Email:* ${data.userEmail}
🎫 *Visa Type:* ${visaTypeName}

💰 *Amount:* ${amountFormatted}
📄 *Invoice:* \`${data.invoiceNo}\`

📋 *Application ID:* \`${data.applicationId}\`

⏳ Waiting for payment...

🔗 [View in Admin Panel](${config.frontendUrl}/admin)
    `.trim();

    try {
      await sendTelegramMessage(telegramMessage);
      logger.info('Telegram notification sent: payment pending', { invoiceNo: data.invoiceNo });
    } catch (error) {
      logger.error('Failed to send Telegram notification', error as Error);
    }

    // Send email to customer
    try {
      await emailService.sendPaymentPending(data.userEmail, {
        userName: data.userName,
        applicationId: data.applicationId,
        visaType: visaTypeName,
        amount: data.amount,
        currency: data.currency,
        invoiceNo: data.invoiceNo,
        paymentLink: data.paymentLink,
      });
    } catch (error) {
      logger.error('Failed to send payment pending email', error as Error);
    }
  }

  /**
   * Send notification when payment is received
   */
  async notifyPaymentReceived(data: PaymentNotificationData): Promise<void> {
    const visaTypeName = this.formatVisaType(data.visaType);
    const amountFormatted = this.formatAmount(data.amount, data.currency);
    const now = new Date();

    // Send Telegram notification to admin
    const telegramMessage = `
✅ *PAYMENT RECEIVED*
━━━━━━━━━━━━━━━━━━━━━━

💰 *Amount:* ${amountFormatted}
📄 *Invoice:* \`${data.invoiceNo}\`

👤 *Customer:* ${data.userName}
📧 *Email:* ${data.userEmail}
🎫 *Visa Type:* ${visaTypeName}

📋 *Application ID:* \`${data.applicationId}\`
⏰ *Time:* ${now.toLocaleString()}

🎉 Application is now SUBMITTED!

🔗 [View in Admin Panel](${config.frontendUrl}/admin)
    `.trim();

    try {
      await sendTelegramMessage(telegramMessage);
      logger.info('Telegram notification sent: payment received', { invoiceNo: data.invoiceNo });
    } catch (error) {
      logger.error('Failed to send Telegram notification', error as Error);
    }

    // Send email to customer
    try {
      await emailService.sendPaymentReceived(data.userEmail, {
        userName: data.userName,
        applicationId: data.applicationId,
        visaType: visaTypeName,
        amount: data.amount,
        currency: data.currency,
        invoiceNo: data.invoiceNo,
        paidAt: now,
      });
    } catch (error) {
      logger.error('Failed to send payment received email', error as Error);
    }
  }

  /**
   * Send notification when application is submitted
   */
  async notifyApplicationSubmitted(data: ApplicationNotificationData): Promise<void> {
    const visaTypeName = this.formatVisaType(data.visaType);
    const now = new Date();

    // Send Telegram notification to admin
    const telegramMessage = `
📋 *NEW APPLICATION SUBMITTED*
━━━━━━━━━━━━━━━━━━━━━━

👤 *Applicant:* ${data.userName}
📧 *Email:* ${data.userEmail}
🎫 *Visa Type:* ${visaTypeName}

📋 *Application ID:*
\`${data.applicationId}\`

⏰ *Submitted:* ${now.toLocaleString()}

🔗 [Review Application](${config.frontendUrl}/admin)
    `.trim();

    try {
      await sendTelegramMessage(telegramMessage);
      logger.info('Telegram notification sent: application submitted', { applicationId: data.applicationId });
    } catch (error) {
      logger.error('Failed to send Telegram notification', error as Error);
    }

    // Send email to customer
    try {
      await emailService.sendApplicationSubmitted(data.userEmail, {
        userName: data.userName,
        applicationId: data.applicationId,
        visaType: visaTypeName,
        submittedAt: now,
      });
    } catch (error) {
      logger.error('Failed to send application submitted email', error as Error);
    }
  }

  /**
   * Send notification when application status changes
   */
  async notifyApplicationStatusChange(
    data: ApplicationNotificationData & {
      newStatus: string;
      adminNotes?: string;
    }
  ): Promise<void> {
    const visaTypeName = this.formatVisaType(data.visaType);
    const now = new Date();

    const statusEmoji: Record<string, string> = {
      UNDER_REVIEW: '🔍',
      COMPLETED: '✅',
      REJECTED: '❌',
      APPROVED: '🎉',
    };

    const emoji = statusEmoji[data.newStatus] || '📋';

    // Send Telegram notification to admin
    const telegramMessage = `
${emoji} *APPLICATION STATUS UPDATE*
━━━━━━━━━━━━━━━━━━━━━━

📋 *Application:* \`${data.applicationId}\`
🎫 *Visa Type:* ${visaTypeName}

👤 *Applicant:* ${data.userName}
📧 *Email:* ${data.userEmail}

📊 *New Status:* ${data.newStatus.replace(/_/g, ' ')}
${data.adminNotes ? `📝 *Notes:* ${data.adminNotes}` : ''}

⏰ *Updated:* ${now.toLocaleString()}
    `.trim();

    try {
      await sendTelegramMessage(telegramMessage);
      logger.info('Telegram notification sent: status change', {
        applicationId: data.applicationId,
        newStatus: data.newStatus,
      });
    } catch (error) {
      logger.error('Failed to send Telegram notification', error as Error);
    }
  }

  /**
   * Send daily summary to admin (can be triggered by cron job)
   */
  async sendDailySummary(stats: {
    newApplications: number;
    completedApplications: number;
    totalRevenue: number;
    pendingPayments: number;
  }): Promise<void> {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const telegramMessage = `
📊 *DAILY SUMMARY*
━━━━━━━━━━━━━━━━━━━━━━
📅 ${today}

📋 *Applications:*
• New: ${stats.newApplications}
• Completed: ${stats.completedApplications}

💰 *Revenue:*
• Today: ${stats.totalRevenue.toLocaleString()}₮
• Pending: ${stats.pendingPayments} payment(s)

🔗 [View Dashboard](${config.frontendUrl}/admin)
    `.trim();

    try {
      await sendTelegramMessage(telegramMessage);
      logger.info('Daily summary sent');
    } catch (error) {
      logger.error('Failed to send daily summary', error as Error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
