import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Database,
  GitBranch,
  LayoutDashboard,
  Play,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import * as api from '../lib/api'
import { useTheme } from '../hooks/useTheme'
import { SectionHeader } from '../components/primitives'

gsap.registerPlugin(ScrollTrigger)

/* ─── NAV ─── */
function Nav({ theme, onToggle }: { theme: string; onToggle: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[var(--vigil-bg)]/90 backdrop-blur-xl shadow-2xl border border-[var(--vigil-border)]'
          : 'bg-transparent'
      }`}
      style={{ borderRadius: 9999, padding: '10px 24px', height: '64px' }}
    >
      <div className="flex items-center gap-6 h-full">
        <Link to="/" className="flex items-center gap-2 text-[var(--vigil-text)] font-bold text-base tracking-tight no-underline">
          <svg viewBox="0 0 28 28" width={20} height={20} fill="none" aria-hidden="true">
            <path d="M14 2L2 26L14 20L26 26L14 2Z" fill="#f59e0b" />
            <path d="M14 2L14 20L2 26L14 2Z" fill="#d97706" />
          </svg>
          Vigil
        </Link>
        <div className="hidden md:flex items-center gap-5 text-xs font-mono uppercase tracking-wider text-[var(--vigil-muted)]">
          <a href="#features" className="hover:text-[var(--vigil-text)] transition-colors no-underline">Platform</a>
          <a href="#workflow" className="hover:text-[var(--vigil-text)] transition-colors no-underline">Workflow</a>
          <a href="#integrity" className="hover:text-[var(--vigil-text)] transition-colors no-underline">Trust</a>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="text-[10px] font-mono uppercase tracking-wider text-[var(--vigil-muted)] bg-transparent border-none cursor-pointer hover:text-[var(--vigil-accent)] transition-colors"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <Link
            to="/dashboard"
            className="px-4 py-1.5 rounded-full text-xs font-bold border border-[var(--vigil-border)] bg-white/[0.02] text-[var(--vigil-text)] no-underline hover:border-[var(--vigil-accent)] hover:text-[var(--vigil-accent)] transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  )
}

/* ─── HERO ─── */
function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return

    if (!titleRef.current || !previewRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.1,
      })
      gsap.from(previewRef.current, {
        y: 40,
        opacity: 0,
        scale: 0.98,
        duration: 1.0,
        ease: 'power2.out',
        delay: 0.3,
      })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative min-h-[100dvh] flex items-center overflow-hidden pt-20 pb-12">
      {/* Background ambient grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(var(--vigil-border) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Headline */}
        <div className="lg:col-span-6 flex flex-col items-start">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase border border-[var(--vigil-accent)]/20 bg-[var(--vigil-accent)]/5 text-[var(--vigil-accent)] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--vigil-accent)] animate-pulse" />
            Local-First Incident Intelligence
          </div>
          <h1
            ref={titleRef}
            className="text-[clamp(2.25rem,4.5vw,4.5rem)] font-extrabold leading-[0.98] tracking-tight text-[var(--vigil-text)] mb-6"
          >
            Industrial incidents parsed with cryptographic integrity.
          </h1>
          <p className="text-sm text-[var(--vigil-muted)] max-w-lg leading-relaxed mb-8">
            Vigil aggregates sensor telemetry, correlates maintenance history, recommends deterministic overrides, and seals decision audits with tamper-proof Merkle proofs. Runs entirely on your infrastructure.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-extrabold bg-[var(--vigil-accent)] text-slate-950 no-underline hover:brightness-110 transition-all shadow-md active:scale-[0.98]"
            >
              <LayoutDashboard size={14} />
              Launch Operations Workbench
            </Link>
            <a
              href="#workflow"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-bold border border-[var(--vigil-border)] bg-white/[0.02] text-[var(--vigil-text)] no-underline hover:border-[var(--vigil-accent)]/30 hover:text-[var(--vigil-accent)] transition-all active:scale-[0.98]"
            >
              <Play size={14} />
              See How It Works
            </a>
          </div>
        </div>

        {/* Right: Product Preview */}
        <div ref={previewRef} className="lg:col-span-6 w-full">
          <div
            className="rounded-xl border border-[var(--vigil-border)] overflow-hidden bg-gradient-to-br from-[#0b0f19] to-[#030712] p-5 shadow-2xl"
            style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}
          >
            <div className="flex items-center justify-between border-b border-[var(--vigil-border)] pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--vigil-muted)]">vigil-node-01</span>
              </div>
              <span className="font-mono text-[9px] text-[var(--vigil-dim)]">Normal Operations</span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'ontario-line1-temp', val: '86.4 C', status: 'critical', trend: [80, 82, 81, 84, 85, 87, 86, 88, 86] },
                { name: 'ontario-line1-vibration', val: '2.14 Gs', status: 'normal', trend: [1.2, 1.4, 1.3, 1.1, 1.5, 1.3, 1.2, 1.4, 1.3] },
                { name: 'detroit-press-vibration', val: '5.18 Gs', status: 'warning', trend: [3.4, 3.8, 4.1, 4.3, 4.6, 5.0, 4.9, 5.2, 5.1] }
              ].map((s) => (
                <div key={s.name} className="p-3 rounded-lg border border-white/[0.02] bg-white/[0.01] flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-[11px] text-[var(--vigil-text)] font-semibold">{s.name}</span>
                    <span className="text-[10px] text-[var(--vigil-muted)] mt-0.5">Value: <span className="font-mono text-[var(--vigil-text)]">{s.val}</span></span>
                  </div>
                  <div className="w-24 h-6 flex-shrink-0">
                    <svg viewBox="0 0 100 30" width="100%" height="100%">
                      <path
                        d={`M ${s.trend.map((val, i) => `${(i / (s.trend.length - 1)) * 100},${30 - ((val - Math.min(...s.trend)) / (Math.max(...s.trend) - Math.min(...s.trend) || 1)) * 24 - 3}`).join(' L ')}`}
                        fill="none"
                        stroke={s.status === 'critical' ? '#ef4444' : s.status === 'warning' ? '#f59e0b' : '#10b981'}
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase tracking-wider font-extrabold ${
                    s.status === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    s.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── LIVE PULSE BAR ─── */
function PulseBar() {
  const [health, setHealth] = useState({ events_last_hour: 0, incidents_open: 0, data_quality: '-', mesh_nodes: 0, last_ingest: '-' })

  useEffect(() => {
    let active = true
    async function load() {
      const h = await api.getHealth()
      if (!active) return
      setHealth(h)
    }
    load()
    const iv = setInterval(load, 5000)
    return () => { active = false; clearInterval(iv) }
  }, [])

  return (
    <section className="py-6 px-6 border-y border-[var(--vigil-border)] bg-[var(--vigil-card)]/40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 font-mono text-[10px] text-[var(--vigil-muted)]">
        <div className="flex items-center gap-1.5 text-[var(--vigil-accent)] font-bold tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--vigil-accent)] animate-pulse" />
          SYSTEM LIVE PULSE
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <div>EVENTS PER HOUR: <span className="text-[var(--vigil-text)] font-bold">{health.events_last_hour}</span></div>
          <div>DATA INTEGRITY QUALITY: <span className="text-[var(--vigil-text)] font-bold">{health.data_quality}</span></div>
          <div>ACTIVE OPEN ALERTS: <span className="text-[var(--vigil-text)] font-bold">{health.incidents_open}</span></div>
          <div>PEER MESH NODES: <span className="text-[var(--vigil-text)] font-bold">{health.mesh_nodes}</span></div>
        </div>
      </div>
    </section>
  )
}

/* ─── PLATFORM FEATURES (BENTO) ─── */
function Features() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches || !sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.bento-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const cards = [
    {
      title: 'Traceable Root Causes',
      desc: 'Each triggered event compiles rule execution metadata, contributing sensors, and historical telemetry baselines.',
      icon: <BrainCircuit size={20} />,
      span: 'col-span-2 row-span-2'
    },
    {
      title: 'Actionable Cockpit Overrides',
      desc: 'Shift operators submit decisions, maintenance tickets, and overrides into a unified tamper-proof journal.',
      icon: <Zap size={20} />,
      span: 'col-span-2 row-span-1'
    },
    {
      title: 'Cryptographic Ledger Verification',
      desc: 'All operator state shifts are committed into a Merkle-DAG chain, ensuring audit lines remain sealed.',
      icon: <ShieldCheck size={20} />,
      span: 'col-span-1 row-span-2'
    },
    {
      title: 'Zero-Cloud Local Resilience',
      desc: 'Powered natively by Sled for telemetry series and SQLite for application state. Completely isolated.',
      icon: <Database size={20} />,
      span: 'col-span-1 row-span-1'
    },
    {
      title: 'Out-Of-Order Event Tolerant',
      desc: 'Engineered specifically for industrial networking, parsing duplicate notes and delayed PLC logs.',
      icon: <CheckCircle2 size={20} />,
      span: 'col-span-2 row-span-1'
    }
  ]

  return (
    <section ref={sectionRef} id="features" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto relative z-10">
        <SectionHeader
          eyebrow="Platform Design"
          title="A high-density operational ledger."
          description="Vigil streamlines diagnostic evidence, rule triggers, and operator overrides into a single visual context, avoiding the friction of siloed tooling."
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[160px]">
          {cards.map((card, i) => (
            <div
              key={i}
              className={`bento-card relative rounded-xl border border-[var(--vigil-border)] bg-[#0b0f19]/40 p-5 flex flex-col justify-between hover:border-[var(--vigil-accent)]/30 transition-colors ${card.span}`}
            >
              <div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--vigil-accent)]/10 border border-[var(--vigil-accent)]/20 text-[var(--vigil-accent)] mb-3 flex-shrink-0">
                  {card.icon}
                </div>
                <h3 className="text-sm font-bold text-[var(--vigil-text)] mb-1">{card.title}</h3>
                <p className="text-xs text-[var(--vigil-muted)] leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── TECH MARQUEE ─── */
