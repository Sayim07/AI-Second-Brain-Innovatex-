require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const processRoutes = require('./routes/process');
const taskRoutes = require('./routes/tasks');
const askRoutes = require('./routes/ask');
const documentRoutes = require('./routes/documents');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = ['http://localhost:5173'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || !isProduction || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const processLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', apiLimiter);
app.use('/api/process', processLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/process', processRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ask', askRoutes);
app.use('/api/documents', documentRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.use(errorHandler);

const port = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});

if (process.env.NODE_ENV === 'production' && process.env.RENDER_URL) {
  setInterval(() => {
    fetch(`${process.env.RENDER_URL}/health`).catch(() => {});
  }, 14 * 60 * 1000);
}
