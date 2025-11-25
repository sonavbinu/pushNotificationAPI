import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { getEnvVariable } from './utils/helpers';
import cookieParser from 'cookie-parser';
import { swaggerSpec, swaggerUiMiddleware } from './swagger';
import axios from 'axios';

import { error } from 'console';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect Database
connectDB();

// Middlewares
app.use(
  cors({
    origin: [getEnvVariable('FRONT_END_URL')],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Swwagger Docs
app.use(
  '/api--docs',
  swaggerUiMiddleware.serve,
  swaggerUiMiddleware.setup(swaggerSpec)
);

/**
 * @swagger
 * tags:
 * - name: Notifications
 *   description:Push Notification Endpoints
 */

/**
 * @swagger
 * /send-notifications :
 * post:
 *  summary: Send push notification using Firebase Cloud Messaging
 *  tags: [Notifications]
 *  requestBody :
 *    required:true
 *    content:
 *     application/json:
 *      schema:
 *       type:object
 *       properties:
 *        token:
 *         type:string
 *        example:"DEVICE_FCM_TOKEN"
 *      title:
 *       type:string
 *       example:"Hello "
 *     body:
 *      type:string
 *      example:"This is a push notification !"
 *
 *  responses:
 *   200:
 *    description :Notification sent successfully
 *   500:
 *  description :Error sending notification
 */

app.post('/send-notification', async (req: Request, res: Response) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({
      error: 'token,title, and body are required',
    });
  }
  try {
    const response = await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      {
        to: token,
        notification: { title, body },
      },
      {
        headers: {
          Authorization: `key=${getEnvVariable('FCM_SERVER_KEY')}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.status(200).json({
      message: 'Notification sent!',
      firebase_response: response.data,
    });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({
      error: 'Notification failed',
      details: error.response?.data || error.message,
    });
  }
});
// Root
app.get('/', async (_req, res) => {
  res.send('Hai there, API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger Docs -> http://localhost:${PORT}/api-docs`);
});
