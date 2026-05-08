const admin = require('firebase-admin');

function initFirebase() {
  if (admin.apps.length) {
    return admin;
  }

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!rawServiceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not defined');
  }

  const serviceAccount = JSON.parse(rawServiceAccount);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin;
}

module.exports = initFirebase();
