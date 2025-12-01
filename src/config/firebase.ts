import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

export function initFirebase() {
  if (admin.apps.length) return admin.app();

  // Prefer GOOGLE_APPLICATION_CREDENTIALS file (set in .env)
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (envPath && fs.existsSync(path.resolve(envPath))) {
    const serviceAccount = require(path.resolve(envPath));
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  // Fallback: decode base64 JSON if provided
  if (process.env.SERVICE_ACCOUNT_BASE64) {
    const json = Buffer.from(
      process.env.SERVICE_ACCOUNT_BASE64,
      'base64'
    ).toString('utf8');
    const serviceAccount = JSON.parse(json);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  // Last fallback: use application default credentials (e.g., GCE/Cloud Run)
  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
