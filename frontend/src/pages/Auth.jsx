import { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, Mail, Sparkles } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.5 3.5-5.5 3.5-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.5l2.7-2.6C16.2 1.9 14.3 1 12 1 6.9 1 2.9 5 2.9 10s4 9 9.1 9c5.3 0 8.8-3.7 8.8-8.9 0-.6-.1-1.1-.2-1.5H12Z" />
      <path fill="#34A853" d="M3.4 6.8l3.5 2.6C7.9 7.1 9.7 6 12 6c1.9 0 3.2.8 4 1.5l2.7-2.6C16.2 2 14.3 1 12 1 8.1 1 4.8 3.3 3.4 6.8Z" />
      <path fill="#FBBC05" d="M12 19c2.3 0 4.3-.8 5.7-2.2l-2.6-2.1c-.7.5-1.7 1.1-3.1 1.1-2.3 0-4.1-1.5-4.8-3.6l-3.5 2.7C5.1 16.7 8.2 19 12 19Z" />
      <path fill="#4285F4" d="M20.8 10.1H12v3.9h5c-.2 1.1-.8 2-1.8 2.7l2.6 2.1C19.2 17.1 20.8 14.5 20.8 10.1Z" />
    </svg>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle, loading } = useAuth();
  const [mode, setMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!emailPattern.test(form.email)) nextErrors.email = 'Enter a valid email address';
    if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';

    if (mode === 'signup') {
      if (!form.displayName.trim()) nextErrors.displayName = 'Display name is required';
      if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      if (mode === 'signin') {
        await signIn(form.email, form.password);
      } else {
        await signUp(form.email, form.password, form.displayName);
      }
      navigate('/dashboard');
    } catch (error) {
      const code = error.code || '';
      const message = {
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'Email already registered. Sign in instead.',
        'auth/weak-password': 'Password must be at least 6 characters',
        default: 'Something went wrong. Please try again.',
      }[code] || error.message || 'Something went wrong. Please try again.';
      setErrors((current) => ({ ...current, form: message }));
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      setErrors((current) => ({ ...current, form: error.message || 'Something went wrong. Please try again.' }));
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr,0.9fr]">
      <aside className="hidden flex-col justify-between bg-[linear-gradient(160deg,#1e3a8a_0%,#1e40af_100%)] px-10 py-12 text-white lg:flex">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100">
            <Sparkles size={16} /> Smriti
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-tight">Smriti</h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-blue-100">Your personal system for extracting tasks, deadlines, and action items from the things you already read.</p>
        </div>
        <div className="space-y-4 text-base text-blue-50">
          <div className="flex items-center gap-3"><span className="text-emerald-300">✓</span> Extract tasks from any document</div>
          <div className="flex items-center gap-3"><span className="text-emerald-300">✓</span> Never miss a deadline again</div>
          <div className="flex items-center gap-3"><span className="text-emerald-300">✓</span> Ask AI about your own data</div>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-8">
          <div className="mb-8 lg:hidden">

            <h1 className="mt-3 text-3xl font-black text-slate-900">Smriti</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in or create an account to continue.</p>
          </div>

          <div className="flex rounded-full bg-slate-100 p-1 text-sm font-semibold text-slate-500">
            <button type="button" onClick={() => setMode('signin')} className={`flex-1 rounded-full px-4 py-2 transition ${mode === 'signin' ? 'bg-blue-600 text-white shadow' : ''}`}>Sign In</button>
            <button type="button" onClick={() => setMode('signup')} className={`flex-1 rounded-full px-4 py-2 transition ${mode === 'signup' ? 'bg-blue-600 text-white shadow' : ''}`}>Sign Up</button>
          </div>

          <button type="button" onClick={handleGoogle} className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <GoogleIcon /> Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> or continue with email <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Display Name</label>
                <input value={form.displayName} onChange={(event) => updateField('displayName', event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" placeholder="Your name" />
                {errors.displayName ? <p className="mt-1 text-sm text-red-500">{errors.displayName}</p> : null}
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500" placeholder="you@example.com" />
              </div>
              {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => updateField('password', event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 outline-none transition focus:border-blue-500" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password ? <p className="mt-1 text-sm text-red-500">{errors.password}</p> : null}
            </div>

            {mode === 'signup' ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
                <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" placeholder="••••••••" />
                {errors.confirmPassword ? <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p> : null}
              </div>
            ) : null}

            {errors.form ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</div> : null}

            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'signin' ? (
            <p className="mt-5 text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <button type="button" onClick={() => setMode('signup')} className="font-semibold text-blue-600 hover:text-blue-700">
                Sign Up
              </button>
            </p>
          ) : (
            <p className="mt-5 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('signin')} className="font-semibold text-blue-600 hover:text-blue-700">
                Sign In
              </button>
            </p>
          )}

          <p className="mt-6 text-center text-xs text-slate-400">Success messages use react-hot-toast. Errors stay inline for clarity.</p>
        </div>
      </main>
    </div>
  );
}
