"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const helpers_1 = require("./utils/helpers");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_1 = require("./swagger");
const notification_route_1 = __importDefault(require("./routes/notification.route"));
require("./config/firebase");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Connect Database
(0, db_1.connectDB)();
// Middlewares
console.log('Registering CORS middleware...');
app.use((0, cors_1.default)({
    origin: [(0, helpers_1.getEnvVariable)('FRONT_END_URL')],
    credentials: true,
}));
console.log('CORS middleware registered');
console.log('Registering JSON/body parser middleware...');
app.use(express_1.default.json());
console.log('JSON/body parser registered');
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
//Swwagger Docs
console.log('Registering Swagger UI middleware...');
app.use('/api-docs', swagger_1.swaggerUiMiddleware.serve, swagger_1.swaggerUiMiddleware.setup(swagger_1.swaggerSpec));
console.log(swagger_1.swaggerSpec);
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
app.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('Hai there, API is running...');
}));
app.get(/^\/\.well-known(\/.*)?$/, (_req, res) => {
    res.status(204).end();
});
console.log('Mounting /api routes...');
app.use('/api', notification_route_1.default);
console.log('Mounted /api routes');
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger Docs -> http://localhost:${PORT}/api-docs`);
});
