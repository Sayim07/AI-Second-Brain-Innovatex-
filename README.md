# Smriti

Smriti is a full-stack document intelligence app that turns emails, PDFs, and pasted notes into tasks, deadlines, and actionable summaries. The goal is simple: upload information once, then let the app surface what matters next instead of making you search through context manually.

The backend uses Node.js, Express, MongoDB, Firebase Auth, Gemini, and Groq fallback processing. The frontend uses React, Vite, Tailwind CSS, and a task-focused UX for landing, authentication, upload, dashboard, document history, and ask-ai workflows.

## Live Demo

- Demo URL: TBD
- Demo login: `demo@secondbrain.ai` / `Demo@2026`
- API URL: TBD

## Local Setup

1. Clone the repo.
2. Backend setup:
   - `cd backend`
   - `npm install`
   - Copy `.env.example` to `.env`
   - Fill in MongoDB, Firebase, Gemini, and Groq values
   - Run `npm run dev`
3. Frontend setup:
   - `cd frontend`
   - `npm install`
   - Copy `.env.example` to `.env`
   - Fill in Vite Firebase values and the API URL
   - Run `npm run dev`
4. Seed demo data:
   - `cd backend`
   - `node src/scripts/seedDemo.js`

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| UI | Lucide icons, Radix primitives, custom components |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Auth | Firebase Auth, Firebase Admin |
| AI | Gemini 1.5 Flash, Groq fallback |
| File Parsing | pdf-parse, Multer |
| Hosting | Vercel, Render |

## Key Features

- Upload PDFs and pasted text for AI-powered task extraction.
- Smart dashboard with today’s priorities, deadlines, insights, and quick ask.
- Ask AI chat interface with document-aware responses and source citations.
- Task lifecycle tracking from pending to in-progress to completed.

## API Documentation

### Auth

- `POST /api/auth/register` - protected. Creates or updates the current user record.
- `POST /api/auth/me` - protected. Returns the current Firebase user payload.

### Process

- `POST /api/process/upload` - protected. Accepts one PDF file and extracts tasks.
- `POST /api/process/text` - protected. Accepts pasted text and extracts tasks.

### Tasks

- `GET /api/tasks` - protected. Lists tasks with optional status, priority, and search filters.
- `PATCH /api/tasks/:id` - protected. Updates task status.
- `DELETE /api/tasks/:id` - protected. Deletes a task.

### Documents

- `GET /api/documents` - protected. Lists documents for the current user.
- `GET /api/documents/:id` - protected. Returns one document and its tasks.
- `DELETE /api/documents/:id` - protected. Deletes a document and linked tasks.

### Ask

- `POST /api/ask` - protected. Answers a question using the user’s documents and tasks.

### Health

- `GET /health` - returns `{ status: "ok" }`.

## Architecture

```text
[User Browser]
     │
     ▼
[React + Tailwind] ←→ [Firebase Auth]
     │ Axios (JWT)
     ▼
[Express API on Render]
     │          │
     ▼          ▼
[MongoDB]   [Gemini API]
[Atlas]     [Groq API]
```

## Hackathon Notes

- Built for a 72-hour hackathon demo.
- Known limitation: email input is manual instead of Gmail ingestion.
- Future roadmap: Gmail OAuth, calendar sync, and mobile app support.
