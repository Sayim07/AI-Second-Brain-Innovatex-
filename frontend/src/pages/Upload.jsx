import { useEffect, useRef, useState } from 'react';
import { ArrowRight, FileText, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';

function TaskBadge({ priority }) {
  const classes = {
    high: 'bg-red-500/15 text-red-700',
    medium: 'bg-amber-500/15 text-amber-700',
    low: 'bg-emerald-500/15 text-emerald-700',
  }[priority] || 'bg-slate-100 text-slate-700';

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>{priority}</span>;
}

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const timeoutsRef = useRef([]);

  const [tab, setTab] = useState('pdf');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [text, setText] = useState('');
  const [docName, setDocName] = useState('');
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(1);

  useEffect(() => () => {
    timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
  }, []);

  const resetProgress = () => {
    timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutsRef.current = [];
    setProgressStep(1);
  };

  const startProgress = () => {
    resetProgress();
    timeoutsRef.current.push(setTimeout(() => setProgressStep(2), 2000));
    timeoutsRef.current.push(setTimeout(() => setProgressStep(3), 5000));
  };

  const normalizeFile = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max size is 10MB.');
      return;
    }
    setSelectedFile(file);
    setResult(null);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    normalizeFile(event.dataTransfer.files?.[0]);
  };

  const processPdf = async () => {
    if (!selectedFile) return;
    setProcessing(true);
    startProgress();

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const request = api.post('/process/upload', formData);
      toast.promise(request, {
        loading: 'Processing document...',
        success: 'Tasks extracted!',
        error: (error) => error?.response?.data?.message || 'Failed to process',
      });
      const response = await request;
      setResult(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Processing failed');
    } finally {
      setProcessing(false);
      resetProgress();
    }
  };

  const processText = async () => {
    if (text.trim().length < 10) {
      toast.error('Too short - add more context');
      return;
    }

    setProcessing(true);
    startProgress();

    try {
      const request = api.post('/process/text', { text, name: docName || 'Pasted text' });
      toast.promise(request, {
        loading: 'Processing document...',
        success: 'Tasks extracted!',
        error: (error) => error?.response?.data?.message || 'Failed to process',
      });
      const response = await request;
      setResult(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Processing failed');
    } finally {
      setProcessing(false);
      resetProgress();
    }
  };

  const taskCount = result?.tasks?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => navigate('/dashboard')} className="mb-6 text-sm font-semibold text-blue-600 hover:text-blue-700">
          Back to Dashboard
        </button>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Add to Your Second Brain</h1>
          <p className="mt-2 text-slate-500">Upload a PDF or paste text. We'll extract your tasks automatically.</p>

          <div className="mt-6 flex rounded-full bg-slate-100 p-1 text-sm font-semibold text-slate-500">
            <button type="button" onClick={() => setTab('pdf')} className={`flex-1 rounded-full px-4 py-2.5 transition ${tab === 'pdf' ? 'bg-blue-600 text-white shadow' : ''}`}>Upload PDF</button>
            <button type="button" onClick={() => setTab('text')} className={`flex-1 rounded-full px-4 py-2.5 transition ${tab === 'text' ? 'bg-blue-600 text-white shadow' : ''}`}>Paste Text / Email</button>
          </div>

          {tab === 'pdf' ? (
            <div className="mt-6 space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`flex h-56 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/70'}`}
              >
                <UploadCloud size={42} className="text-blue-500" />
                <p className="mt-4 text-lg font-semibold text-slate-900">Drag & drop your PDF here</p>
                <p className="text-sm text-slate-500">or click to browse</p>
              </div>
              <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={(event) => normalizeFile(event.target.files?.[0])} />

              {selectedFile ? (
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-600" size={18} />
                    <div>
                      <p className="font-semibold text-slate-900">{selectedFile.name}</p>
                      <p className="text-sm text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-slate-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : null}

              <button disabled={!selectedFile || processing} onClick={processPdf} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                {processing ? <Loader2 className="animate-spin" size={18} /> : null}
                {processing ? 'AI is reading your document...' : 'Process Document'}
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="relative">
                <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste your email, notes, or any text here..." className="h-48 w-full rounded-3xl border border-slate-200 px-4 py-4 outline-none transition focus:border-blue-500" />
                <span className={`absolute bottom-3 right-4 text-xs font-semibold ${text.length > 45000 ? 'text-red-500' : 'text-slate-400'}`}>{text.length.toLocaleString()} / 50,000</span>
              </div>
              <input value={docName} onChange={(event) => setDocName(event.target.value)} placeholder="e.g., Internship email from TechCorp" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" />
              <button disabled={text.trim().length < 10 || processing} onClick={processText} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                {processing ? <Loader2 className="animate-spin" size={18} /> : null}
                Process Text
              </button>
            </div>
          )}

          {processing ? (
            <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <div className="font-semibold">Processing progress</div>
              <div className="mt-2 space-y-1 text-blue-800">
                <p className={progressStep >= 1 ? 'font-semibold' : ''}>1. Reading document...</p>
                <p className={progressStep >= 2 ? 'font-semibold' : ''}>2. Analyzing with AI...</p>
                <p className={progressStep >= 3 ? 'font-semibold' : ''}>3. Extracting tasks...</p>
              </div>
            </div>
          ) : null}

          {result ? (
            <div className="mt-8 space-y-6">
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
                ✅ Found {taskCount} task{taskCount === 1 ? '' : 's'} in your document
              </div>

              <div className="space-y-3">
                {result.tasks.map((task, index) => (
                  <div key={`${task.task}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{task.task}</p>
                        <p className="mt-1 text-sm text-slate-500">{task.deadline ? `📅 Due: ${new Date(task.deadline).toLocaleDateString()}` : 'No deadline'}</p>
                      </div>
                      <TaskBadge priority={task.priority} />
                    </div>
                    {Array.isArray(task.tags) && task.tags.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {task.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {result.document?.insights?.length ? (
                <details className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <summary className="cursor-pointer list-none font-semibold text-slate-900">💡 Key Insights</summary>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {result.document.insights.map((insight) => <li key={insight}>• {insight}</li>)}
                  </ul>
                </details>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={() => navigate('/dashboard')} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-700">
                  View Full Dashboard <ArrowRight size={16} />
                </button>
                <button onClick={() => { setResult(null); setSelectedFile(null); setText(''); setDocName(''); }} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50">
                  Process Another Document
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
