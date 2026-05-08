const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'docx', 'xlsx', 'csv', 'text', 'email'], default: 'text' },
  file: {
    url: String,
    secureUrl: String,
    publicId: String,
    filename: String,
    mimetype: String,
    size: Number,
    format: String,
    resourceType: String,
    cloudinaryFolder: String,
  },
  rawText: String,
  summary: String,
  insights: [String],
  taskCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Document', documentSchema);
