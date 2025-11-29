"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const helpers_1 = require("../utils/helpers");
cloudinary_1.v2.config({
    cloud_name: (0, helpers_1.getEnvVariable)('CLOUDINARY_CLOUD_NAME'),
    api_key: (0, helpers_1.getEnvVariable)('CLOUDINARY_API_KEY'),
    api_secret: (0, helpers_1.getEnvVariable)('CLOUDINARY_API_SECRET'),
});
exports.default = cloudinary_1.v2;
