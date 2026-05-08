# 🧠 AI Second Brain — Phase-Wise Build Prompts
### Complete Step-by-Step Prompts to Build from Zero to Demo-Ready

> **How to use this document:**
> Each phase contains a **🤖 PROMPT** block — copy it verbatim into Cursor AI, Claude, or ChatGPT (with your codebase attached). Run each phase fully before moving to the next. Verification checklists tell you exactly when a phase is done.

---

## 📦 TECH STACK REFERENCE (keep this open)

| Layer | Tool |
|---|---|
| Frontend | React + Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express |
| AI/LLM | Google Gemini 1.5 Flash (primary) / Groq (fallback) |
| Database | MongoDB Atlas (free) |
| Auth | Firebase Auth |
| PDF Parsing | pdf-parse (npm) |
| Frontend Host | Vercel |
| Backend Host | Render |

---

---

# ⚙️ PHASE 0 — Project Setup & Scaffolding
### ⏱ Hours: 0–4 | Owner: All

**Goal:** Create the full monorepo structure, install all dependencies, wire up Firebase Auth, and deploy skeleton apps to Vercel + Render so CI/CD is live from minute one.

---

### 🛠 Pre-Work (Do manually before running the prompt)

1. Create a GitHub repo: `ai-second-brain`
2. Create a [Firebase project](https://console.firebase.google.com) → Enable **Email/Password auth** and **Google sign-in**
3. Create a [MongoDB Atlas](https://cloud.mongodb.com) free cluster → Get your **connection string**
4. Get a [Gemini API key](https://aistudio.google.com/app/apikey)
5. Create a [Render](https://render.com) account + new **Web Service** (connect your GitHub repo → `backend/`)
6. Create a [Vercel](https://vercel.com) account + new project (connect your GitHub repo → `frontend/`)

---

### 🤖 PROMPT — Phase 0

```
You are setting up a full-stack monorepo project called "AI Second Brain".

Create the following folder structure in the root of the project:

ai-second-brain/
├── frontend/          (React + Vite + Tailwind)
├── backend/           (Node.js + Express)
└── README.md

--- BACKEND SETUP ---

In /backend, do the following:

1. Initialize a Node.js project with these dependencies:
   - express
   - cors
   - dotenv
   - mongoose
   - firebase-admin
   - pdf-parse
   - multer (for file uploads)
   - @google/generative-ai (Gemini SDK)
   - express-async-errors
   - morgan (request logging)

2. Create this exact folder structure:
   backend/
   ├── src/
   │   ├── config/
   │   │   ├── db.js         (MongoDB Atlas connection)
   │   │   └── firebase.js   (Firebase Admin SDK init)
   │   ├── middleware/
   │   │   ├── auth.js       (JWT verification middleware using Firebase Admin)
   │   │   └── errorHandler.js
   │   ├── models/
   │   │   ├── Task.js
   │   │   └── Document.js
   │   ├── routes/
   │   │   ├── auth.js
   │   │   ├── process.js
   │   │   ├── tasks.js
   │   │   ├── ask.js
   │   │   └── documents.js
   │   └── server.js
   ├── .env.example
   └── package.json

3. In server.js, create an Express app that:
   - Connects to MongoDB on startup
   - Uses cors(), express.json(), morgan('dev')
   - Mounts all routes under /api/
   - Has a GET /health endpoint returning { status: "ok", timestamp: new Date() }
   - Uses the errorHandler middleware as the last middleware
   - Listens on process.env.PORT || 5000

4. In config/db.js, create a mongoose.connect() function using process.env.MONGO_URI

5. In config/firebase.js, initialize Firebase Admin SDK using a service account JSON from process.env.FIREBASE_SERVICE_ACCOUNT (parsed with JSON.parse)

6. In middleware/auth.js, create a verifyToken middleware that:
   - Reads the Authorization header: "Bearer <token>"
   - Verifies the token using firebaseAdmin.auth().verifyIdToken(token)
   - Attaches req.user = { uid, email } to the request
   - Returns 401 if missing or invalid

7. In middleware/errorHandler.js, create a global error handler that returns:
   { success: false, message: error.message, stack: (dev only) }

8. Create .env.example with these keys (empty values):
   PORT=
   MONGO_URI=
   FIREBASE_SERVICE_ACCOUNT=
   GEMINI_API_KEY=
   GROQ_API_KEY=
   NODE_ENV=development

--- FRONTEND SETUP ---

In /frontend, do the following:

1. Scaffold a Vite + React project with Tailwind CSS v3

2. Install these additional dependencies:
   - axios
   - react-router-dom v6
   - firebase (client SDK)
   - react-hot-toast
   - lucide-react
   - @radix-ui/react-dialog
   - @radix-ui/react-dropdown-menu
   - clsx
   - tailwind-merge

3. Create this folder structure:
   frontend/
   ├── src/
   │   ├── components/
   │   │   └── ui/           (shadcn-style base components)
   │   ├── context/
   │   │   └── AuthContext.jsx
   │   ├── hooks/
   │   │   └── useAuth.js
   │   ├── lib/
   │   │   ├── firebase.js   (Firebase client init)
   │   │   └── api.js        (Axios instance with auth interceptor)
   │   ├── pages/
   │   │   ├── Landing.jsx
   │   │   ├── Auth.jsx
   │   │   ├── Upload.jsx
   │   │   ├── Dashboard.jsx
   │   │   ├── AskAI.jsx
   │   │   └── Documents.jsx
   │   ├── App.jsx
   │   └── main.jsx
   └── .env.example

4. In lib/firebase.js, initialize Firebase client SDK using Vite env vars:
   VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID

5. In context/AuthContext.jsx, create an AuthProvider that:
   - Wraps children with a context
   - Listens to onAuthStateChanged
   - Exposes: { user, loading, signIn, signUp, signInWithGoogle, signOut }
   - Stores the Firebase ID token and attaches it to all API calls via the Axios interceptor

6. In lib/api.js, create an Axios instance with:
   - baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
   - A request interceptor that gets the current user's ID token from Firebase and sets the Authorization header

7. In App.jsx, set up React Router with these routes:
   / → Landing.jsx (public)
   /auth → Auth.jsx (public)
   /upload → Upload.jsx (protected)
   /dashboard → Dashboard.jsx (protected)
   /ask → AskAI.jsx (protected)
   /documents → Documents.jsx (protected)

   Create a ProtectedRoute component that redirects to /auth if user is not logged in.

8. Create .env.example with:
   VITE_API_URL=
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=

--- MODELS ---

Create Mongoose models:

Task.js schema:
{
  userId: { type: String, required: true, index: true },  // Firebase UID
  sourceDocId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  task: { type: String, required: true },
  deadline: { type: Date, default: null },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

Document.js schema:
{
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'text', 'email'] },
  rawText: String,
  summary: String,
  insights: [String],
  taskCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}

--- FINAL CHECKS ---
- Make sure all route files export an Express Router (even if endpoints just return 501 Not Implemented for now)
- Add a package.json start script: "start": "node src/server.js" and "dev": "nodemon src/server.js"
- Add nodemon as devDependency in backend
- Output the complete file contents for every file created
```

---

### ✅ Phase 0 Done When:
- [ ] `cd backend && npm run dev` → server starts, `/health` returns `{ status: "ok" }`
- [ ] `cd frontend && npm run dev` → Vite app loads on `localhost:5173`
- [ ] Firebase project created, auth enabled
- [ ] MongoDB Atlas cluster created, connection string in `.env`
- [ ] Both apps pushed to GitHub, Vercel/Render deployment triggered

---
---

# 🔧 PHASE 1 — Backend Core
### ⏱ Hours: 4–16 | Owner: Backend

**Goal:** Build all 5 core API modules — Auth, Process (PDF + Text), Tasks CRUD, Documents list, and Ask AI stub. Every endpoint must be functional with real data flowing through MongoDB.

---

### 🤖 PROMPT — Phase 1A: Auth + Process Routes

```
We are building the backend for AI Second Brain. The project structure is already set up.
Firebase Admin SDK is initialized in src/config/firebase.js.
MongoDB is connected in src/config/db.js.
The verifyToken middleware in src/middleware/auth.js verifies Firebase ID tokens.

Now build the following two route files completely:

--- FILE: src/routes/auth.js ---

POST /api/auth/register
- Body: { email, password, displayName }
- This is a PASSTHROUGH route — Firebase handles actual registration on the client.
- This endpoint receives a verified Firebase token (via verifyToken middleware).
- It checks if a user document exists in MongoDB "users" collection (create a simple User model if needed).
- If new user: create a user record { uid: req.user.uid, email, displayName, createdAt }
- Return: { success: true, user: { uid, email, displayName } }

POST /api/auth/me
- Protected (verifyToken)
- Returns { success: true, user: req.user }

--- FILE: src/routes/process.js ---

This is the most important route. It handles PDF upload and text paste.

POST /api/process/upload
- Protected (verifyToken)
- Uses multer to accept a single PDF file (field name: "file", max size: 10MB)
- Only accept mimetype: application/pdf
- Steps:
  1. Use pdf-parse to extract text from the uploaded file buffer
  2. If text is empty or < 50 chars, return 400 { message: "Could not extract text from PDF. Try a text-based PDF." }
  3. Call the extractWithAI(text, userId, fileName) function (defined below)
  4. Return the result

POST /api/process/text
- Protected (verifyToken)  
- Body: { text: string, name: string }
- Validate: text must be 10–50000 characters
- Call extractWithAI(text, userId, name)
- Return the result

--- SHARED FUNCTION: extractWithAI(rawText, userId, docName) ---

Create this as src/services/aiExtractor.js

This function must:

1. Initialize the Gemini client using process.env.GEMINI_API_KEY
   Use model: "gemini-1.5-flash"

2. Build this exact prompt (replace {{TEXT}} with rawText, truncated to 8000 chars):

"""
You are an AI assistant that extracts structured information from user documents.
Given the following text, extract all tasks, deadlines, events, and key insights.

Return ONLY valid JSON — no preamble, no explanation, no markdown code fences:
{
  "tasks": [
    {
      "task": "string — clear action verb + object",
      "deadline": "YYYY-MM-DD or null",
      "priority": "high | medium | low",
      "tags": ["string"]
    }
  ],
  "insights": ["string — non-actionable but important fact"],
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
{{TEXT}}
"""

3. Parse the JSON response. If parsing fails:
   - Retry once with a prompt that says "Your previous response was not valid JSON. Return ONLY the JSON object, nothing else."
   - If still fails, return a fallback: { tasks: [], insights: ["Could not parse document"], summary: "Processing failed" }

4. Save to MongoDB:
   a. Create a Document record: { userId, name: docName, type: 'pdf', rawText: rawText.slice(0,5000), summary, insights, taskCount: tasks.length }
   b. Create Task records for each extracted task: { userId, sourceDocId: doc._id, task, deadline, priority, tags, status: 'pending' }

5. Return: { success: true, document: { id, name, summary, insights }, tasks: [...savedTasks] }

--- ERROR HANDLING ---
- Wrap Gemini calls in try/catch
- If Gemini fails, attempt fallback to Groq API using fetch:
  POST https://api.groq.com/openai/v1/chat/completions
  Headers: Authorization: Bearer process.env.GROQ_API_KEY
  Model: "llama3-8b-8192"
  Same prompt as above
- If both fail, return 503 { message: "AI service temporarily unavailable. Please try again." }

Output ALL file contents completely.
```

---

### 🤖 PROMPT — Phase 1B: Tasks, Documents & Ask Routes

```
Continue building the AI Second Brain backend.

The following are already complete:
- src/models/Task.js and Document.js (Mongoose models)
- src/middleware/auth.js (verifyToken)
- src/services/aiExtractor.js

Now build these three route files:

--- FILE: src/routes/tasks.js ---

All routes are protected with verifyToken. All queries MUST filter by userId: req.user.uid.

GET /api/tasks
- Query params: status (optional), priority (optional), search (optional keyword)
- Returns tasks for the authenticated user
- Sort: high priority first, then by deadline ASC (nulls last)
- Populate sourceDocId with just { name, type } fields
- Return: { success: true, tasks: [...], counts: { total, pending, inProgress, completed, overdue } }
  (overdue = deadline < today AND status != 'completed')

PATCH /api/tasks/:id
- Body: { status } — one of: pending, in-progress, completed
- Only update if task.userId === req.user.uid (else 403)
- Set updatedAt to now
- Return: { success: true, task: updatedTask }

DELETE /api/tasks/:id
- Only delete if task.userId === req.user.uid (else 403)
- Return: { success: true, message: "Task deleted" }

--- FILE: src/routes/documents.js ---

All routes protected with verifyToken.

GET /api/documents
- Return all documents for authenticated user, sorted by createdAt DESC
- Return: { success: true, documents: [...] }

GET /api/documents/:id
- Return document with its associated tasks
- Return: { success: true, document: {...}, tasks: [...] }

DELETE /api/documents/:id
- Delete document AND all its associated tasks
- Return: { success: true, message: "Document and tasks deleted" }

--- FILE: src/routes/ask.js ---

All routes protected with verifyToken.

POST /api/ask
- Body: { question: string }
- Validate: question must be 2–500 characters

Steps:
1. Fetch the last 5 documents for this user from MongoDB (just: name, summary, insights, rawText sliced to 1000 chars each)
2. Build context string:
   """
   USER DOCUMENTS:
   [For each doc]: 
   Document: {doc.name}
   Summary: {doc.summary}
   Key Insights: {doc.insights.join(', ')}
   Content Preview: {doc.rawText.slice(0, 1000)}
   ---
   """

3. Fetch the 10 most urgent pending tasks for this user from MongoDB
4. Build tasks context:
   """
   USER TASKS (pending):
   [For each task]:
   - {task.task} | Priority: {task.priority} | Deadline: {task.deadline || 'No deadline'} | Source: {task.sourceDoc.name}
   """

5. Send to Gemini with this system prompt:
   """
   You are a personal AI assistant for the user. You have access to their documents and task list.
   Answer the user's question using ONLY the information provided below.
   Be specific, actionable, and concise (max 150 words).
   If citing information, mention the source document name.
   If the question cannot be answered from the provided data, say so clearly.
   
   {context}
   {tasksContext}
   """

6. Return: { success: true, answer: string, sourceDocs: [{ name, id }] }

Also add these 4 preset question shortcuts (same endpoint, just pre-filled questions):
- "What should I do today?" → filter tasks by deadline = today + high priority
- "What is most urgent?" → top 3 high priority tasks
- "What are my upcoming deadlines?" → tasks with deadlines in next 7 days
- "Summarize everything" → summaries of all documents

Output ALL file contents completely.
```

---

### ✅ Phase 1 Done When:
- [ ] `POST /api/process/text` with sample email text → returns tasks JSON
- [ ] `GET /api/tasks` returns sorted tasks with counts
- [ ] `PATCH /api/tasks/:id` updates status
- [ ] `POST /api/ask` with "What should I do today?" returns a real AI answer
- [ ] All routes return 401 if no token is provided
- [ ] Test in Postman or Thunder Client with a real Firebase ID token

---
---

# 🎨 PHASE 2 — Frontend Core
### ⏱ Hours: 4–20 | Owner: Frontend

**Goal:** Build the Landing page, complete Auth flow (sign up, sign in, Google OAuth), and the Upload screen with working API integration.

---

### 🤖 PROMPT — Phase 2A: Landing Page

```
Build the Landing page for "AI Second Brain" — a productivity app that extracts tasks and deadlines from emails and PDFs.

File: src/pages/Landing.jsx

Design requirements:
- Dark theme: background #0F172A (slate-900), text white
- Accent color: #3B82F6 (blue-500)
- Font: system font stack, clean and modern

Sections to build:

1. NAVBAR
   - Logo: brain emoji + "Second Brain" in bold
   - Right side: "Sign In" button (ghost) + "Get Started" button (blue filled)
   - Both buttons navigate to /auth using react-router-dom useNavigate

2. HERO SECTION (centered, full viewport height)
   - Badge pill: "🚀 Hackathon Build 2026" with subtle border
   - H1 headline (large, bold): 
     "Your AI doesn't just store information —"
     "it tells you exactly what to do next."
   - Subtext: "Upload emails, PDFs, and notes. Get a prioritized action plan in under 30 seconds."
   - Two CTAs:
     - Primary: "Start for Free →" → navigate to /auth
     - Secondary: "See How It Works ↓" → smooth scroll to features
   - Below CTAs: small trust text "No credit card. No setup. Just upload."

3. HOW IT WORKS (id="features", 3-step grid)
   Step 1 — 📤 Upload Anything: "Drop a PDF, paste an email, or type notes. We handle any format."
   Step 2 — 🧠 AI Processes It: "Our AI reads, understands, and extracts every task and deadline."
   Step 3 — ✅ Get Your Plan: "See exactly what to do today, what's urgent, and what can wait."
   Each step: numbered circle + icon + title + description in a card with subtle border.

4. USP COMPARISON TABLE
   - Section title: "Why not just use ChatGPT or Notion?"
   - Table with 3 columns: Feature | Normal Tools | AI Second Brain
   - Rows:
     Auto-extracts tasks | ❌ | ✅
     Proactive action plan | ❌ | ✅
     Works on YOUR data | ❌ | ✅
     Remembers context | ❌ | ✅
     Tells you what to do | ❌ | ✅

5. EXAMPLE OUTPUT PREVIEW
   - Section title: "Paste this email → Get this output"
   - Show a before/after split:
     LEFT (dark code block): Raw email text about a delivery (3-4 lines)
     RIGHT (task cards): 3 extracted tasks with priority badges
   - This is purely visual/static, no interaction needed

6. CTA FOOTER SECTION
   - Large centered text: "Ready to stop searching and start doing?"
   - Single button: "Upload Your First Document →" → /auth
   - Footer bar: "Built with ❤️ for hackathon 2026"

Use Tailwind CSS for all styling. Use lucide-react icons where appropriate.
Make it fully responsive (mobile-first). Export as default.
```

---

### 🤖 PROMPT — Phase 2B: Auth Screen

```
Build the Auth screen for AI Second Brain.

File: src/pages/Auth.jsx

This single page handles BOTH sign-up and sign-in with a toggle.

Requirements:

1. Import and use the AuthContext (useAuth hook) which exposes: { signIn, signUp, signInWithGoogle, loading, user }
2. If user is already logged in, redirect to /dashboard

LAYOUT:
- Split screen (desktop): LEFT = branding panel, RIGHT = form panel
- Mobile: form panel only (full width)

LEFT PANEL (hidden on mobile):
- Dark blue gradient background (#1E3A8A to #1E40AF)
- Brain emoji large + "AI Second Brain" title
- 3 bullet points with checkmarks:
  ✓ Extract tasks from any document
  ✓ Never miss a deadline again
  ✓ Ask AI about your own data

RIGHT PANEL (form):
- White background
- Toggle tabs: "Sign In" | "Sign Up" (pill style, blue active state)
- Google OAuth button (full width, with Google icon SVG):
  "Continue with Google" → calls signInWithGoogle()
- Divider: "or continue with email"

SIGN IN form:
- Email input (type="email")
- Password input (type="password", toggle show/hide)
- "Sign In" button → calls signIn(email, password)
- Below form: "Don't have an account? Sign Up" → toggle

SIGN UP form:
- Display Name input
- Email input
- Password input (min 6 chars)
- Confirm Password input (validate match)
- "Create Account" button → calls signUp(email, password, displayName)
- Below form: "Already have an account? Sign In" → toggle

ERROR HANDLING:
- Show inline error messages under the form (not toast)
- Map Firebase error codes to friendly messages:
  auth/user-not-found → "No account found with this email"
  auth/wrong-password → "Incorrect password"
  auth/email-already-in-use → "Email already registered. Sign in instead."
  auth/weak-password → "Password must be at least 6 characters"
  default → "Something went wrong. Please try again."

LOADING STATE:
- Disable button + show spinner while loading

After successful auth: navigate to /dashboard

Use Tailwind CSS. Use react-hot-toast for success messages only.
Export as default.
```

---

### 🤖 PROMPT — Phase 2C: Upload Screen

```
Build the Upload screen for AI Second Brain.

File: src/pages/Upload.jsx

This screen has TWO tabs: "Upload PDF" and "Paste Text/Email"

LAYOUT:
- Max width: 700px, centered
- Page title: "Add to Your Second Brain"
- Subtitle: "Upload a PDF or paste text. We'll extract your tasks automatically."

TAB 1: UPLOAD PDF

Drag-and-drop zone:
- Large dashed border box (h-48)
- Center content: 📄 icon + "Drag & drop your PDF here" + "or click to browse"
- On hover: blue border + light blue background
- On drag-over: visual highlight
- Accept: .pdf only
- Max size: 10MB — show error if larger
- Show selected file name + file size once chosen
- "Remove" X button to deselect

Below the dropzone:
- "Process Document" button (full width, blue) — disabled until file selected
- Loading state: "🧠 AI is reading your document..." with animated dots

TAB 2: PASTE TEXT / EMAIL

- Textarea (h-40): placeholder "Paste your email, notes, or any text here..."
- Character counter: "0 / 50,000" (shown bottom-right of textarea, red if > 45000)
- "Document name" input (optional): placeholder "e.g., Internship email from TechCorp"
- "Process Text" button (full width, blue) — disabled if < 10 chars

AFTER PROCESSING (results section appears below the tabs):

Show a success banner: "✅ Found {n} tasks in your document"

Then show the extracted tasks list:
- Each task card shows:
  - Task text (bold)
  - Priority badge: 🔴 High / 🟡 Medium / 🟢 Low
  - Deadline: "📅 Due: {date}" or "No deadline"
  - Tags (if any): small gray pills
- If insights exist, show a "💡 Key Insights" collapsible section

Bottom CTAs:
- Primary: "View Full Dashboard →" → navigate to /dashboard
- Secondary: "Process Another Document" → reset form

API INTEGRATION:
- Upload PDF: POST /api/process/upload with FormData (field: "file")
- Paste text: POST /api/process/text with { text, name }
- Use the api.js Axios instance (which auto-attaches auth token)
- Show react-hot-toast on error: toast.error(error.response?.data?.message || "Processing failed")

LOADING UX:
- Show a 3-step progress indicator while processing:
  Step 1: "Reading document..." (instant)
  Step 2: "Analyzing with AI..." (after 2s)
  Step 3: "Extracting tasks..." (after 5s)
  (These are time-based UI hints, not real status — just for perceived performance)

Use Tailwind CSS. Use lucide-react icons. Export as default.
```

---

### ✅ Phase 2 Done When:
- [ ] Landing page loads at `/` with all sections visible
- [ ] Sign up creates a new Firebase user
- [ ] Sign in redirects to `/dashboard`
- [ ] Google sign-in works
- [ ] Upload screen → paste text → sees extracted tasks
- [ ] Upload PDF → sees extracted tasks
- [ ] Non-logged-in user hitting `/dashboard` redirects to `/auth`

---
---

# 📊 PHASE 3 — Smart Dashboard
### ⏱ Hours: 16–32 | Owner: Frontend

**Goal:** Build the full 4-quadrant dashboard with live data from the API.

---

### 🤖 PROMPT — Phase 3: Dashboard

```
Build the Dashboard screen for AI Second Brain.

File: src/pages/Dashboard.jsx

This is the core screen users see after login. Fetch all data on mount.

DATA FETCHING:
- On mount: call GET /api/tasks and GET /api/documents using the api.js instance
- Show a full-page skeleton loader while fetching
- Show an empty state if no tasks yet

TOP NAVBAR (sticky):
- Left: Brain emoji + "Second Brain" logo
- Center: Greeting "Good morning, {user.displayName} 👋"
- Right: 
  - "➕ Add Document" button → navigate to /upload
  - User avatar (first letter of email in a circle) + dropdown: Profile, Sign Out

STATS ROW (4 cards below navbar):
- Total Tasks: number + "tasks extracted"
- ⚠️ Overdue: number (red if > 0) + "need attention"
- 🔥 Due Today: count of tasks with deadline = today
- ✅ Completed: count + completion percentage bar

4-QUADRANT GRID LAYOUT (desktop: 2x2, mobile: single column):

--- QUADRANT 1 (top-left): "🔥 Today's Priorities" ---
- List of tasks where: deadline = today OR priority = 'high'
- Each task card:
  - Priority dot (red/yellow/green) on left
  - Task text (truncate at 2 lines)
  - Source doc name in small gray text: "from: {doc.name}"
  - Deadline badge: "Due Today" (red) / "Due {date}" / "No deadline"
  - Status toggle button: clicking cycles Pending → In Progress → Done
    (optimistic UI: update locally first, then PATCH /api/tasks/:id)
  - Done tasks get strikethrough + 50% opacity
- "View all tasks →" link at bottom
- Empty state: "🎉 Nothing urgent today! Check upcoming tasks."

--- QUADRANT 2 (top-right): "⏳ Upcoming Deadlines" ---
- Timeline view of tasks with deadlines in the next 7 days
- Group by day: "Tomorrow", "Wednesday", "Thursday", etc.
- Under each day: task pills with priority color coding
- Tasks beyond 7 days: show count "and {n} more after this week"
- Empty state: "No upcoming deadlines. You're all caught up!"

--- QUADRANT 3 (bottom-left): "💡 Key Insights" ---
- Show insights from the 3 most recent documents
- Each insight: small card with a lightbulb icon and the insight text
- Source doc name shown below in gray
- "From: {doc.name}" label
- Empty state: "Upload documents to see insights here."

--- QUADRANT 4 (bottom-right): "🤖 Quick Ask AI" ---
- Compact chat widget (fixed height, scrollable)
- Preset quick-question buttons at top:
  "What's urgent?" | "What's due today?" | "Summarize everything"
- Chat input at bottom: text field + send button
- Message bubbles: user (right, blue) / AI (left, gray)
- Clicking a preset fills the input and auto-submits
- API: POST /api/ask with { question }
- Show typing indicator (3 animated dots) while waiting
- Max 5 messages shown (older ones scroll up)

TASK STATUS UPDATE:
- Implement optimistic updates:
  1. Update task in local state immediately
  2. Call PATCH /api/tasks/:id in background
  3. On error: revert local state + show toast.error("Failed to update")

RESPONSIVE:
- Mobile: single column, quadrants stack vertically
- Quadrant 4 (Ask AI) becomes a floating button on mobile that opens a modal

Use Tailwind CSS. Use lucide-react. Use react-hot-toast for feedback.
Export as default.
```

---

### ✅ Phase 3 Done When:
- [ ] Dashboard loads with real tasks from API
- [ ] Stats row shows correct counts
- [ ] Task status toggle works (optimistic update)
- [ ] Deadline quadrant groups tasks by day
- [ ] Ask AI quick panel sends a question and gets a response
- [ ] Empty states shown when no data
- [ ] Mobile layout stacks correctly

---
---

# 🤖 PHASE 4 — Ask AI (Full Chat Interface)
### ⏱ Hours: 28–40 | Owner: Full Stack

**Goal:** Build the dedicated Ask AI page with full chat UX, document-aware responses, and source citations.

---

### 🤖 PROMPT — Phase 4: Ask AI Page

```
Build the full Ask AI chat page for AI Second Brain.

File: src/pages/AskAI.jsx

This is a full-page chat interface where users ask questions about their uploaded documents.

LAYOUT:
- Two-panel layout (desktop):
  LEFT PANEL (280px, fixed): Sidebar with context info
  RIGHT PANEL (flex-1): Chat area

LEFT SIDEBAR:
- Title: "Your Knowledge Base"
- Show list of uploaded documents:
  Each: document icon + name + date + task count badge
  Clicking a doc highlights it (visual selection only — context is automatic)
- Bottom: "➕ Add Document" → navigate to /upload

RIGHT CHAT PANEL:
- Header: "Ask AI" title + "Powered by Gemini" small badge
- Chat messages area (scrollable, flex-col with overflow-y-auto)
- Input area (pinned to bottom)

CHAT MESSAGES:
User messages: right-aligned, blue bubble, white text
AI messages: left-aligned, dark gray bubble
Each AI message:
- Text content (support markdown: **bold**, bullet points, line breaks)
- Source citations at bottom: "📄 Sources: {doc names}" in small text
- Copy button (clipboard icon) on hover

INITIAL STATE (no messages yet):
- Centered welcome card:
  Brain emoji + "What would you like to know?"
  Subtitle: "I have access to all your uploaded documents."
- 6 preset question buttons in a 2x3 grid:
  "What should I do today?"
  "What are my most urgent tasks?"
  "What deadlines are coming up?"
  "Summarize all my documents"
  "What did I learn from my emails?"
  "What tasks are overdue?"

INPUT AREA:
- Text input: placeholder "Ask anything about your documents..."
- Send button (arrow icon, blue)
- Submit on Enter (but Shift+Enter = new line)
- Disable input while AI is responding
- Character limit: 500 chars, show counter

AI TYPING INDICATOR:
- Show while waiting for /api/ask response
- 3 animated dots (pulse animation) in an AI message bubble
- Replace with actual response on arrival

CONVERSATION MANAGEMENT:
- Keep full conversation history in state: [{ role, content, sources, timestamp }]
- Send conversation history context to help AI understand follow-up questions
  (send last 3 exchanges as context in the API request)
- "Clear conversation" button in header
- Persist conversation in sessionStorage (cleared on tab close)

API INTEGRATION:
- POST /api/ask with { question, conversationHistory: lastThreeMessages }
- Handle errors: show error message in chat as a system message (red-bordered bubble)
- Retry button on failed messages

MOBILE:
- Single panel (no sidebar)
- Sidebar accessible via "Documents" icon button in header that opens a bottom sheet

Use Tailwind CSS. Lucide-react for icons. Support basic markdown rendering
(split on ** for bold, split on \n for line breaks — no need for a full markdown library).
Export as default.
```

---

### ✅ Phase 4 Done When:
- [ ] Ask AI page loads with document sidebar
- [ ] Preset questions auto-submit and get responses
- [ ] AI response cites source documents
- [ ] Typing indicator shows while waiting
- [ ] Follow-up questions work in context
- [ ] Mobile view works with bottom sheet sidebar

---
---

# ✨ PHASE 5 — Polish, Error States & Responsiveness
### ⏱ Hours: 40–60 | Owner: All

**Goal:** Production-quality UX — every loading state, every error, every edge case handled. Mobile-perfect.

---

### 🤖 PROMPT — Phase 5A: Global UX Polish

```
Polish the AI Second Brain application for production quality.

Apply the following improvements across ALL pages and components:

--- 1. LOADING SKELETONS ---

Create a reusable Skeleton component: src/components/ui/Skeleton.jsx
- Renders a gray pulsing rectangle (animate-pulse)
- Props: width, height, className, rounded

Create these skeleton layouts:
- TaskCardSkeleton: matches the task card layout (priority dot + 2 lines of text + badge)
- DocumentItemSkeleton: icon + text + small badge
- DashboardSkeleton: 4 stat cards + 4 quadrant placeholders

Use these everywhere loading=true.

--- 2. EMPTY STATES ---

Create: src/components/EmptyState.jsx
Props: icon (emoji string), title, subtitle, actionLabel, onAction

Use these empty states:
- Dashboard (no tasks): 
  icon: "🧠" 
  title: "Your Second Brain is empty"
  subtitle: "Upload your first document to get started."
  action: "Upload Document" → /upload

- Ask AI (no documents):
  icon: "📄"
  title: "No documents yet"
  subtitle: "Add documents first so I have context to answer from."
  action: "Add Document" → /upload

- Documents page (no docs):
  icon: "📁"
  title: "No documents uploaded"
  subtitle: "Start by uploading a PDF or pasting an email."
  action: "Upload Now" → /upload

--- 3. ERROR BOUNDARY ---

Create: src/components/ErrorBoundary.jsx (class component)
- Catches unhandled React errors
- Shows: "Something went wrong 😕" + "Reload Page" button
- Wrap the entire <App /> in it

--- 4. TOAST NOTIFICATIONS ---

Standardize all toasts using react-hot-toast:
- Success: green, 3s duration
- Error: red, 5s duration, with "×" dismiss
- Loading: spinner, stays until resolved

Use toast.promise() for async operations:
- Upload: { loading: "Processing document...", success: "Tasks extracted!", error: "Failed to process" }
- Status update: { loading: "Saving...", success: "Updated!", error: "Failed to save" }
- Ask AI: { loading: "Thinking...", success: null, error: "AI is unavailable" }

--- 5. FORM VALIDATION ---

In Upload.jsx:
- File: reject non-PDF with "Only PDF files are supported"
- File: reject > 10MB with "File too large. Max size is 10MB."
- Text: show "Too short — add more context" if < 10 chars
- Text: warn at 45,000 chars "Approaching limit"

In Auth.jsx:
- Validate email format
- Password: min 6 chars
- Confirm password: must match
- Show validation errors inline below each field (not toast)

--- 6. NETWORK ERROR HANDLING ---

In src/lib/api.js, add a response interceptor:
- On 401: sign out the user and redirect to /auth with toast "Session expired. Please sign in."
- On 503: toast.error("AI service is temporarily unavailable. Please try again in a moment.")
- On 429: toast.error("Too many requests. Please wait 30 seconds.")
- On network error (no response): toast.error("Check your internet connection.")

--- 7. KEEP-ALIVE PING ---

In the backend server.js, add a self-ping to prevent Render cold starts:
setInterval(() => {
  if (process.env.NODE_ENV === 'production') {
    fetch(`${process.env.RENDER_URL}/health`).catch(() => {})
  }
}, 14 * 60 * 1000)  // Every 14 minutes

--- 8. MOBILE RESPONSIVE FIXES ---

Audit and fix mobile layout for all pages:
- Navbar: hamburger menu on mobile with slide-out drawer
- Dashboard: single column on mobile (< 768px)
- Ask AI: hide sidebar on mobile, show as floating "📚" button bottom-right
- Upload: full-width tabs, full-width dropzone

Output the complete updated files.
```

---

### 🤖 PROMPT — Phase 5B: Documents Page

```
Build the Documents page for AI Second Brain.

File: src/pages/Documents.jsx

This page shows all documents the user has uploaded with the ability to view and delete them.

LAYOUT:
- Page header: "📚 Your Documents" + "Upload New →" button (top right)
- Search bar: "Search documents..." (filters by name client-side)
- Document grid/list (default: list view, toggle to grid)

LIST VIEW — Each document row:
- Left: document type icon (PDF icon for pdf, text icon for text/email)
- Document name (bold)
- Date uploaded (e.g., "2 days ago" using relative time)
- Summary preview (1 line, truncated)
- Task count badge: "{n} tasks"
- Right side action buttons:
  👁 View Tasks (expand accordion below the row showing linked tasks)
  🗑 Delete (confirm modal before deleting)

GRID VIEW — Each document card:
- Icon + name + date
- Summary (2 lines)
- Task count badge
- Delete button (top right corner)

EXPAND/ACCORDION (list view only):
When clicking "View Tasks", expand a section below the row showing:
- Each linked task with status badge
- Status toggle (same as dashboard)
- "View in Dashboard →" link

DELETE CONFIRMATION MODAL:
- "Delete Document?"
- Warning: "This will also delete {n} tasks linked to this document. This cannot be undone."
- Cancel + "Delete Forever" (red) buttons
- API: DELETE /api/documents/:id

STATS BAR at top:
"{n} documents | {n} total tasks | {n} completed"

Empty state:
icon: "📁", title: "No documents yet", action: "Upload Your First Document"

API calls:
- GET /api/documents on mount
- DELETE /api/documents/:id on confirm

Use Tailwind CSS. Export as default.
```

---

### ✅ Phase 5 Done When:
- [ ] Every page has a skeleton loader
- [ ] Every page has an empty state
- [ ] Toast notifications fire correctly for all actions
- [ ] Form validation works and shows inline errors
- [ ] 401 redirects to `/auth`
- [ ] Mobile layout looks correct on 375px viewport
- [ ] Documents page shows history with delete functionality

---
---

# 🚀 PHASE 6 — Deploy & Demo Prep
### ⏱ Hours: 60–72 | Owner: All

**Goal:** Production deployment, seed demo data, pre-cache AI responses, rehearse demo flow.

---

### 🤖 PROMPT — Phase 6A: Environment & Deployment Config

```
Prepare the AI Second Brain project for production deployment.

--- BACKEND: Render Production Config ---

1. In backend/package.json, ensure start script is: "node src/server.js"
2. Create a render.yaml in the project root:

services:
  - type: web
    name: ai-second-brain-api
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000

3. Add CORS configuration in server.js for production:

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL  // e.g., https://ai-second-brain.vercel.app
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true)
    else callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

4. Add request rate limiting using express-rate-limit:
   npm install express-rate-limit
   
   Apply to all /api routes: max 100 requests per 15 minutes per IP
   Apply stricter limit to /api/process: max 10 requests per hour per user

5. Add a Multer disk storage config that stores files in /tmp (Render's writable directory)
   Files are temporary — delete after processing with fs.unlinkSync()

--- FRONTEND: Vercel Production Config ---

1. Create vercel.json in /frontend:
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
(This fixes React Router 404s on page refresh)

2. In vite.config.js, ensure build output is correct:
export default {
  build: { outDir: 'dist' },
  server: { proxy: { '/api': 'http://localhost:5000' } }
}

--- ENVIRONMENT VARIABLE CHECKLIST ---

Backend env vars to set in Render dashboard:
- MONGO_URI: your Atlas connection string
- FIREBASE_SERVICE_ACCOUNT: the full JSON content (stringified with JSON.stringify())
- GEMINI_API_KEY: your Gemini key
- GROQ_API_KEY: your Groq key (backup)
- NODE_ENV: production
- FRONTEND_URL: your Vercel URL
- RENDER_URL: your Render service URL (for keep-alive ping)

Frontend env vars to set in Vercel dashboard:
- VITE_API_URL: your Render service URL + /api (e.g., https://your-app.onrender.com/api)
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID

Output the complete files.
```

---

### 🤖 PROMPT — Phase 6B: Demo Seed Data

```
Create a demo data seeder for AI Second Brain hackathon demo.

File: backend/src/scripts/seedDemo.js

This script creates a realistic demo account with pre-populated data.

DEMO USER:
Email: demo@secondbrain.ai
Password: Demo@2026

Create this script that:

1. Signs in/creates the demo user in Firebase (use firebase-admin)
2. Clears any existing documents and tasks for this user in MongoDB
3. Creates 4 demo documents with realistic extracted data:

DOCUMENT 1 — "Internship Offer - TechCorp" (type: email)
Tasks:
- "Reply to TechCorp offer acceptance" | deadline: +2 days | priority: high
- "Submit signed offer letter" | deadline: +5 days | priority: high  
- "Arrange accommodation in Bangalore" | deadline: +14 days | priority: medium
Insights:
- "Internship starts June 15, 2026"
- "Stipend: ₹25,000/month"
- "Reporting to: Priya Sharma, Engineering Lead"
Summary: "TechCorp has extended a software engineering internship offer starting June 15 with a monthly stipend of ₹25,000."

DOCUMENT 2 — "Assignment Brief - DSA Project" (type: pdf)
Tasks:
- "Implement binary search tree with insert/delete/search" | deadline: +3 days | priority: high
- "Write complexity analysis report (2 pages)" | deadline: +3 days | priority: high
- "Submit on university portal before 11:59 PM" | deadline: +3 days | priority: high
- "Pair review code with lab partner" | deadline: +2 days | priority: medium
Insights:
- "Assignment worth 30% of final grade"
- "Late submissions penalized 10% per day"
- "Must use Python or Java only"
Summary: "DSA assignment requiring BST implementation with a complexity analysis report, due in 3 days for 30% of final grade."

DOCUMENT 3 — "Flipkart Delivery Notification" (type: email)
Tasks:
- "Be available to receive delivery between 10AM-6PM" | deadline: tomorrow | priority: high
- "Verify package seal before accepting" | deadline: tomorrow | priority: medium
- "Keep delivery OTP ready: check SMS" | deadline: tomorrow | priority: high
Insights:
- "Order: Mechanical Keyboard (Cherry MX Red)"
- "Order value: ₹4,499"
- "Delivery partner: Ekart Logistics"
Summary: "Flipkart delivery of a mechanical keyboard scheduled for tomorrow between 10AM-6PM, requires OTP verification."

DOCUMENT 4 — "Weekly Goals - Personal Notes" (type: text)
Tasks:
- "Complete LeetCode 150 problem 23-27" | deadline: +7 days | priority: medium
- "Read 20 pages of Clean Code" | deadline: +7 days | priority: low
- "Apply to 5 more companies on LinkedIn" | deadline: +5 days | priority: medium
- "Update GitHub with DSA solutions" | deadline: +7 days | priority: low
Insights:
- "Target: 2 DSA problems per day"
- "Reading goal: 1 chapter per week"
Summary: "Personal weekly goals covering LeetCode practice, reading, job applications, and GitHub updates."

4. Set some tasks to 'completed' status (3-4 tasks total) to show the completion feature

5. Set the createdAt timestamps to be spread over the last 7 days (realistic history)

Run with: node src/scripts/seedDemo.js

Also create: backend/src/scripts/clearDemo.js (deletes all demo user data)

Print a summary when done:
"✅ Demo seeded: 4 documents, {n} tasks ({n} pending, {n} completed)"
```

---

### 🤖 PROMPT — Phase 6C: Final Testing Checklist Script

```
Create a README.md for the AI Second Brain project with the following sections:

1. PROJECT OVERVIEW (2 paragraphs from the PRD)

2. LIVE DEMO
   - Demo URL: [your Vercel URL]
   - Demo login: demo@secondbrain.ai / Demo@2026
   - API URL: [your Render URL]

3. LOCAL SETUP
   Step-by-step instructions to run locally:
   a. Clone the repo
   b. Backend setup: cd backend, npm install, copy .env.example to .env, fill in values, npm run dev
   c. Frontend setup: cd frontend, npm install, copy .env.example to .env, fill in values, npm run dev
   d. Seed demo data: cd backend, node src/scripts/seedDemo.js

4. TECH STACK TABLE

5. KEY FEATURES
   - Upload PDFs and emails for AI-powered task extraction
   - Smart dashboard with today's priorities and deadline timeline
   - Ask AI chat interface with document-aware responses
   - Task status tracking (pending → in-progress → completed)

6. API DOCUMENTATION
   List all 9 endpoints with method, path, auth requirement, request body, response shape

7. ARCHITECTURE DIAGRAM (ASCII):
   
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

8. HACKATHON NOTES
   - Built in 72 hours
   - Known limitations (manual email paste, no mobile app)
   - Future roadmap (Gmail OAuth, calendar sync, mobile app)

Output the complete README.md content.
```

---

### ✅ Phase 6 Done When:
- [ ] Backend deployed on Render, `/health` returns 200 on the live URL
- [ ] Frontend deployed on Vercel, loads on the live URL
- [ ] Demo seed script run successfully
- [ ] Login with `demo@secondbrain.ai` and see pre-populated dashboard
- [ ] Full demo flow works end-to-end on live deployment:
  - Land → Sign up → Upload email text → See tasks → View dashboard → Ask AI

---
---

# 🎬 DEMO SCRIPT (Rehearse This)

**Flow: 3 minutes, 3 wow moments**

```
TIME    ACTION                              WOW FACTOR
0:00    Open landing page                   "AI doesn't just store — it acts"
0:20    Sign in with demo account           Instant login
0:30    Show pre-loaded dashboard           "Look — 4 documents, 17 tasks, all auto-extracted"
0:50    Point to Today's Priorities         3 urgent tasks from an internship email
1:10    Show Deadline Countdown             "Tomorrow — delivery. In 3 days — assignment due"
1:30    Click Ask AI → "What's most urgent?" Live AI response citing the assignment doc
2:00    Go to Upload → paste fresh email    Paste the delivery email live
2:15    Show AI processing (progress steps) "Reading... Analyzing... Extracting..."
2:30    3 new tasks appear instantly        "Verified packet, OTP ready, be home by 6PM"
2:45    Switch to dashboard — tasks updated "It just updated your brain in real time"
3:00    "That's AI Second Brain."
```

---

# 🔧 QUICK FIX PROMPTS

Use these if something breaks during the hackathon:

**Firebase token not working:**
```
In my Express middleware auth.js, the Firebase Admin SDK verifyIdToken() is throwing an error.
Here is the error: [paste error]. Here is my firebase.js init code: [paste code].
Fix it. The service account JSON is stored as a string in process.env.FIREBASE_SERVICE_ACCOUNT.
```

**Gemini returning non-JSON:**
```
My Gemini API call is returning text instead of JSON. The response is: [paste response].
My current prompt is: [paste prompt].
Update the prompt to force pure JSON output and add a post-processing step that
strips any markdown code fences (```json ... ```) before JSON.parse().
```

**Render cold start too slow:**
```
My Render backend takes 30+ seconds to respond on first request (cold start).
Add a keep-alive mechanism that pings the /health endpoint every 14 minutes
using a setInterval in server.js. Also add a loading message on the frontend
that says "Waking up server... (first request may take 30s)" if the API
call takes more than 5 seconds.
```

**MongoDB query too slow:**
```
My GET /api/tasks query is slow. The Tasks collection has userId, deadline, priority, status fields.
Add the correct compound indexes to the Task model in Mongoose to optimize:
1. Fetching tasks by userId + status
2. Sorting by priority + deadline
3. Finding overdue tasks (deadline < now, status != completed)
```

---

*Built for Hackathon 2026 | AI Second Brain PRD v1.0*
