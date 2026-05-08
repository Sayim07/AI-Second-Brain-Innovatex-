const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  sourceDocId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  task: { type: String, required: true },
  deadline: { type: Date, default: null },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: -1, deadline: 1 });
taskSchema.index({ userId: 1, deadline: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
