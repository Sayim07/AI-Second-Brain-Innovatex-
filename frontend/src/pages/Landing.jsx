import { ArrowRight, Brain, CheckCircle2, FileText, Menu, Sparkles, Upload, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SplineScene } from '@/components/ui/splite';

function FeatureCard({ icon: Icon, title, description, index }) {
  return (
    <div className="rounded-3xl border border-slate-700/70 bg-slate-800/60 p-6 shadow-xl shadow-slate-950/30 backdrop-blur">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
        <Icon size={22} />
      </div>
      <div className="mb-2 text-sm font-semibold text-blue-300">0{index + 1}</div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Spline 3D background - layer 0 */}
      <div className="fixed inset-0 top-0 left-0 w-full h-full z-0 pointer-events-none opacity-90">
        <SplineScene scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" className="w-full h-full" />
      </div>
      
      {/* Gradient overlay - layer 1 */}
      <div className="fixed inset-0 top-0 left-0 h-full w-full z-0 pointer-events-none bg-gradient-to-b from-slate-900/70 to-slate-900/20" />
      
      {/* All content - layer 2+ */}
      <div className="relative z-10">
      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/15 text-2xl">🧠</span>
          <span>Second Brain</span>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/auth')} className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 sm:inline-flex">Sign In</button>
          <button onClick={() => navigate('/auth')} className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600">
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <section className="grid min-h-[calc(100vh-92px)] place-items-center py-10">
          <div className="max-w-4xl text-center animate-fadeUp">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm text-slate-200 shadow-lg shadow-slate-950/20">
              <Sparkles size={14} className="text-blue-400" />
              🚀 Hackathon Build 2026
            </div>
            <h1 className="text-balance text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Your AI does not just store information -
              <span className="block text-blue-400">it tells you exactly what to do next.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Upload emails, PDFs, and notes. Get a prioritized action plan in under 30 seconds.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button onClick={() => navigate('/auth')} className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-600">
                Start for Free <ArrowRight size={16} />
              </button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">
                See How It Works <ArrowRight size={16} className="rotate-90" />
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-400">No credit card. No setup. Just upload.</p>
          </div>
        </section>

        <section id="features" className="py-10">
          <div className="mb-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Three steps from inbox to action</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard icon={Upload} index={0} title="Upload Anything" description="Drop a PDF, paste an email, or type notes. We handle any format." />
            <FeatureCard icon={Brain} index={1} title="AI Processes It" description="Our AI reads, understands, and extracts every task and deadline." />
            <FeatureCard icon={CheckCircle2} index={2} title="Get Your Plan" description="See exactly what to do today, what is urgent, and what can wait." />
          </div>
        </section>

        <section className="py-14">
          <div className="rounded-3xl border border-slate-700 bg-slate-800/60 p-6 shadow-2xl shadow-slate-950/30">
            <h2 className="text-2xl font-bold text-white">Why not just use ChatGPT or Notion?</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-700">
              <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
                <thead className="bg-slate-900/60 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Feature</th>
                    <th className="px-4 py-3 font-medium">Normal Tools</th>
                    <th className="px-4 py-3 font-medium text-blue-300">AI Second Brain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 bg-slate-800/40 text-slate-100">
                  {[
                    ['Auto-extracts tasks', '❌', '✅'],
                    ['Proactive action plan', '❌', '✅'],
                    ['Works on YOUR data', '❌', '✅'],
                    ['Remembers context', '❌', '✅'],
                    ['Tells you what to do', '❌', '✅'],
                  ].map(([feature, normalTools, secondBrain]) => (
                    <tr key={feature}>
                      <td className="px-4 py-3 font-medium text-white">{feature}</td>
                      <td className="px-4 py-3 text-slate-400">{normalTools}</td>
                      <td className="px-4 py-3 font-semibold text-blue-300">{secondBrain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-10">
          <h2 className="text-2xl font-bold text-white">Paste this email -&gt; Get this output</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-700 bg-slate-950 p-6">
              <p className="mb-4 text-sm font-semibold text-slate-400">Raw email text</p>
              <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
Hi, your package is out for delivery tomorrow between 10AM and 6PM.
Please keep the OTP ready before accepting the parcel.
The package contains a mechanical keyboard.
              </pre>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-800/60 p-6">
              <p className="mb-4 text-sm font-semibold text-slate-400">Extracted tasks</p>
              <div className="space-y-3">
                {[
                  ['Be available to receive delivery between 10AM-6PM', 'high'],
                  ['Keep delivery OTP ready', 'high'],
                  ['Verify package seal before accepting', 'medium'],
                ].map(([task, priority]) => (
                  <div key={task} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{task}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priority === 'high' ? 'bg-red-500/15 text-red-300' : 'bg-amber-500/15 text-amber-300'}`}>
                        {priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 text-center">
          <h2 className="text-3xl font-black text-white sm:text-5xl">Ready to stop searching and start doing?</h2>
          <button onClick={() => navigate('/auth')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-600">
            Upload Your First Document <ArrowRight size={16} />
          </button>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400">
            <FileText size={16} /> Built with love for hackathon 2026
          </div>
        </section>
      </main>
      </div>
    </div>
  );
}
