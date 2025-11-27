import { Request, Response } from 'express';
import { getEnvVariable } from '../utils/helpers';
import axios from 'axios';
import admin from '../config/firebase';

export const sendNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, title, body } = req.body;
    if (!token || !title || !body) {
      res.status(400).json({
        error: 'token,title, and body are required',
      });
      return;
    }
    const message = {
      notification: {
        title,
        body,
      },
      token,
    };
    // ensure admin SDK is initialized
    if (!admin.apps.length) {
      res.status(500).json({
        error: 'Firebase admin not initialized',
      });
      return;
    }

    const response = await admin.messaging().send(message);

    res.status(200).json({
      message: 'Notification sent successfully',
      response,
    });
    return;
  } catch (error: any) {
    console.error('FCM Error:', error?.code || error?.message || error);

    // Map Firebase admin messaging error codes to HTTP status codes
    // Examples: messaging/invalid-registration-token, messaging/registration-token-not-registered
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
      res
        .status(clientErrorsMap[code].status)
        .json({ error: clientErrorsMap[code].msg, details: error?.message });
      return;
    }

    // default: internal server error
    res.status(500).json({
      error: 'Failed to send notification',
      details: error?.message || error,
    });
    return;
  }
};
