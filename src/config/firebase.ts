import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Helper to find service account JSON in various locations (src during dev, dist when compiled)
const candidatePaths = [
  process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  path.join(process.cwd(), 'src', 'config', 'serviceAccountKey.json'),
  path.join(process.cwd(), 'dist', 'config', 'serviceAccountKey.json'),
  path.join(__dirname, 'serviceAccountKey.json'),
].filter(Boolean);

let serviceAccount: any = null;

for (const p of candidatePaths) {
  try {
    if (fs.existsSync(p)) {
      serviceAccount = require(p);
      console.log(`Loaded Firebase service account from ${p}`);
      break;
    }
  } catch (err) {
    // ignore and try next
  }
}

try {
  if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else if (!admin.apps.length) {
    // Attempt to initialize with default credentials if ADC or GOOGLE_APPLICATION_CREDENTIALS is used
    try {
      admin.initializeApp();
      console.log('Initialized Firebase admin with default credentials');
    } catch (err) {
      console.warn(
        'Firebase admin not initialized (service account not provided and no ADC).'
      );
    }
  }
} catch (err) {
  console.error('Firebase admin initialization error:', err);
}

export default admin;
