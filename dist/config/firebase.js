"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Helper to find service account JSON in various locations (src during dev, dist when compiled)
const candidatePaths = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    path_1.default.join(process.cwd(), 'src', 'config', 'serviceAccountKey.json'),
    path_1.default.join(process.cwd(), 'dist', 'config', 'serviceAccountKey.json'),
    path_1.default.join(__dirname, 'serviceAccountKey.json'),
].filter(Boolean);
let serviceAccount = null;
for (const p of candidatePaths) {
    try {
        if (fs_1.default.existsSync(p)) {
            serviceAccount = require(p);
            console.log(`Loaded Firebase service account from ${p}`);
            break;
        }
    }
    catch (err) {
        // ignore and try next
    }
}
try {
    if (serviceAccount && !firebase_admin_1.default.apps.length) {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
        });
    }
    else if (!firebase_admin_1.default.apps.length) {
        // Attempt to initialize with default credentials if ADC or GOOGLE_APPLICATION_CREDENTIALS is used
        try {
            firebase_admin_1.default.initializeApp();
            console.log('Initialized Firebase admin with default credentials');
        }
        catch (err) {
            console.warn('Firebase admin not initialized (service account not provided and no ADC).');
        }
    }
}
catch (err) {
    console.error('Firebase admin initialization error:', err);
}
exports.default = firebase_admin_1.default;
