const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined');
  }

  await mongoose.connect(uri);
  isConnected = true;
  return mongoose.connection;
}

module.exports = connectDB;
