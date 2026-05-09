import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, ClipboardCopy, Loader2, Menu, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import EmptyState from '../components/EmptyState';

function formatMarkdown(text) {
  return String(text || '')
    .split('\n')
    .map((line, index) => {
      const parts = line.split('**');
      return (
        <p key={index} className="mb-1 last:mb-0">
          {parts.map((part, partIndex) => (partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : <span key={partIndex}>{part}</span>))}
        </p>
      );
    });
}

function ChatBubble({ message, onCopy, onRetry }) {
  const isUser = message.role === 'user';
  const isError = message.role === 'system';

  return (
    <div className={`group flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`relative max-w-[90%] rounded-3xl px-4 py-3 text-sm ${isUser ? 'bg-blue-600 text-white' : isError ? 'border border-red-200 bg-red-50 text-red-700' : 'bg-slate-100 text-slate-800'}`}>
        {isError ? <div>{message.content}</div> : formatMarkdown(message.content)}
        {message.sources?.length ? <div className="mt-3 text-xs text-slate-500">📄 Sources: {message.sources.map((source) => source.name).join(', ')}</div> : null}
        {!isUser && !isError ? (
          <button onClick={() => onCopy(message.content)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 opacity-0 transition group-hover:opacity-100">
            <ClipboardCopy size={14} /> Copy
          </button>
        ) : null}
        {message.failed ? (
          <button onClick={onRetry} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-600">
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function AskAI() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('ask-ai-conversation');
    if (saved) {
      setMessages(JSON.parse(saved));
    }

    (async () => {
      try {
        const response = await api.get('/documents');
        setDocuments(response.data.documents || []);
        setSelectedDocId(response.data.documents?.[0]?._id || null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    sessionStorage.setItem('ask-ai-conversation', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendQuestion = async (nextQuestion) => {
    const finalQuestion = (nextQuestion || question).trim();
    if (!finalQuestion || sending) return;

    const userMessage = { role: 'user', content: finalQuestion, timestamp: new Date().toISOString() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setQuestion('');
    setSending(true);

    try {
      const conversationHistory = nextMessages.slice(-6).map(({ role, content }) => ({ role, content }));
      const response = await api.post('/ask', { question: finalQuestion, conversationHistory });
      setMessages((current) => [...current, { role: 'assistant', content: response.data.answer, sources: response.data.sourceDocs, timestamp: new Date().toISOString() }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'system', content: error.response?.data?.message || 'AI is unavailable', failed: true }]);
    } finally {
      setSending(false);
    }
  };

  const retryMessage = (message) => {
    const lastUserMessage = [...messages].reverse().find((item) => item.role === 'user');
    if (lastUserMessage) {
      setQuestion(lastUserMessage.content);
      sendQuestion(lastUserMessage.content);
    }
  };

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const presetQuestions = [
    'What should I do today?',
    'What are my most urgent tasks?',
    'What deadlines are coming up?',
    'Summarize all my documents',
    'What did I learn from my emails?',
    'What tasks are overdue?',
  ];

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-6 text-slate-900">Loading...</div>;
  }

  if (!documents.length) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-6 flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm text-slate-500">Ask AI</p>
              <h1 className="text-2xl font-black text-slate-900">Your Knowledge Base</h1>
            </div>
            <button onClick={() => navigate('/upload')} className="rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Add Document</button>
          </header>
          <EmptyState icon="📄" title="No documents yet" subtitle="Add documents first so I have context to answer from." actionLabel="Add Document" onAction={() => navigate('/upload')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px,1fr]">
        <aside className="hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:block">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Knowledge Base</h2>
            <button onClick={() => navigate('/upload')} className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">Add Document</button>
          </div>
          <div className="space-y-2">
            {documents.map((document) => (
              <button key={document._id} onClick={() => setSelectedDocId(document._id)} className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selectedDocId === document._id ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                <div className="flex items-start gap-3">
                  <BookOpen size={16} className="mt-1 text-blue-600" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{document.name}</p>
                    <p className="text-xs text-slate-500">{new Date(document.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white">{document.taskCount || 0}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">Ask AI</h1>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-blue-700">Powered by Gemini</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">Ask questions about your uploaded documents and tasks.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMessages([])} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Clear conversation</button>
              <button onClick={() => setSidebarOpen((current) => !current)} className="inline-flex lg:hidden rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                <Menu size={16} />
              </button>
            </div>
          </header>

          <div className="grid min-h-[70vh] grid-rows-[1fr,auto]">
            <div className="space-y-4 overflow-y-auto px-4 py-6 sm:px-6">
              {messages.length === 0 ? (
                <div className="mx-auto max-w-2xl text-center">
                  <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-blue-50 text-4xl text-blue-600"><Sparkles size={40} /></div>
                  <h2 className="text-2xl font-black text-slate-900">What would you like to know?</h2>
                  <p className="mt-2 text-sm text-slate-500">I have access to all your uploaded documents.</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {presetQuestions.map((preset) => (
                      <button key={preset} onClick={() => sendQuestion(preset)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.map((message, index) => (
                <ChatBubble key={`${message.role}-${index}`} message={message} onCopy={copyText} onRetry={() => retryMessage(message)} />
              ))}

              {sending ? <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-500">AI is thinking...</div> : null}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200 p-4 sm:p-6">
              <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {presetQuestions.slice(0, 6).map((preset) => (
                  <button key={preset} onClick={() => sendQuestion(preset)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    {preset}
                  </button>
                ))}
              </div>
              <form onSubmit={(event) => { event.preventDefault(); sendQuestion(); }} className="flex flex-col gap-3 sm:flex-row">
                <textarea value={question} onChange={(event) => setQuestion(event.target.value.slice(0, 500))} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendQuestion(); } }} placeholder="Ask anything about your documents..." className="h-24 flex-1 rounded-3xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 sm:h-16" />
                <button type="submit" disabled={sending || !question.trim()} className="inline-flex items-center justify-center gap-2 rounded-3xl bg-blue-600 px-5 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-40">
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Send
                </button>
              </form>
              <p className="mt-2 text-right text-xs text-slate-400">{question.length} / 500</p>
            </div>
          </div>
        </main>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/60 p-4 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-x-4 bottom-4 max-h-[75vh] overflow-y-auto rounded-[2rem] bg-white p-4" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Documents</h2>
              <button onClick={() => setSidebarOpen(false)}><X size={18} /></button>
            </div>
            <div className="space-y-2">
              {documents.map((document) => (
                <button key={document._id} onClick={() => setSelectedDocId(document._id)} className={`w-full rounded-2xl border px-4 py-3 text-left ${selectedDocId === document._id ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                  <p className="text-sm font-semibold text-slate-900">{document.name}</p>
                  <p className="text-xs text-slate-500">{document.taskCount || 0} tasks</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
