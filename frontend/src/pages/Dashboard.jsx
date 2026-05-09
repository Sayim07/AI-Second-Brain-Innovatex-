import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Brain, CheckCheck, CircleAlert, Clock3, FileText, Gauge, Lightbulb, Menu, MessageSquareMore, Send, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/EmptyState';

const STATUS_ORDER = ['pending', 'in-progress', 'completed'];

function formatDate(value) {
  if (!value) return 'No deadline';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getPriorityDot(priority) {
  return {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-emerald-500',
  }[priority] || 'bg-slate-400';
}

function TaskRow({ task, onToggle }) {
  const statusIndex = STATUS_ORDER.indexOf(task.status);
  const nextStatus = STATUS_ORDER[(statusIndex + 1) % STATUS_ORDER.length];
  const isCompleted = task.status === 'completed';

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1 h-3 w-3 rounded-full ${getPriorityDot(task.priority)}`} />
        <div className="min-w-0 flex-1">
          <p className={`line-clamp-2 font-semibold text-slate-900 ${isCompleted ? 'line-through' : ''}`}>{task.task}</p>
          <p className="mt-1 text-xs text-slate-500">from: {task.sourceDocId?.name || 'Unknown'}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-3 py-1 font-semibold ${task.deadline ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{task.deadline ? `Due ${formatDate(task.deadline)}` : 'No deadline'}</span>
            <button onClick={() => onToggle(task, nextStatus)} className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-200">{task.status}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAskWidget({ compact = false, onAsk }) {
  const presets = ['What should I do today?', 'What is most urgent?', 'What are my upcoming deadlines?', 'Summarize everything'];
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const sendQuestion = async (nextQuestion) => {
    const finalQuestion = nextQuestion || question;
    if (!finalQuestion.trim()) return;

    setMessages((current) => [...current.slice(-4), { role: 'user', content: finalQuestion }]);
    setLoading(true);
    setQuestion('');

    try {
      const response = await onAsk(finalQuestion);
      setMessages((current) => [...current.slice(-4), { role: 'assistant', content: response.answer, sources: response.sourceDocs }]);
    } catch (error) {
      setMessages((current) => [...current.slice(-4), { role: 'assistant', content: error.response?.data?.message || 'AI is unavailable' }]);
    } finally {
      setLoading(false);
    }
  };

  const panel = (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button key={preset} onClick={() => sendQuestion(preset)} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">
            {preset}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? <p className="text-sm text-slate-500">Ask about your documents or tasks.</p> : null}
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`rounded-2xl px-4 py-3 text-sm ${message.role === 'user' ? 'ml-auto max-w-[90%] bg-blue-600 text-white' : 'max-w-[95%] bg-slate-100 text-slate-800'}`}>
            {message.content}
          </div>
        ))}
        {loading ? <div className="max-w-[95%] rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">Typing...</div> : null}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); sendQuestion(); }} className="mt-3 flex gap-2">
        <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask AI..." className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" />
        <button type="submit" className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700">
          <Send size={16} />
        </button>
      </form>
    </div>
  );

  if (compact) {
    return (
      <>
        <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-600/30 lg:hidden">
          <MessageSquareMore size={20} />
        </button>
        {open ? (
          <div className="fixed inset-0 z-40 bg-slate-950/60 p-4 lg:hidden" onClick={() => setOpen(false)}>
            <div className="absolute inset-x-0 bottom-0 rounded-t-[2rem] bg-white p-4" onClick={(event) => event.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-slate-900">Quick Ask AI</p>
                <button onClick={() => setOpen(false)}><X size={18} /></button>
              </div>
              {panel}
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return panel;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [tasksResponse, documentsResponse] = await Promise.all([api.get('/tasks'), api.get('/documents')]);
        setTasks(tasksResponse.data.tasks || []);
        setDocuments(documentsResponse.data.documents || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counts = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const overdue = tasks.filter((task) => task.status !== 'completed' && task.deadline && new Date(task.deadline) < new Date()).length;
    const dueToday = tasks.filter((task) => task.deadline && startOfDay(task.deadline).getTime() === startOfDay(new Date()).getTime()).length;
    return { total, completed, overdue, dueToday, completionRate: total ? Math.round((completed / total) * 100) : 0 };
  }, [tasks]);

  const todayTasks = useMemo(() => tasks.filter((task) => task.status !== 'completed' && (task.priority === 'high' || (task.deadline && startOfDay(task.deadline).getTime() === startOfDay(new Date()).getTime()))), [tasks]);

  const upcomingTasks = useMemo(() => {
    const now = startOfDay(new Date());
    const week = new Date(now);
    week.setDate(week.getDate() + 7);
    return tasks.filter((task) => task.deadline && new Date(task.deadline) >= now && new Date(task.deadline) <= week);
  }, [tasks]);

  const insightDocs = documents.slice(0, 3);

  const updateTaskStatus = async (task, nextStatus) => {
    const previousTasks = tasks;
    const updatedTasks = tasks.map((item) => (item._id === task._id ? { ...item, status: nextStatus } : item));
    setTasks(updatedTasks);

    const request = api.patch(`/tasks/${task._id}`, { status: nextStatus });
    toast.promise(request, {
      loading: 'Saving...',
      success: 'Updated!',
      error: 'Failed to save',
    });

    try {
      await request;
    } catch (error) {
      setTasks(previousTasks);
      toast.error('Failed to update');
    }
  };

  const askAI = async (question) => {
    const response = await api.post('/ask', { question });
    return response.data;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!tasks.length && !documents.length) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-6 flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm text-slate-500">Good to see you{user?.displayName ? `, ${user.displayName}` : ''}</p>
              <h1 className="text-2xl font-black text-slate-900">Smriti</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate('/upload')} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Add Document</button>
              <button onClick={signOut} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">Sign Out</button>
            </div>
          </header>
          <EmptyState icon="📄" title="Your Smriti is empty" subtitle="Upload your first document to get started." actionLabel="Upload Document" onAction={() => navigate('/upload')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="sticky top-4 z-20 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="flex items-center gap-2 font-black text-slate-900"><Brain className="text-blue-600" /> Smriti</button>
              <div className="hidden h-10 w-px bg-slate-200 lg:block" />
              <p className="text-sm text-slate-500">Good morning, {user?.displayName || user?.email || 'there'} 👋</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/upload')} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"><ArrowRight size={16} /> Add Document</button>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">{(user?.email || 'U')[0].toUpperCase()}</div>
              <button onClick={signOut} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Sign Out</button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard icon={Gauge} title="Total Tasks" value={counts.total} subtitle="tasks extracted" />
          <StatCard icon={CircleAlert} title="Overdue" value={counts.overdue} subtitle="need attention" accent={counts.overdue > 0} />
          <StatCard icon={Clock3} title="Due Today" value={counts.dueToday} subtitle="requires action" />
          <StatCard icon={CheckCheck} title="Completed" value={counts.completed} subtitle={`${counts.completionRate}% complete`} progress={counts.completionRate} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Quadrant title="🔥 Today's Priorities" subtitle="Urgent tasks that need your focus first">
            {todayTasks.length ? todayTasks.map((task) => <TaskRow key={task._id} task={task} onToggle={updateTaskStatus} />) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">🎉 Nothing urgent today! Check upcoming tasks.</div>}
            <button onClick={() => navigate('/documents')} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">View all tasks <ArrowRight size={14} /></button>
          </Quadrant>

          <Quadrant title="⏳ Upcoming Deadlines" subtitle="Next 7 days">
            {upcomingTasks.length ? <UpcomingTimeline tasks={upcomingTasks} /> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">No upcoming deadlines. You're all caught up!</div>}
          </Quadrant>

          <Quadrant title="💡 Key Insights" subtitle="From your latest documents">
            {insightDocs.length ? insightDocs.map((doc) => (
              <div key={doc._id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-2xl bg-blue-50 p-2 text-blue-600"><Lightbulb size={16} /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{(doc.insights || [doc.summary || 'No insight available'])[0]}</p>
                    <p className="mt-1 text-xs text-slate-500">From: {doc.name}</p>
                  </div>
                </div>
              </div>
            )) : <EmptyState icon="📄" title="Upload documents to see insights here." subtitle="Your latest documents will appear in this panel." />}
          </Quadrant>

          <div className="lg:block">
            <div className="hidden h-full lg:block">
              <QuickAskWidget onAsk={askAI} />
            </div>
          </div>
        </section>

        <div className="lg:hidden">
          <QuickAskWidget compact onAsk={askAI} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, subtitle, accent = false, progress = null }) {
  return (
    <div className={`rounded-3xl border bg-white p-5 shadow-sm ${accent ? 'border-red-200' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className={`rounded-2xl p-3 ${accent ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}><Icon size={18} /></div>
      </div>
      {typeof progress === 'number' ? (
        <div className="mt-4 h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
    </div>
  );
}

function Quadrant({ title, subtitle, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function UpcomingTimeline({ tasks }) {
  const grouped = tasks.reduce((accumulator, task) => {
    const label = new Date(task.deadline).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    accumulator[label] = accumulator[label] || [];
    accumulator[label].push(task);
    return accumulator;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([label, groupedTasks]) => (
        <div key={label}>
          <p className="mb-2 text-sm font-semibold text-slate-700">{label}</p>
          <div className="space-y-2">
            {groupedTasks.map((task) => (
              <div key={task._id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
                <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${getPriorityDot(task.priority)}`} />
                {task.task}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