function TechMarquee() {
  const items = [
    'Rust Engine',
    'SQLite Backend',
    'Sled Telemetry Chain',
    'Merkle DAG Integrity',
    'WebSocket Broadcast',
    'Deterministic Correlation',
    'Zero SaaS Cores',
    'Operator Ledger',
    'Local-First Databases',
  ]
  const doubled = [...items, ...items]

  return (
    <section className="py-8 overflow-hidden border-y border-[var(--vigil-border)] bg-black/20">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="mx-6 text-sm font-mono font-bold tracking-[0.2em] text-[var(--vigil-dim)] select-none">
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}

/* ─── PLATFORM WORKFLOW ─── */
function Workflow() {
  const steps = [
    { title: 'Ingestion Layer', desc: 'Parses raw machine telemetry logs and operator journals concurrently.' },
    { title: 'Incident Correlation', desc: 'Evaluates windowed correlation rules to group telemetry spikes.' },
    { title: 'Reasoning Explanations', desc: 'Compiles rules evidence and telemetry sparklines cleanly.' },
    { title: 'Operator Journaling', desc: 'Logs actions, assignments, and structural overrides natively.' },
    { title: 'Merkle Replication', desc: 'Seals historical audits with content-addressable Merkle hashes.' },
  ]

  return (
    <section id="workflow" className="py-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <SectionHeader
            eyebrow="Decision Chain"
            title="Unified platform workflows."
            description="Trace rule evaluations and human decisions in a single cryptographic lineage."
          />
        </div>
        <div className="lg:col-span-7 flex flex-col gap-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-xl border border-[var(--vigil-border)] bg-white/[0.01] hover:border-[var(--vigil-accent)]/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center bg-[var(--vigil-accent)]/10 border border-[var(--vigil-accent)]/20 text-[var(--vigil-accent)] font-mono font-bold text-sm">
                {i + 1}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--vigil-text)] mb-0.5">{step.title}</h4>
                <p className="text-xs text-[var(--vigil-muted)] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── CRYPTOGRAPHIC INTEGRITY ─── */
function Integrity() {
  return (
    <section id="integrity" className="py-24 px-6 border-t border-[var(--vigil-border)] bg-[var(--vigil-card)]/20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <SectionHeader
            eyebrow="Cryptographic Trust"
            title="Auditing with sealed integrity."
            description="Every shift override, copilot summary request, and rule execution is mapped to a cryptographic Merkle root. Technical reviews are conducted with fully verifiable event chains."
          />
          <div className="space-y-4">
            {[
              { icon: <ShieldCheck size={16} />, title: 'Immutable Node Baselines', desc: 'Secure local storage ensures logs cannot be modified retroactively.' },
              { icon: <Activity size={16} />, title: 'Sealed Operator Journals', desc: 'Tracks exactly who, when, and why an operational override occurred.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <div className="font-bold text-[var(--vigil-text)] text-xs mb-0.5">{item.title}</div>
                  <div className="text-xs text-[var(--vigil-muted)] leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 p-6 bg-gradient-to-br from-emerald-500/[0.03] to-[#0b0f19] relative overflow-hidden">
          <div className="font-mono text-[10px] text-emerald-400 font-bold mb-1">Merkle DAG Audit</div>
          <div className="font-mono text-[9px] text-[var(--vigil-dim)] mb-4">Chain verification: active</div>
          <div className="space-y-2">
            {[
              'root: 0x7a3f9c2e8b1d4f6a0e5c3b9d7f2a8e1c4b6d0f3a9e7c2b5d8f1a4e6c3b9d7f2a',
              'proof[0]: 0x3b9d7f2a8e1c4b6d0f3a9e7c2b5d8f1a4e6c3b9d7f2a7a3f9c2e8b1d4f6a0e5c'
            ].map((hash, i) => (
              <div key={i} className="font-mono text-[9px] text-emerald-400 break-all p-2 bg-black/40 border border-emerald-500/10 rounded-lg">
                {hash}
              </div>
            ))}
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
            <CheckCircle2 size={12} />
            Valid Merkle path - data untampered
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── CALL TO ACTION ─── */
function Cta() {
  return (
    <section className="py-24 px-6 border-t border-[var(--vigil-border)]">
      <div className="max-w-4xl mx-auto text-center">
        <SectionHeader
          align="center"
          eyebrow="Get Started"
          title="Defensible decision intelligence."
          description="Aggregating telemetry, explaining correlations, and verifying decisions natively on your operational nodes."
        />
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-extrabold bg-[var(--vigil-accent)] text-slate-950 no-underline hover:brightness-110 transition-all shadow-md active:scale-[0.98]"
          >
            <LayoutDashboard size={14} />
            Launch Workbench
          </Link>
          <a
            href="https://github.com/AngelP17/Vigil-ForgeMesh-"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-bold border border-[var(--vigil-border)] bg-white/[0.02] text-[var(--vigil-text)] no-underline hover:border-[var(--vigil-accent)]/30 hover:text-[var(--vigil-accent)] transition-all active:scale-[0.98]"
          >
            <GitBranch size={14} />
            View Source Code
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="border-t border-[var(--vigil-border)] py-8 px-6 bg-[var(--vigil-bg)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[10px] text-[var(--vigil-dim)]">
        <Link to="/" className="flex items-center gap-2 text-[var(--vigil-text)] font-bold no-underline">
          <svg viewBox="0 0 28 28" width={16} height={16} fill="none" aria-hidden="true">
            <path d="M14 2L2 26L14 20L26 26L14 2Z" fill="#f59e0b" />
            <path d="M14 2L14 20L2 26L14 2Z" fill="#d97706" />
          </svg>
          Vigil
        </Link>
        <div>
          Operational Incident Intelligence. Merkle-Backed Verification. Zero SaaS Cores.
        </div>
      </div>
    </footer>
  )
}

/* ─── MAIN LANDING PAGE ─── */
export default function Landing() {
  const { theme, toggle } = useTheme()

  return (
    <main className="overflow-x-hidden w-full bg-[var(--vigil-bg)] min-h-[100dvh]">
      <Nav theme={theme} onToggle={toggle} />
      <Hero />
      <PulseBar />
      <Features />
      <TechMarquee />
      <Workflow />
      <Integrity />
      <Cta />
      <Footer />
    </main>
  )
}
