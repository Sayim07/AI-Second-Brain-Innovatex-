import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Eye, FileText, LayoutGrid, List, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import EmptyState from '../components/EmptyState';

function relativeTime(value) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export default function Documents() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [gridView, setGridView] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [documentsResponse, tasksResponse] = await Promise.all([api.get('/documents'), api.get('/tasks')]);
        setDocuments(documentsResponse.data.documents || []);
        setTasks(tasksResponse.data.tasks || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredDocuments = useMemo(() => documents.filter((document) => document.name.toLowerCase().includes(search.toLowerCase())), [documents, search]);
  const completedCount = tasks.filter((task) => task.status === 'completed').length;

  const loadDocTasks = async (documentId) => {
    const response = await api.get(`/documents/${documentId}`);
    return response.data.tasks || [];
  };

  const deleteDocument = async (documentId) => {
    const request = api.delete(`/documents/${documentId}`);
    toast.promise(request, {
      loading: 'Deleting...',
      success: 'Document deleted',
      error: 'Failed to delete',
    });

    try {
      await request;
      setDocuments((current) => current.filter((document) => document._id !== documentId));
      setExpandedDocId(null);
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete document');
    }
  };

  const updateTaskStatus = async (task, nextStatus) => {
    const previousTasks = tasks;
    setTasks((current) => current.map((item) => (item._id === task._id ? { ...item, status: nextStatus } : item)));
    try {
      await api.patch(`/tasks/${task._id}`, { status: nextStatus });
    } catch (error) {
      setTasks(previousTasks);
      toast.error('Failed to save');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 p-6 text-slate-900">Loading...</div>;
  }

  if (!documents.length) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-6 flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <h1 className="text-2xl font-black text-slate-900">📚 Your Documents</h1>
            <button onClick={() => navigate('/upload')} className="rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Upload New</button>
          </header>
          <EmptyState icon="📁" title="No documents uploaded" subtitle="Start by uploading a PDF or pasting an email." actionLabel="Upload Now" onAction={() => navigate('/upload')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">📚 Your Documents</h1>
              <p className="mt-1 text-sm text-slate-500">{documents.length} documents | {tasks.length} total tasks | {completedCount} completed</p>
            </div>
            <button onClick={() => navigate('/upload')} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              Upload New <ArrowRight size={16} />
            </button>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search documents..." className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-blue-500" />
            </div>
            <div className="flex rounded-full bg-slate-100 p-1 text-sm font-semibold text-slate-500">
              <button type="button" onClick={() => setGridView(false)} className={`rounded-full px-4 py-2 ${!gridView ? 'bg-blue-600 text-white shadow' : ''}`}><List size={16} /></button>
              <button type="button" onClick={() => setGridView(true)} className={`rounded-full px-4 py-2 ${gridView ? 'bg-blue-600 text-white shadow' : ''}`}><LayoutGrid size={16} /></button>
            </div>
          </div>
        </header>

        {gridView ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredDocuments.map((document) => (
              <div key={document._id} className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <button onClick={() => setConfirmDelete(document)} className="absolute right-4 top-4 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><FileText size={18} /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-bold text-slate-900">{document.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{relativeTime(document.createdAt)}</p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 text-sm text-slate-600">{document.summary}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{document.taskCount || 0} tasks</span>
                  <button onClick={() => setExpandedDocId(document._id)} className="text-sm font-semibold text-blue-600">View Tasks</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((document) => (
              <div key={document._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><FileText size={18} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{document.name}</h3>
                        <p className="text-sm text-slate-500">{relativeTime(document.createdAt)}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{document.taskCount || 0} tasks</span>
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm text-slate-600">{document.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button onClick={() => setExpandedDocId(expandedDocId === document._id ? null : document._id)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <Eye size={16} /> View Tasks
                      </button>
                      <button onClick={() => setConfirmDelete(document)} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </div>

                {expandedDocId === document._id ? (
                  <ExpandedTasks documentId={document._id} onUpdateStatus={updateTaskStatus} />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900">Delete Document?</h3>
            <p className="mt-3 text-sm text-slate-600">This will also delete {confirmDelete.taskCount || 0} tasks linked to this document. This cannot be undone.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700">Cancel</button>
              <button onClick={() => deleteDocument(confirmDelete._id)} className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white">Delete Forever</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ExpandedTasks({ documentId, onUpdateStatus }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await api.get(`/documents/${documentId}`);
      setTasks(response.data.tasks || []);
    })();
  }, [documentId]);

  if (!tasks.length) {
    return <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">No linked tasks found.</div>;
  }

  return (
    <div className="mt-4 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      {tasks.map((task) => (
        <div key={task._id} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-900">{task.task}</p>
              <p className="text-sm text-slate-500">{task.status}</p>
            </div>
            <div className="flex gap-2">
              {['pending', 'in-progress', 'completed'].map((status) => (
                <button key={status} onClick={() => onUpdateStatus(task, status)} className={`rounded-full px-3 py-1 text-xs font-semibold ${task.status === status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{status}</button>
              ))}
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
        View in Dashboard <ArrowRight size={14} />
      </button>
    </div>
  );
}
