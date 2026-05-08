require('dotenv').config();

const connectDB = require('../config/db');
const firebaseAdmin = require('../config/firebase');
const Document = require('../models/Document');
const Task = require('../models/Task');

const DEMO_EMAIL = 'demo@secondbrain.ai';

async function run() {
  await connectDB();

  try {
    const user = await firebaseAdmin.auth().getUserByEmail(DEMO_EMAIL);
    await Task.deleteMany({ userId: user.uid });
    await Document.deleteMany({ userId: user.uid });
  } catch (error) {
    console.log('Demo user not found in Firebase. Nothing to clear.');
  }

  console.log('Demo data cleared.');
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
