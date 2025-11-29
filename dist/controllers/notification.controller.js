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
exports.sendNotification = void 0;
const firebase_1 = __importDefault(require("../config/firebase"));
// Simple timeout helper for async operations
const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
const sendNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        if (!firebase_1.default.apps.length) {
            res.status(503).json({
                success: false,
                error: 'Firebase admin not initialized',
            });
            return;
        }
        let response;
        try {
            response = yield Promise.race([
                firebase_1.default.messaging().send(message),
                timeout(7000),
            ]);
        }
        catch (sendErr) {
            if ((sendErr === null || sendErr === void 0 ? void 0 : sendErr.message) === 'timeout') {
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
    }
    catch (error) {
        console.error('FCM Error:', (error === null || error === void 0 ? void 0 : error.code) || (error === null || error === void 0 ? void 0 : error.message) || error);
        const code = (error === null || error === void 0 ? void 0 : error.code) || ((_a = error === null || error === void 0 ? void 0 : error.errorInfo) === null || _a === void 0 ? void 0 : _a.code) || '';
        const clientErrorsMap = {
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
                details: error === null || error === void 0 ? void 0 : error.message,
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Failed to send notification',
            details: (error === null || error === void 0 ? void 0 : error.message) || error,
        });
    }
});
exports.sendNotification = sendNotification;
