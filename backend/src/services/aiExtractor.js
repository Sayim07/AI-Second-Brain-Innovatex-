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
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error('Groq request failed');
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
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
    insights: ['Could not parse document'],
    summary: 'Processing failed',
  };
}

async function parseModelResponse(prompt) {
  const responseText = await callGemini(prompt);
  try {
    return parseStructuredJson(responseText);
  } catch (firstError) {
    const retryPrompt = `${prompt}\n\nYour previous response was not valid JSON. Return ONLY the JSON object, nothing else.`;
    const retryText = await callGemini(retryPrompt);
    return parseStructuredJson(retryText);
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
    try {
      const groqText = await callGroq(prompt);
      extracted = parseStructuredJson(groqText);
    } catch (groqError) {
      extracted = fallbackResult();
    }
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
