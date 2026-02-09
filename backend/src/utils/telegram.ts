import { config } from '../config';
import { logger } from './logger';

type TelegramSendResponse = {
  ok: boolean;
  description?: string;
};

const TELEGRAM_API_BASE = 'https://api.telegram.org';

function hasTelegramConfig(): boolean {
  return Boolean(config.telegram.botToken && config.telegram.chatId);
}

export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!hasTelegramConfig()) {
    logger.debug('Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured');
    return false;
  }

  const url = `${TELEGRAM_API_BASE}/bot${config.telegram.botToken}/sendMessage`;
  const payload: Record<string, string | number | boolean> = {
    chat_id: config.telegram.chatId,
    text,
    disable_web_page_preview: true,
  };

  if (config.telegram.messageThreadId) {
    payload.message_thread_id = config.telegram.messageThreadId;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram API HTTP ${response.status}: ${body}`);
  }

  const result = (await response.json()) as TelegramSendResponse;
  if (!result.ok) {
    throw new Error(`Telegram API rejected message: ${result.description || 'unknown error'}`);
  }

  return true;
}
