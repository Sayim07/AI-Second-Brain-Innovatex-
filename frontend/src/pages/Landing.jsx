import { ArrowRight, Brain, CheckCircle2, FileText, Menu, Sparkles, Upload, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import PixelBlast from '@/components/ui/PixelBlast';
import { SplineScene } from '@/components/ui/splite';
import BorderGlow from '@/components/ui/BorderGlow';
import ShinyText from '@/components/ui/ShinyText';
import PillButton from '@/components/ui/PillButton';
import RotatingText from '@/components/ui/RotatingText';
import TrueFocus from '@/components/ui/TrueFocus';

function FadeIn({ children, delay = 0, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, index }) {
  return (
    <FadeIn delay={index * 150} className="h-full">
      <BorderGlow
        className="h-full"
        backgroundColor="rgba(30, 41, 59, 0.6)"
        borderRadius={24}
        glowColor="217 91 60"
      >
        <div className="p-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
            <Icon size={22} />
          </div>
          <div className="mb-2 text-sm font-semibold text-blue-300">0{index + 1}</div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        </div>
      </BorderGlow>
    </FadeIn>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* 3D Robot background - layer 0 */}
      <div className="fixed inset-0 top-0 left-0 w-full h-full z-0 pointer-events-none opacity-60">
        <SplineScene scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" className="w-full h-full" />
      </div>

      {/* PixelBlast background overlay - layer 1 */}
      <div className="fixed inset-0 top-0 left-0 w-full h-full z-0 pointer-events-none opacity-60 mix-blend-screen">
        <PixelBlast
          className="w-full h-full"
          color="#3B82F6"
          pixelSize={3}
          patternScale={1.8}
          patternDensity={0.92}
          liquid={false}
          enableRipples={false}
          speed={0.4}
          edgeFade={0.32}
          transparent
        />
      </div>
      
      {/* Gradient overlay - layer 2 */}
      <div className="fixed inset-0 top-0 left-0 h-full w-full z-0 pointer-events-none bg-gradient-to-b from-slate-900/78 to-slate-900/30" />
      
      {/* All content - layer 2+ */}
      <div className="relative z-10">
      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 text-lg font-bold tracking-tight text-white">
          <img src="/logo.png" alt="Smriti Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
          <TrueFocus
            manualMode={false}
            borderColor="#3b82f6"
            glowColor="rgba(59, 130, 246, 0.6)"
            animationDuration={0.6}
            pauseBetweenAnimations={2}
            className="flex items-center gap-2"
          >
            <span className="text-xl font-bold tracking-tight text-white">Smriti</span>
            <span className="hidden sm:inline-flex items-center text-sm font-medium text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
              <RotatingText
                texts={['Your second AI Brain', 'Your Action Engine', 'Your Smart Assistant']}
                mainClassName="overflow-hidden"
                staggerFrom="last"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-120%' }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                rotationInterval={3000}
              />
            </span>
          </TrueFocus>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/auth')} className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 sm:inline-flex">Sign In</button>
          <PillButton onClick={() => navigate('/auth')} className="px-4 py-2.5 text-sm">
            Get Started <ArrowRight size={16} />
          </PillButton>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <section className="grid min-h-[calc(100vh-92px)] place-items-center py-10">
          <div className="max-w-4xl text-center animate-fadeUp">

            <h1 className="text-balance text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl" style={{ textShadow: '0 0 40px rgba(59,130,246,0.45), 0 0 80px rgba(59,130,246,0.2)' }}>
              <ShinyText text="Turn Chaos Into" speed={3} color="#ffffff" shineColor="#3b82f6" />
              <span className="block text-blue-400" style={{ textShadow: '0 0 30px rgba(96,165,250,0.6), 0 0 60px rgba(59,130,246,0.3)' }}>
                <ShinyText text="Clear Actions." speed={3} color="#60a5fa" shineColor="#ffffff" />
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl" style={{ textShadow: '0 0 20px rgba(148,163,184,0.4)' }}>
              Upload emails, PDFs, and notes. Get a prioritized action plan in under 30 seconds.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <PillButton onClick={() => navigate('/auth')} className="px-6 py-3.5 text-base">
                Start for Free <ArrowRight size={16} />
              </PillButton>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">
                See How It Works <ArrowRight size={16} className="rotate-90" />
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-400" style={{ textShadow: '0 0 12px rgba(148,163,184,0.35)' }}>No credit card. No setup. Just upload.</p>
          </div>
        </section>

        <section id="features" className="py-10">
          <FadeIn className="mb-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400" style={{ textShadow: '0 0 14px rgba(96,165,250,0.7)' }}>How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-white" style={{ textShadow: '0 0 24px rgba(59,130,246,0.4), 0 0 48px rgba(59,130,246,0.15)' }}>Three steps from inbox to action</h2>
          </FadeIn>
          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard icon={Upload} index={0} title="Upload Anything" description="Drop a PDF, paste an email, or type notes. We handle any format." />
            <FeatureCard icon={Brain} index={1} title="AI Processes It" description="Our AI reads, understands, and extracts every task and deadline." />
            <FeatureCard icon={CheckCircle2} index={2} title="Get Your Plan" description="See exactly what to do today, what is urgent, and what can wait." />
          </div>
        </section>

        <section className="py-14">
          <FadeIn delay={200}>
            <BorderGlow
              backgroundColor="rgba(30, 41, 59, 0.6)"
              borderRadius={24}
              glowColor="217 91 60"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(59,130,246,0.35)' }}>Why not just use ChatGPT or Notion?</h2>
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-700">
                  <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
                    <thead className="bg-slate-900/60 text-slate-300">
                      <tr>
                        <th className="px-4 py-3 font-medium">Feature</th>
                        <th className="px-4 py-3 font-medium">Normal Tools</th>
                        <th className="px-4 py-3 font-medium text-blue-300">Smriti</th>
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
            </BorderGlow>
          </FadeIn>
        </section>

        <section className="py-10">
          <FadeIn>
            <h2 className="text-2xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(59,130,246,0.35)' }}>Paste this email -&gt; Get this output</h2>
          </FadeIn>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <FadeIn delay={100} className="h-full">
              <BorderGlow
                className="h-full"
                backgroundColor="#020617"
                borderRadius={24}
                glowColor="217 91 60"
              >
                <div className="p-6">
                  <p className="mb-4 text-sm font-semibold text-slate-400">Raw email text</p>
                  <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    Hi, your package is out for delivery tomorrow between 10AM and 6PM.
                    Please keep the OTP ready before accepting the parcel.
                    The package contains a mechanical keyboard.
                  </pre>
                </div>
              </BorderGlow>
            </FadeIn>
            <FadeIn delay={300} className="h-full">
              <BorderGlow
                className="h-full"
                backgroundColor="rgba(30, 41, 59, 0.6)"
                borderRadius={24}
                glowColor="217 91 60"
              >
                <div className="p-6">
                  <p className="mb-4 text-sm font-semibold text-slate-400">Extracted tasks</p>
                  <div className="space-y-3">
                    {[
                      ['Be available to receive delivery between 10AM-6PM', 'high'],
                      ['Keep delivery OTP ready', 'high'],
                      ['Verify package seal before accepting', 'medium'],
                    ].map(([task, priority]) => (
                      <div key={task} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 transition-all hover:-translate-y-0.5 hover:border-slate-600">
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
              </BorderGlow>
            </FadeIn>
          </div>
        </section>

        <section className="py-14 text-center">
          <FadeIn delay={100}>
            <h2 className="text-3xl font-black text-white sm:text-5xl" style={{ textShadow: '0 0 32px rgba(59,130,246,0.5), 0 0 64px rgba(59,130,246,0.2)' }}>Ready to stop searching and start doing?</h2>
            <PillButton onClick={() => navigate('/auth')} className="mt-6 px-6 py-3.5 text-base">
              Upload Your First Document <ArrowRight size={16} />
            </PillButton>

          </FadeIn>
        </section>
      </main>
      </div>
    </div>
  );
}
