import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { getEnvVariable } from './utils/helpers';
import cookieParser from 'cookie-parser';
import { swaggerSpec, swaggerUiMiddleware } from './swagger';
import axios from 'axios';
import notificationRoute from './routes/notification.route';
import './config/firebase';

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
  '/api-docs',
  swaggerUiMiddleware.serve,
  swaggerUiMiddleware.setup(swaggerSpec)
);

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: Push Notification Endpoints
 */

/**
 * @swagger
 * /api/send-notification:
 *   post:
 *     summary: Send push notification using Firebase Cloud Messaging
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "DEVICE_FCM_TOKEN"
 *               title:
 *                 type: string
 *                 example: "Hello"
 *               body:
 *                 type: string
 *                 example: "This is a push notification!"
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       500:
 *         description: Error sending notification
 */

// Root
app.get('/', async (_req, res) => {
  res.send('Hai there, API is running...');
});
app.use('/api', notificationRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger Docs -> http://localhost:${PORT}/api-docs`);
});
