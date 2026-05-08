const { GoogleGenerativeAI } = require('@google/generative-ai');
const Document = require('../models/Document');
const Task = require('../models/Task');

function truncateText(text, maxLength) {
  return String(text || '').slice(0, maxLength);
}

function stripCodeFences(value) {
  return String(value || '')
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
}

function parseStructuredJson(value) {
  const cleaned = stripCodeFences(value);
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const target = start >= 0 && end >= start ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(target);
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

function buildPrompt(rawText) {
  const text = truncateText(rawText, 8000);
  return `You are an AI assistant that extracts structured information from user documents.
Given the following text, extract all tasks, deadlines, events, and key insights.

Return ONLY valid JSON - no preamble, no explanation, no markdown code fences:
{
  "tasks": [
    {
      "task": "string - clear action verb + object",
      "deadline": "YYYY-MM-DD or null",
      "priority": "high | medium | low",
      "tags": ["string"]
    }
  ],
  "insights": ["string - non-actionable but important fact"],
  "summary": "2-3 sentence summary of the document"
}

Rules:
- Priority "high" ONLY for: urgent, ASAP, deadline, due by, immediately, critical
- Priority "medium" for: should, need to, important, soon
- Priority "low" for everything else
- Extract up to 10 tasks maximum
- Normalize all dates to YYYY-MM-DD. If year is ambiguous, use current year.
- Insights are facts, not actions (e.g., "Package weighs 2kg", "Internship starts June 1")
- If no tasks found, return empty tasks array

TEXT:
${text}`;
}

function fallbackResult() {
  return {
    tasks: [],
    insights: ['AI processing failed. Please try again.'],
    summary: 'Could not process document.',
  };
}

async function parseModelResponse(prompt) {
  try {
    const responseText = await callGemini(prompt);
    return parseStructuredJson(responseText);
  } catch (firstError) {
    console.error('First Gemini attempt failed:', firstError.message);
    
    // Retry with corrective prompt
    const retryPrompt = `Your previous response was not valid JSON. Return ONLY this JSON object with no explanation, no markdown, no code fences:
{"tasks":[],"insights":[],"summary":""}

Now process this text and fill the JSON:
${prompt}`;

    try {
      const retryText = await callGemini(retryPrompt);
      return parseStructuredJson(retryText);
    } catch (retryError) {
      console.error('Gemini retry also failed:', retryError.message);
      throw retryError;
    }
  }
}

async function saveExtraction({ userId, docName, rawText, extracted, type }) {
  const document = await Document.create({
    userId,
    name: docName,
    type,
    rawText: truncateText(rawText, 5000),
    summary: extracted.summary || '',
    insights: Array.isArray(extracted.insights) ? extracted.insights : [],
    taskCount: Array.isArray(extracted.tasks) ? extracted.tasks.length : 0,
  });

  const tasks = Array.isArray(extracted.tasks) ? extracted.tasks.slice(0, 10) : [];
  const savedTasks = [];

  for (const taskItem of tasks) {
    const savedTask = await Task.create({
      userId,
      sourceDocId: document._id,
      task: taskItem.task,
      deadline: taskItem.deadline ? new Date(taskItem.deadline) : null,
      priority: taskItem.priority || 'medium',
      tags: Array.isArray(taskItem.tags) ? taskItem.tags : [],
      status: 'pending',
    });
    savedTasks.push(savedTask);
  }

  return { document, savedTasks };
}

async function extractWithAI(rawText, userId, docName, type = 'pdf') {
  const prompt = buildPrompt(rawText);

  let extracted;
  try {
    extracted = await parseModelResponse(prompt);
  } catch (geminiError) {
    console.error('Gemini API error:', geminiError.message);
    extracted = fallbackResult();
  }

  if (!extracted || typeof extracted !== 'object') {
    extracted = fallbackResult();
  }

  const normalized = {
    tasks: Array.isArray(extracted.tasks) ? extracted.tasks : [],
    insights: Array.isArray(extracted.insights) ? extracted.insights : [],
    summary: extracted.summary || 'Processing failed',
  };

  const { document, savedTasks } = await saveExtraction({
    userId,
    docName,
    rawText,
    extracted: normalized,
    type,
  });

  return {
    success: true,
    document: {
      id: document._id,
      name: document.name,
      summary: document.summary,
      insights: document.insights,
    },
    tasks: savedTasks,
  };
}

module.exports = { extractWithAI };
