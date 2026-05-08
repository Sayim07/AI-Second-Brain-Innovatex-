const express = require('express');
const Task = require('../models/Task');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

function sortTasks(tasks) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return tasks.sort((left, right) => {
    const priorityDiff = priorityOrder[left.priority] - priorityOrder[right.priority];
    if (priorityDiff !== 0) return priorityDiff;

    if (!left.deadline && right.deadline) return 1;
    if (left.deadline && !right.deadline) return -1;
    if (!left.deadline && !right.deadline) return 0;
    return new Date(left.deadline) - new Date(right.deadline);
  });
}

router.get('/', verifyToken, async (req, res) => {
  const { status, priority, search } = req.query;
  const query = { userId: req.user.uid };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) query.task = { $regex: search, $options: 'i' };

  const tasks = await Task.find(query)
    .populate('sourceDocId', 'name type')
    .lean();

  const sortedTasks = sortTasks(tasks);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const counts = {
    total: await Task.countDocuments({ userId: req.user.uid }),
    pending: await Task.countDocuments({ userId: req.user.uid, status: 'pending' }),
    inProgress: await Task.countDocuments({ userId: req.user.uid, status: 'in-progress' }),
    completed: await Task.countDocuments({ userId: req.user.uid, status: 'completed' }),
    overdue: await Task.countDocuments({
      userId: req.user.uid,
      status: { $ne: 'completed' },
      deadline: { $lt: today },
    }),
  };

  res.json({ success: true, tasks: sortedTasks, counts });
});

router.patch('/:id', verifyToken, async (req, res) => {
  const { status } = req.body || {};
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  if (task.userId !== req.user.uid) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  task.status = status;
  task.updatedAt = new Date();
  await task.save();

  res.json({ success: true, task });
});

router.delete('/:id', verifyToken, async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  if (task.userId !== req.user.uid) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  await task.deleteOne();
  res.json({ success: true, message: 'Task deleted' });
});

module.exports = router;
