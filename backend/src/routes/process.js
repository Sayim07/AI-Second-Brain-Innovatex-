const express = require('express');
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');
const { extractWithAI } = require('../services/aiExtractor');
const { storeAndExtractUpload } = require('../services/fileStorage');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowedMimeTypes = new Set([
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel',
    ]);

    const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.csv'];
    const lowerName = String(file.originalname || '').toLowerCase();
    const hasAllowedExtension = allowedExtensions.some((extension) => lowerName.endsWith(extension));

    if (!allowedMimeTypes.has(file.mimetype) && !hasAllowedExtension) {
      return cb(new Error('Supported file types are PDF, DOCX, XLSX, and CSV'));
    }
    cb(null, true);
  },
});

router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File is required' });
  }

  try {
    const { text, fileMeta, type } = await storeAndExtractUpload(req.file);

    if (text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract enough text from the uploaded file. Try a text-based file.',
      });
    }

    const result = await extractWithAI(text, req.user.uid, req.file.originalname, type, fileMeta);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to process uploaded file',
    });
  }
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
