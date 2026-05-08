const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { verifyToken } = require('../middleware/auth');
const { extractWithAI } = require('../services/aiExtractor');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are supported'));
    }
    cb(null, true);
  },
});

router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File is required' });
  }

  const extracted = await pdfParse(req.file.buffer);
  const text = extracted.text || '';

  if (text.trim().length < 50) {
    return res.status(400).json({
      success: false,
      message: 'Could not extract text from PDF. Try a text-based PDF.',
    });
  }

  const result = await extractWithAI(text, req.user.uid, req.file.originalname, 'pdf');
  res.json(result);
});

router.post('/text', verifyToken, async (req, res) => {
  const { text = '', name = 'Pasted text' } = req.body || {};
  const trimmed = String(text).trim();

  if (trimmed.length < 10 || trimmed.length > 50000) {
    return res.status(400).json({
      success: false,
      message: 'Text must be between 10 and 50000 characters',
    });
  }

  const result = await extractWithAI(trimmed, req.user.uid, name, 'text');
  res.json(result);
});

module.exports = router;
