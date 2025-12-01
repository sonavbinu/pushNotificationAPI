import { Request, Response } from 'express';
import admin from 'firebase-admin';
import pino from 'pino';
import { validateSendNotification } from '../middleware/validateBody';
import { attempt, number } from 'joi';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const RETRY_ATTEMPT = Number(process.env.FCM_RETRY_ATTEMPTS || 2);

// Simple timeout helper for async operations
const timeout = (ms: number) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), ms)
  );

interface NotificationRequest {
  token: string;
  title: string;
  body: string;
}

async function sendMessageWithRetry(
  message: admin.messaging.Message,
  attempts = RETRY_ATTEMPT
) {
  let lastError: any;
  for (let i = 0; i <= attempts; i++) {
    try {
      const result = await admin.messaging().send(message);
      return result;
    } catch (err) {
      lastError = err;
      logger.warn({ err, attempt: i }, 'FCM send failed');

      await new Promise(r => setTimeout(r, 200 * (i + 1)));
    }
  }
  throw lastError;
}

export const sendNotification = async (
  req: Request<{}, {}, NotificationRequest>,
  res: Response
): Promise<void> => {
  try {
    const start = Date.now();
    const { token, title, body } = req.body;

    if (!token || !title || !body) {
      res.status(400).json({
        success: false,
        error: 'token, title, and body are required',
      });
      return;
    }

    const message = {
      notification: { title, body },
      token,
    };

    if (!admin.apps.length) {
      res.status(503).json({
        success: false,
        error: 'Firebase admin not initialized',
      });
      return;
    }

    let response;
    try {
      response = await Promise.race([
        admin.messaging().send(message),
        timeout(7000),
      ]);
    } catch (sendErr: any) {
      if (sendErr?.message === 'timeout') {
        console.error('FCM Error: send timeout');
        res.status(504).json({ success: false, error: 'FCM send timeout' });
        return;
      }
      throw sendErr;
    }

    const duration = Date.now() - start;
    console.log(`Notification sent in ${duration}ms`);

    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      response,
      duration,
    });
  } catch (error: any) {
    console.error('FCM Error:', error?.code || error?.message || error);

    const code = error?.code || error?.errorInfo?.code || '';
    const clientErrorsMap: Record<string, { status: number; msg: string }> = {
      'messaging/invalid-registration-token': {
        status: 400,
        msg: 'Invalid registration token',
      },
      'messaging/registration-token-not-registered': {
        status: 410,
        msg: 'Registration token not registered',
      },
      'messaging/invalid-argument': {
        status: 400,
        msg: 'Invalid message argument',
      },
    };

    if (clientErrorsMap[code]) {
      res.status(clientErrorsMap[code].status).json({
        success: false,
        error: clientErrorsMap[code].msg,
        details: error?.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to send notification',
      details: error?.message || error,
    });
  }
};
