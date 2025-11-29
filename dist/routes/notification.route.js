"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const router = (0, express_1.Router)();
// Define routes relative to the mount point (e.g. app.use('/api', notificationRoute))
router.post('/send-notification', notification_controller_1.sendNotification);
exports.default = router;
