const express = require('express');
const Document = require('../models/Document');
const Task = require('../models/Task');
const { verifyToken } = require('../middleware/auth');
const { deleteCloudinaryFile } = require('../services/fileStorage');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const documents = await Document.find({ userId: req.user.uid }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, documents });
});

router.get('/:id', verifyToken, async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, userId: req.user.uid }).lean();

  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  const tasks = await Task.find({ sourceDocId: document._id, userId: req.user.uid }).lean();
  res.json({ success: true, document, tasks });
});

router.delete('/:id', verifyToken, async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, userId: req.user.uid });

  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  await Task.deleteMany({ sourceDocId: document._id, userId: req.user.uid });
  await deleteCloudinaryFile(document.file);
  await document.deleteOne();

  res.json({ success: true, message: 'Document and tasks deleted' });
});

module.exports = router;
