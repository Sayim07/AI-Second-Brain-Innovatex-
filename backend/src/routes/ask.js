const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Document = require('../models/Document');
const Task = require('../models/Task');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

function isPresetQuestion(question) {
  const normalized = question.trim().toLowerCase();
  return [
    'what should i do today?',
    'what is most urgent?',
    'what are my upcoming deadlines?',
    'summarize everything',
  ].includes(normalized);
}

function buildPresetAnswer(question, documents, tasks) {
  const normalized = question.trim().toLowerCase();

  if (normalized === 'what should i do today?') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTasks = tasks.filter((task) => {
      if (!task.deadline) return false;
      const deadline = new Date(task.deadline);
      deadline.setHours(0, 0, 0, 0);
      return deadline.getTime() === today.getTime() || task.priority === 'high';
    });
    return todayTasks.length
      ? `Focus on these tasks today: ${todayTasks.slice(0, 5).map((task) => task.task).join('; ')}.`
      : 'You do not have any urgent tasks for today.';
  }

  if (normalized === 'what is most urgent?') {
    const urgent = tasks.filter((task) => task.priority === 'high').slice(0, 3);
    return urgent.length
      ? `Your most urgent tasks are: ${urgent.map((task) => task.task).join('; ')}.`
      : 'You do not have any high-priority tasks right now.';
  }

  if (normalized === 'what are my upcoming deadlines?') {
    const now = new Date();
    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    const upcoming = tasks.filter((task) => task.deadline && new Date(task.deadline) >= now && new Date(task.deadline) <= inSevenDays);
    return upcoming.length
      ? `Upcoming deadlines: ${upcoming.map((task) => `${task.task} (${new Date(task.deadline).toLocaleDateString()})`).join('; ')}.`
      : 'There are no deadlines in the next 7 days.';
  }

  if (normalized === 'summarize everything') {
    return documents.length
      ? documents.map((doc) => `${doc.name}: ${doc.summary || 'No summary available.'}`).join(' ')
      : 'No documents have been uploaded yet.';
  }

  return '';
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

function buildPrompt(question, documents, taskLines, conversationHistory) {
  const docsContext = documents
    .map((doc) => [
      `Document: ${doc.name}`,
      `Summary: ${doc.summary || ''}`,
      `Key Insights: ${(doc.insights || []).join(', ')}`,
      `Content Preview: ${(doc.rawText || '').slice(0, 1000)}`,
      '---',
    ].join('\n'))
    .join('\n');

  const tasksContext = taskLines
    .map((task) => `- ${task.task} | Priority: ${task.priority} | Deadline: ${task.deadline || 'No deadline'} | Source: ${task.sourceDocId?.name || 'Unknown'}`)
    .join('\n');

  const historyContext = Array.isArray(conversationHistory) && conversationHistory.length
    ? conversationHistory
        .slice(-3)
        .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
        .join('\n')
    : '';

  return `You are a personal AI assistant for the user. You have access to their documents and task list.
Answer the user's question using ONLY the information provided below.
Be specific, actionable, and concise (max 150 words).
If citing information, mention the source document name.
If the question cannot be answered from the provided data, say so clearly.

CONVERSATION HISTORY:
${historyContext || 'None'}

USER DOCUMENTS:
${docsContext || 'None'}

USER TASKS (pending):
${tasksContext || 'None'}

QUESTION:
${question}`;
}

router.post('/', verifyToken, async (req, res) => {
  const { question = '', conversationHistory = [] } = req.body || {};
  const trimmed = String(question).trim();

  if (trimmed.length < 2 || trimmed.length > 500) {
    return res.status(400).json({ success: false, message: 'Question must be between 2 and 500 characters' });
  }

  const documents = await Document.find({ userId: req.user.uid })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const tasks = await Task.find({ userId: req.user.uid, status: 'pending' })
    .sort({ priority: 1, deadline: 1 })
    .limit(10)
    .populate('sourceDocId', 'name')
    .lean();

  const presetAnswer = isPresetQuestion(trimmed) ? buildPresetAnswer(trimmed, documents, tasks) : '';
  const prompt = buildPrompt(trimmed, documents, tasks, conversationHistory);

  let answer = presetAnswer;

  if (!answer) {
    try {
      answer = await callGemini(prompt);
    } catch (error) {
      answer = 'The AI service is temporarily unavailable. Please try again in a moment.';
    }
  }

  const sourceDocs = [...documents, ...tasks.map((task) => task.sourceDocId).filter(Boolean)]
    .map((doc) => ({ id: doc._id?.toString?.() || doc.id || doc._id, name: doc.name }))
    .filter((doc, index, array) => array.findIndex((item) => item.id === doc.id) === index);

  res.json({ success: true, answer: String(answer).trim(), sourceDocs });
});

module.exports = router;
