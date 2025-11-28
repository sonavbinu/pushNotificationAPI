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
console.log('Registering CORS middleware...');
app.use(
  cors({
    origin: [getEnvVariable('FRONT_END_URL')],
    credentials: true,
  })
);
console.log('CORS middleware registered');

console.log('Registering JSON/body parser middleware...');
app.use(express.json());
console.log('JSON/body parser registered');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Swwagger Docs
console.log('Registering Swagger UI middleware...');
app.use(
  '/api-docs',
  swaggerUiMiddleware.serve,
  swaggerUiMiddleware.setup(swaggerSpec)
);
console.log(swaggerSpec);

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
console.log('Registering root endpoints...');
app.get('/', async (_req, res) => {
  res.send('Hai there, API is running...');
});
app.get(/^\/\.well-known(\/.*)?$/, (_req, res) => {
  res.status(204).end();
});
console.log('Mounting /api routes...');
app.use('/api', notificationRoute);
console.log('Mounted /api routes');

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger Docs -> http://localhost:${PORT}/api-docs`);
});
