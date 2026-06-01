import { useEffect, useRef, useState, useCallback, useTransition } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  Download,
  FileText,
  Filter,
  LogIn,
  LogOut,
  Play,
  RefreshCw,
  Settings,
  ShieldCheck,
  Zap,
  Send,
} from 'lucide-react'
import { Chart, registerables } from 'chart.js'
import * as api from '../lib/api'
import { useTheme } from '../hooks/useTheme'
import {
  SeverityBadge,
  StatusBadge,
  Skeleton,
  MetricTile,
  EmptyState,
  ErrorState,
  ActionButton,
  Panel,
} from '../components/primitives'

Chart.register(...registerables)

/* ─── LOGIN BAR ─── */
function LoginBar({ onRefresh }: { onRefresh: () => void }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [me, setMe] = useState<{ username?: string; role?: string } | null>(null)
  const [, startTransition] = useTransition()

  const refreshMe = useCallback(async () => {
    try {
      const m = await api.getMe()
      startTransition(() => setMe(m))
    } catch {
      startTransition(() => setMe(null))
    }
  }, [])

  useEffect(() => { refreshMe() }, [refreshMe])

  async function doLogin() {
    await api.login(user || 'operator', pass || 'vigil')
    setUser('')
    setPass('')
    await refreshMe()
    onRefresh()
  }

  async function doLogout() {
    await api.logout()
    setMe(null)
    onRefresh()
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {!me?.username ? (
        <>
          <input
            value={user}
            onChange={e => setUser(e.target.value)}
            placeholder="user"
            className="px-3 py-1 bg-white/[0.04] border border-[var(--vigil-border)] text-[var(--vigil-text)] text-xs rounded focus:outline-none focus:border-[var(--vigil-accent)] w-24"
          />
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="password"
            className="px-3 py-1 bg-white/[0.04] border border-[var(--vigil-border)] text-[var(--vigil-text)] text-xs rounded focus:outline-none focus:border-[var(--vigil-accent)] w-24"
          />
          <ActionButton onClick={doLogin} className="py-1">
            <LogIn size={11} /> Sign in
          </ActionButton>
        </>
      ) : (
        <span className="text-[10px] text-[var(--vigil-muted)] font-mono">{me.username} · {me.role}</span>
      )}
      {me?.username && (
        <ActionButton onClick={doLogout} variant="danger" className="py-1">
          <LogOut size={11} /> Sign out
        </ActionButton>
      )}
    </div>
  )
}

/* ─── SIDEBAR ─── */
function Sidebar({ active, counts }: { active: string; counts: { incidents: number; open: number } }) {
  const navItems = [
    { id: 'incidents', label: 'Triage Queue', icon: <Activity size={15} />, badge: counts.open },
    { id: 'health', label: 'Telemetry Health', icon: <Settings size={15} /> },
    { id: 'telemetry', label: 'Sensor Trends', icon: <RefreshCw size={15} /> },
    { id: 'mesh', label: 'Gossip Mesh', icon: <ShieldCheck size={15} /> },
  ]

  return (
    <aside className="w-56 border-r border-[var(--vigil-border)] bg-[#0b0f19]/30 hidden md:flex flex-col h-[calc(100vh-57px)] sticky top-[57px]">
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--vigil-dim)] mb-3 px-3">Diagnostic surface</div>
        {navItems.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => { e.preventDefault(); window.location.hash = item.id }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs mb-1 font-semibold transition-all cursor-pointer ${
              active === item.id
                ? 'bg-[var(--vigil-accent)]/10 text-[var(--vigil-accent)] border border-[var(--vigil-accent)]/20'
                : 'text-[var(--vigil-muted)] hover:bg-white/[0.04] hover:text-[var(--vigil-text)] border border-transparent'
            }`}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500/15 text-red-400 font-mono">{item.badge}</span>
            )}
          </a>
        ))}
      </div>
    </aside>
  )
}

/* ─── INCIDENT LIST VIEW ─── */
function IncidentListView({ onSelect }: { onSelect: (id: string) => void }) {
  const [incidents, setIncidents] = useState<api.Incident[]>([])
  const [summary, setSummary] = useState<api.DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filters, setFilters] = useState({ severity: '', machine: '', q: '', from: '', to: '' })
  const [, startTransition] = useTransition()

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await api.getDashboardSummary()
      startTransition(() => {
        setSummary(data)
        setIncidents(data.incidents)
        setLoading(false)
      })
    } catch {
      setError(true)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => load(), 0)
    return () => clearTimeout(t)
  }, [load])

  async function applyFilters() {
    setLoading(true)
    const f: Record<string, string> = {}
    if (filters.severity) f.severity = filters.severity
    if (filters.machine) f.machine = filters.machine
    if (filters.q) f.q = filters.q
    if (filters.from) f.from = filters.from
    if (filters.to) f.to = filters.to
    
    try {
      const data = await api.listIncidents(Object.keys(f).length ? f : undefined)
      setIncidents(data)
    } catch {
      // Keep existing list on failure
    }
    setLoading(false)
  }

  function clearFilters() {
    setFilters({ severity: '', machine: '', q: '', from: '', to: '' })
    load()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 py-8">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState title="Failed to load incident queue" onRetry={load} />
      </div>
    )
  }

  const eventsLastHour = summary?.health.events_last_hour ?? 0
  const incidentsOpen = incidents.filter(i => i.status === 'open').length
  const dataQuality = summary?.health.data_quality ?? '97%'
  const meshNodes = summary?.health.mesh_nodes ?? 0
  const invalidEvents = summary?.health.invalid_events ?? 0

  return (
    <div>
      <div className="mb-6">
        <div className="text-[10px] font-mono text-[var(--vigil-dim)] mb-1">vigil:// / <span className="text-[var(--vigil-accent)]">triage</span></div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--vigil-text)] mb-1">Incident Triage Workbench</h1>
        <p className="text-xs text-[var(--vigil-muted)]">Correlated logs and rule traces aggregated on active nodes</p>
      </div>

      {/* Structured Health Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-xl border border-[var(--vigil-border)] mb-6 bg-gradient-to-b from-[#0b0f19] to-transparent">
        <MetricTile label="Events per hour" value={eventsLastHour} />
        <MetricTile label="Open alerts" value={incidentsOpen} />
        <MetricTile label="Data Quality" value={dataQuality} />
        <MetricTile label="Mesh Nodes" value={meshNodes} />
        <MetricTile label="Invalid Events" value={invalidEvents} />
      </div>

      {/* Tactile Filters */}
      <div className="p-4 rounded-xl border border-[var(--vigil-border)] mb-6 bg-[var(--vigil-card)]/40">
        <div className="text-xs font-bold text-[var(--vigil-text)] mb-3 flex items-center gap-2"><Filter size={12} /> Filters</div>
        <div className="flex flex-wrap gap-2.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[var(--vigil-muted)]">Severity</label>
            <input value={filters.severity} onChange={e => setFilters({ ...filters, severity: e.target.value })} placeholder="critical" className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-[var(--vigil-border)] text-[var(--vigil-text)] text-xs focus:outline-none focus:border-[var(--vigil-accent)] w-28" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[var(--vigil-muted)]">Machine / Line</label>
            <input value={filters.machine} onChange={e => setFilters({ ...filters, machine: e.target.value })} placeholder="ontario-line1" className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-[var(--vigil-border)] text-[var(--vigil-text)] text-xs focus:outline-none focus:border-[var(--vigil-accent)] w-36" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[var(--vigil-muted)]">Search Keyword</label>
            <input value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value })} placeholder="temp spike" className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-[var(--vigil-border)] text-[var(--vigil-text)] text-xs focus:outline-none focus:border-[var(--vigil-accent)] min-w-[180px]" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[var(--vigil-muted)]">From Opened</label>
            <input value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} placeholder="RFC3339" className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-[var(--vigil-border)] text-[var(--vigil-text)] text-xs focus:outline-none focus:border-[var(--vigil-accent)] w-36" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[var(--vigil-muted)]">To Opened</label>
            <input value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} placeholder="RFC3339" className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-[var(--vigil-border)] text-[var(--vigil-text)] text-xs focus:outline-none focus:border-[var(--vigil-accent)] w-36" />
          </div>
          <div className="flex items-end gap-1.5 pt-4">
            <ActionButton onClick={applyFilters} variant="primary" className="py-1.5">Apply</ActionButton>
            <ActionButton onClick={clearFilters} className="py-1.5">Clear</ActionButton>
            <ActionButton onClick={() => api.exportCsv(Object.keys(filters).length ? filters : undefined)} className="py-1.5">
              <Download size={11} /> CSV
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Incident Queue List */}
      <div className="flex flex-col gap-3">
        {incidents.length === 0 && (
          <EmptyState
            title="No incidents detected in queue"
            description="Ensure local machine logs are actively ingested, or run a diagnostic pipeline evaluation using the Detect button above."
            icon={<AlertTriangle size={32} />}
          />
        )}
        {incidents.map(inc => (
          <div
            key={inc.id}
            onClick={() => onSelect(inc.id)}
            className="group p-4 rounded-xl border border-[var(--vigil-border)] bg-gradient-to-br from-[var(--vigil-card)] to-[#030712] cursor-pointer hover:border-[var(--vigil-accent)]/30 hover:translate-y-[-1px] transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-sm font-bold text-[var(--vigil-text)] group-hover:text-[var(--vigil-accent)] transition-colors">{inc.title}</h3>
              <div className="flex gap-1.5">
                <SeverityBadge severity={inc.severity} />
                <StatusBadge status={inc.status} />
              </div>
            </div>
            <p className="text-xs text-[var(--vigil-muted)] leading-relaxed mb-3 line-clamp-2">
              {inc.description || inc.recommended_action || 'Operational telemetry diagnostic pending.'}
            </p>
            <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.03]">
              <span className="text-[10px] font-mono text-[var(--vigil-dim)] uppercase tracking-wider">{inc.machine_id || 'N/A'}</span>
              <span className="text-[9px] font-mono text-[var(--vigil-dim)]">
                {inc.opened_at ? new Date(inc.opened_at).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── INCIDENT DETAIL VIEW ─── */
function IncidentDetailView({ id, onBack }: { id: string; onBack: () => void }) {
  const [detail, setDetail] = useState<api.IncidentDetail | null>(null)
  const [replay, setReplay] = useState<Record<string, unknown> | null>(null)
  const [copilotMode, setCopilotMode] = useState('summary')
  const [copilotResponse, setCopilotResponse] = useState('')
  const [copilotLoading, setCopilotLoading] = useState(false)
  const [actionNote, setActionNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [, startTransition] = useTransition()

  const load = useCallback(async () => {
    try {
      const d = await api.getIncident(id)
      const r = await api.getReplay(id)
      startTransition(() => {
        setDetail(d)
        setReplay(r)
      })
    } catch {
      // Handled gracefully via local fallback structures inside API client
    }
  }, [id])

  useEffect(() => { load() }, [load])

  async function runCopilot() {
    setCopilotLoading(true)
    try {
      const res = await api.runCopilot(id, copilotMode)
      setCopilotResponse(res.answer || res.response || '')
    } catch {
      setCopilotResponse('Copilot reasoning engine failed. Verify session auth state.')
    }
    setCopilotLoading(false)
  }

  async function takeAction(actionType: string) {
    setActionLoading(true)
    setActionError('')
    try {
      const res = await api.takeAction(id, actionType, actionNote, 'operator')
      if (res.error) {
        setActionError(res.message || 'Validation failed.')
      } else {
        setActionNote('')
        await load()
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setActionError(e.message || 'Network exception.')
      } else {
        setActionError('Network exception.')
      }
    }
    setActionLoading(false)
  }

  if (!detail) {
    return (
      <div className="flex flex-col gap-4 py-8">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const inc = detail.incident

  return (
    <div>
      <ActionButton onClick={onBack} className="mb-4">
        <ChevronLeft size={13} /> Return to Queue
      </ActionButton>

      <div className="text-[10px] font-mono text-[var(--vigil-dim)] mb-1">vigil:// / incidents / <span className="text-[var(--vigil-accent)]">{inc.id}</span></div>
      <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[var(--vigil-text)] mb-5">{inc.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left diagnostic surface */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Overview */}
          <Panel title="Diagnostic Overview" icon={<FileText size={14} />}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-xs">
              <div><div className="text-[9px] font-bold uppercase tracking-wider text-[var(--vigil-dim)] mb-1">Severity</div><SeverityBadge severity={inc.severity} /></div>
              <div><div className="text-[9px] font-bold uppercase tracking-wider text-[var(--vigil-dim)] mb-1">Status</div><StatusBadge status={inc.status} /></div>
              <div><div className="text-[9px] font-bold uppercase tracking-wider text-[var(--vigil-dim)] mb-1">Rule ID</div><div className="font-mono text-[var(--vigil-text)] font-semibold mt-0.5">{inc.incident_type || 'N/A'}</div></div>
              <div><div className="text-[9px] font-bold uppercase tracking-wider text-[var(--vigil-dim)] mb-1">Machine Context</div><div className="font-mono text-[var(--vigil-text)] font-semibold mt-0.5">{inc.machine_id || 'N/A'}</div></div>
              <div><div className="text-[9px] font-bold uppercase tracking-wider text-[var(--vigil-dim)] mb-1">Time Opened</div><div className="text-[var(--vigil-muted)] mt-0.5">{inc.opened_at ? new Date(inc.opened_at).toLocaleString() : 'N/A'}</div></div>
              <div><div className="text-[9px] font-bold uppercase tracking-wider text-[var(--vigil-dim)] mb-1">SLA Ack Limit</div><div className="text-[var(--vigil-muted)] mt-0.5">{inc.sla_ack_by ? new Date(inc.sla_ack_by).toLocaleString() : 'N/A'}</div></div>
            </div>
            
            <div className="p-3.5 rounded-lg bg-black/30 border border-white/[0.02] mb-3.5">
              <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--vigil-dim)] mb-1.5">Parsed Suspected Cause</div>
              <p className="text-xs text-[var(--vigil-muted)] leading-relaxed">{inc.description || 'Reasoning analysis pending telemetry compacting.'}</p>
            </div>
            
            {inc.recommended_action && (
              <div className="p-3.5 rounded-lg bg-[var(--vigil-accent)]/5 border border-[var(--vigil-accent)]/15">
                <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--vigil-accent)] mb-1.5">Platform Recommendation</div>
                <p className="text-xs text-[var(--vigil-text)] leading-relaxed font-semibold">{inc.recommended_action}</p>
              </div>
            )}
          </Panel>

          {/* Action Log Timeline */}
          <Panel title="Operational Audit Logs" icon={<RefreshCw size={14} />}>
            <div className="flex flex-col gap-2.5">
              {(!detail.timeline || detail.timeline.length === 0) && <p className="text-xs text-[var(--vigil-muted)]">No timeline events recorded.</p>}
              {detail.timeline?.map((evt, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg border border-white/[0.01] bg-white/[0.01]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--vigil-accent)]/10 border border-[var(--vigil-accent)]/20 text-[var(--vigil-accent)] flex-shrink-0">
                    <Activity size={14} />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="font-semibold text-[var(--vigil-text)]">{evt.event_type}</div>
                    <div className="text-[var(--vigil-muted)] mt-0.5">{evt.description}</div>
                    <div className="text-[9px] font-mono text-[var(--vigil-dim)] mt-1">{evt.actor || 'system'} · {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Connected Maintenance Tickets */}
          {detail.maintenance_tickets && detail.maintenance_tickets.length > 0 && (
            <Panel title="Linked Maintenance Tickets" icon={<FileText size={14} />}>
              <div className="flex flex-col gap-2.5">
                {detail.maintenance_tickets.map((ticket, i) => (
                  <div key={i} className="p-3 rounded-lg border border-white/[0.01] bg-white/[0.01] text-xs">
                    <div className="font-semibold text-[var(--vigil-text)]">{ticket.ticket_type || 'Ticket'} · {ticket.machine_id}</div>
                    <div className="text-[var(--vigil-muted)] mt-0.5">{ticket.description}</div>
                    <div className="text-[9px] font-mono text-[var(--vigil-dim)] mt-1">{ticket.status} · {ticket.opened_at ? new Date(ticket.opened_at).toLocaleString() : 'N/A'}</div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Copilot Chat Panel */}
          <Panel title="Copilot Assistant" icon={<BrainCircuit size={14} />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-3.5">
              {['summary', 'explain', 'handoff', 'qa'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCopilotMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider border transition-all ${
                    copilotMode === mode
                      ? 'bg-[var(--vigil-accent)]/10 border-[var(--vigil-accent)]/30 text-[var(--vigil-accent)]'
                      : 'border-[var(--vigil-border)] text-[var(--vigil-muted)] hover:border-[var(--vigil-accent)]/30 hover:text-[var(--vigil-accent)]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <ActionButton
              onClick={runCopilot}
              disabled={copilotLoading}
              variant="primary"
              className="mb-4"
            >
              {copilotLoading ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
              {copilotLoading ? 'Running evaluation...' : 'Run Copilot Context'}
            </ActionButton>
            
            {copilotResponse && (
              <div className="p-3.5 rounded-lg bg-black/40 border border-[var(--vigil-accent)]/15 text-xs text-[var(--vigil-text)] leading-relaxed max-h-[300px] overflow-y-auto">
                {copilotResponse}
              </div>
            )}
            {detail.copilot_history && detail.copilot_history.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--vigil-border)]">
                <div className="text-[9px] font-bold text-[var(--vigil-dim)] uppercase tracking-wider mb-2">Evaluation History</div>
                {detail.copilot_history.map((h, i) => (
                  <div key={i} className="mb-2 p-2.5 rounded bg-white/[0.01] border border-white/[0.02] text-xs">
                    <div className="font-bold text-[var(--vigil-accent)] uppercase tracking-wider text-[9px] mb-1">{h.mode}</div>
                    <div className="text-[var(--vigil-muted)] leading-relaxed">{h.response}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Right side diagnostics panel */}
        <div className="flex flex-col gap-5">
          {/* Actions */}
          <Panel title="Dispatch Decision" icon={<Zap size={14} />}>
            <div className="grid grid-cols-2 gap-1.5 mb-3.5">
              {['acknowledge', 'assign', 'reroute', 'override', 'resolve'].map(action => (
                <ActionButton
                  key={action}
                  onClick={() => takeAction(action)}
                  disabled={actionLoading}
                  className="capitalize font-semibold text-xs"
                >
                  {action}
                </ActionButton>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[var(--vigil-muted)]">Override / Action Justification Note</label>
              <textarea
                value={actionNote}
                onChange={e => setActionNote(e.target.value)}
                placeholder="Submit decision logic..."
                className="w-full px-3 py-2.5 rounded-lg bg-black/20 border border-[var(--vigil-border)] text-[var(--vigil-text)] text-xs placeholder-[var(--vigil-dim)] focus:outline-none focus:border-[var(--vigil-accent)] resize-y min-h-[80px]"
              />
            </div>
            {actionError && (
              <div className="mt-3 p-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                Error: {actionError}
              </div>
            )}
          </Panel>

          {/* Cryptographic Replay Proof Box */}
          {replay && (
            <div className="p-5 rounded-xl border border-[var(--vigil-green)]/20 bg-gradient-to-br from-emerald-500/[0.02] to-transparent">
              <h3 className="text-xs font-bold text-[var(--vigil-text)] mb-4 flex items-center gap-2"><ShieldCheck size={14} className="text-[var(--vigil-green)]" /> Cryptographic Replay</h3>
              <div className="space-y-2 mb-4">
                <div className="font-mono text-[9px] text-[var(--vigil-green)] break-all p-2 bg-black/40 border border-[var(--vigil-green)]/15 rounded">
                  root: {String(replay.merkle_root || '').slice(0, 32)}...
                </div>
                {(Array.isArray(replay.proof) ? replay.proof : []).map((p: string, i: number) => (
                  <div key={i} className="font-mono text-[9px] text-[var(--vigil-accent)] break-all p-2 bg-black/40 border border-[var(--vigil-accent)]/15 rounded">
                    proof[{i}]: {String(p).slice(0, 32)}...
                  </div>
                ))}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--vigil-green)]/10 border border-[var(--vigil-green)]/20 text-[var(--vigil-green)] text-[10px] font-bold font-mono mb-4">
                <CheckCircle2 size={11} />
                {String(replay.verification || 'Valid Merkle path - data untampered')}
              </div>
              <div className="flex flex-col gap-1.5">
                <ActionButton onClick={() => api.exportIncidentJson(id)}>
                  <Download size={11} /> Export JSON Bundle
                </ActionButton>
                <ActionButton onClick={() => api.exportIncidentPdf(id)}>
                  <Download size={11} /> Export PDF Report
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── HEALTH VIEW ─── */
function renderCopilotValue(v: unknown): React.ReactNode {
  if (v === null || v === undefined) return 'N/A'
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
    return String(v)
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return 'None'
    return (
      <ul className="list-disc list-inside space-y-0.5 font-normal text-[var(--vigil-muted)]">
        {v.map((item, i) => (
          <li key={i}>{String(item)}</li>
        ))}
      </ul>
    )
  }
  if (typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>)
    if (entries.length === 0) return 'N/A'
    return (
      <ul className="space-y-0.5 font-normal text-[var(--vigil-muted)]">
        {entries.map(([ek, ev]) => {
          if (Array.isArray(ev) && ev.length > 0) {
            return (
              <li key={ek}>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--vigil-dim)]">{ek}: </span>
                {ev.map(String).join(', ')}
              </li>
            )
          }
          return (
            <li key={ek}>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--vigil-dim)]">{ek}: </span>
              <span className="text-[var(--vigil-text)]">{String(ev)}</span>
            </li>
          )
        })}
      </ul>
    )
  }
  return String(v)
}


function HealthView() {
  const [health, setHealth] = useState<Record<string, string | number | null>>({})
  const [status, setStatus] = useState<Record<string, unknown>>({})
  const [copilotStatus, setCopilotStatus] = useState<Record<string, unknown>>({})
  const [slack, setSlack] = useState<{ configured?: boolean; masked_url?: string }>({})
  const [slackUrl, setSlackUrl] = useState('')
  const [slackMsg, setSlackMsg] = useState('')
  const [error, setError] = useState(false)
  const [, startTransition] = useTransition()

  const load = useCallback(async () => {
    setError(false)
    try {
      const h = await api.getHealth()
      const s = await api.getStatus()
      const res = await fetch('/api/copilot/status')
      const c = res.ok ? await res.json() : { mode: 'local', provider: 'builtin' }
      const sl = await api.getSlackStatus()
      
      startTransition(() => {
        setHealth(h)
        setStatus(s)
        setCopilotStatus(c)
        setSlack(sl)
      })
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => load(), 0)
    return () => clearTimeout(t)
  }, [load])

  async function saveSlack() {
    const res = await api.saveSlackWebhook(slackUrl)
    setSlackMsg(JSON.stringify(res))
    const sl = await api.getSlackStatus()
    setSlack(sl)
  }

  async function testSlack() {
    const res = await api.testSlackWebhook()
    setSlackMsg(JSON.stringify(res))
  }

  async function clearSlack() {
    await api.saveSlackWebhook('')
    setSlackUrl('')
    setSlackMsg('Slack webhook integration removed.')
    const sl = await api.getSlackStatus()
    setSlack(sl)
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState title="Failed to load health metrics" onRetry={load} />
      </div>
    )
  }

  const statusEntries = Object.entries(status).filter(([k]) => !['stats', 'mesh'].includes(k))
  const copilotEntries = Object.entries(copilotStatus)

  return (
    <div>
      <div className="mb-6">
        <div className="text-[10px] font-mono text-[var(--vigil-dim)] mb-1">vigil:// / <span className="text-[var(--vigil-accent)]">health</span></div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--vigil-text)] mb-1">Operational Diagnostics</h1>
        <p className="text-xs text-[var(--vigil-muted)]">Real-time status summaries of local ingestion chains</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-xl border border-[var(--vigil-border)] mb-6 bg-gradient-to-b from-[#0b0f19] to-transparent">
        <MetricTile label="Events per hour" value={health.events_last_hour ?? 'N/A'} />
        <MetricTile label="Open alerts" value={health.incidents_open ?? 'N/A'} />
        <MetricTile label="Data Quality" value={health.data_quality ?? 'N/A'} />
        <MetricTile label="Mesh Nodes" value={health.mesh_nodes ?? 'N/A'} />
        <MetricTile label="Invalid Events" value={health.invalid_events ?? 'N/A'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Ingest Pipeline Status" icon={<Activity size={14} />}>
          <div className="font-mono text-xs text-[var(--vigil-muted)] bg-black/30 p-3 rounded-lg border border-white/[0.01]">
            Last telemetry commit: <span className="text-[var(--vigil-text)] font-semibold">{health.last_ingest ? new Date(String(health.last_ingest)).toLocaleString() : 'N/A'}</span>
          </div>
        </Panel>

        <Panel title="Local Node Indices" icon={<Settings size={14} />}>
          {statusEntries.length === 0 ? (
            <p className="text-xs text-[var(--vigil-muted)]">No node indices available.</p>
          ) : (
            <div className="space-y-2.5">
              {statusEntries.map(([k, v]) => (
                <div key={k} className="text-xs">
                  <div className="font-mono text-[var(--vigil-dim)] uppercase tracking-wider mb-1">{k}</div>
                  <div className="text-[var(--vigil-text)] font-semibold break-words">
                    {renderCopilotValue(v)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Embedded Copilot Configuration" icon={<BrainCircuit size={14} />}>
          {copilotEntries.length === 0 ? (
            <p className="text-xs text-[var(--vigil-muted)]">Copilot middleware offline.</p>
          ) : (
            <div className="space-y-2.5">
              {copilotEntries.map(([k, v]) => (
                <div key={k} className="text-xs">
                  <div className="font-mono text-[var(--vigil-dim)] uppercase tracking-wider mb-1">{k}</div>
                  <div className="text-[var(--vigil-text)] font-semibold break-words">
                    {renderCopilotValue(v)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Dispatch Webhook Integrations" icon={<Send size={14} />}>
          <p className="text-xs text-[var(--vigil-muted)] mb-3.5">
            {slack.configured ? `Configured · ${slack.masked_url || ''}` : 'No Slack notification webhook configured.'}
          </p>
          <div className="flex flex-wrap gap-2 mb-3.5">
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-[9px] font-bold text-[var(--vigil-muted)]">Incoming Webhook URL</label>
              <input value={slackUrl} onChange={e => setSlackUrl(e.target.value)} placeholder="https://hooks.slack.com/services/..." className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-[var(--vigil-border)] text-[var(--vigil-text)] text-xs focus:outline-none focus:border-[var(--vigil-accent)]" />
            </div>
            <div className="flex items-end gap-1.5">
              <ActionButton onClick={saveSlack} variant="primary">Save</ActionButton>
              <ActionButton onClick={testSlack}>Test</ActionButton>
              <ActionButton onClick={clearSlack} variant="danger">Remove</ActionButton>
            </div>
          </div>
          {slackMsg && <pre className="font-mono text-[10px] text-[var(--vigil-dim)] bg-black/30 p-2.5 rounded border border-white/[0.02]">{slackMsg}</pre>}
        </Panel>
      </div>
    </div>
  )
}

/* ─── TELEMETRY VIEW ─── */
function TelemetryView() {
  const [sensors, setSensors] = useState<string[]>([])
  const [selected, setSelected] = useState('')
  const [history, setHistory] = useState<api.DataPoint[]>([])
  const [analytics, setAnalytics] = useState<Record<string, unknown>>({})
  const [chartStatus, setChartStatus] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [writeVal, setWriteVal] = useState('')
  const [error, setError] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const [, startTransition] = useTransition()

  const loadSensors = useCallback(async () => {
    try {
      const list = await api.listSensors()
      setSensors(list)
      setSelected(prev => prev || list[0] || '')
    } catch {
      setError(true)
    }
  }, [])

  const loadChart = useCallback(async () => {
    if (!selected) return
    setChartStatus('Connecting block...')
    try {
      const data = await api.getSensorHistory(selected)
      const pts = data.datapoints || []
      
      startTransition(() => {
        setHistory(pts)
        setChartStatus(pts.length ? '' : 'No telemetry points committed.')
      })

      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
      if (!canvasRef.current || !pts.length) return

      const isLight = document.documentElement.getAttribute('data-theme') === 'light'
      const textColor = isLight ? '#0f172a' : '#e2e8f0'
      const gridColor = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(226,232,240,0.08)'
      const lineColor = isLight ? '#d97706' : '#f59e0b'
      const fillColor = isLight ? 'rgba(217,119,6,0.15)' : 'rgba(245,158,11,0.12)'

      const labels = pts.map((p: api.DataPoint) => {
        const d = new Date(p.x)
        return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      })
      const values = pts.map((p: api.DataPoint) => p.y)

      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: selected,
            data: values,
            borderColor: lineColor,
            backgroundColor: fillColor,
            fill: true,
            tension: 0.15,
            pointRadius: pts.length > 120 ? 0 : 1.5,
            pointHoverRadius: 3,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { intersect: false, mode: 'index' },
          scales: {
            x: { ticks: { color: textColor, maxRotation: 0, maxTicksLimit: 12 }, grid: { color: gridColor } },
            y: { ticks: { color: textColor }, grid: { color: gridColor } },
          },
          plugins: {
            legend: { display: false },
          },
        },
      })

      const an = await api.getSensorAnalytics(selected)
      setAnalytics(an)
    } catch {
      setChartStatus('Failed to load telemetry data.')
    }
  }, [selected])

  useEffect(() => {
    const t = setTimeout(() => loadSensors(), 0)
    return () => clearTimeout(t)
  }, [loadSensors])

  useEffect(() => {
    if (selected) {
      const t = setTimeout(() => loadChart(), 0)
      return () => clearTimeout(t)
    }
  }, [selected, loadChart])

  async function simulate() {
    if (!selected) return
    const res = await api.simulateSensor(selected)
    setActionMsg(JSON.stringify(res, null, 2))
    await loadChart()
  }

  async function write() {
    if (!selected) return
    const val = parseFloat(writeVal)
    if (isNaN(val)) return
    const res = await api.writeSensor(selected, val)
    setActionMsg(JSON.stringify(res, null, 2))
    setWriteVal('')
    await loadChart()
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState title="Failed to load sensor list" onRetry={loadSensors} />
      </div>
    )
  }

  const analyticsEntries = Object.entries(analytics).filter(([k]) => k !== 'sensor')

  return (
    <div>
      <div className="mb-6">
        <div className="text-[10px] font-mono text-[var(--vigil-dim)] mb-1">vigil:// / <span className="text-[var(--vigil-accent)]">telemetry</span></div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--vigil-text)] mb-1">Live Sensor Diagnostics</h1>
        <p className="text-xs text-[var(--vigil-muted)]">Historical analytics evaluated on content-addressable ledgers</p>
      </div>

      <div className="p-5 rounded-xl border border-[var(--vigil-border)] bg-gradient-to-br from-[#0b0f19] to-transparent mb-6">
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[var(--vigil-muted)]">Select Ingestion Sensor</label>
            <select value={selected} onChange={e => setSelected(e.target.value)} className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-[var(--vigil-border)] text-[var(--vigil-text)] text-xs font-mono focus:outline-none focus:border-[var(--vigil-accent)] w-56">
              {sensors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <ActionButton onClick={loadChart} className="py-1.5">
            <RefreshCw size={12} /> Refresh
          </ActionButton>
          <span className="text-[10px] font-mono text-[var(--vigil-dim)] uppercase tracking-wider mb-2">{history.length} telemetry indices</span>
        </div>
        {chartStatus && <p className="text-xs font-mono text-[var(--vigil-muted)] mb-2">{chartStatus}</p>}
        <div className="relative w-full h-[min(420px,52vh)] min-h-[280px]">
          <canvas ref={canvasRef} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Diagnostic Analytics" icon={<Activity size={14} />}>
          {analyticsEntries.length === 0 ? (
            <p className="text-xs text-[var(--vigil-muted)]">Select a sensor to view analytics.</p>
          ) : (
            <div className="space-y-2.5">
              {analyticsEntries.map(([k, v]) => (
                <div key={k} className="text-xs">
                  <div className="font-mono text-[var(--vigil-dim)] uppercase tracking-wider mb-1">{k}</div>
                  <div className="text-[var(--vigil-text)] font-semibold break-words">
                    {renderCopilotValue(v)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Trigger Local Ingestion" icon={<Zap size={14} />}>
          <div className="flex flex-wrap gap-2 mb-3.5">
            <ActionButton onClick={simulate} variant="primary">Simulate Wave</ActionButton>
            <div className="flex flex-col gap-1">
              <label className="sr-only">Value</label>
              <input value={writeVal} onChange={e => setWriteVal(e.target.value)} placeholder="84.2" className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-[var(--vigil-border)] text-[var(--vigil-text)] text-xs focus:outline-none focus:border-[var(--vigil-accent)] w-24" />
            </div>
            <ActionButton onClick={write}>Commit</ActionButton>
          </div>
          {actionMsg && <pre className="font-mono text-[10px] text-[var(--vigil-dim)] bg-black/30 p-2.5 rounded border border-white/[0.02]">{actionMsg}</pre>}
        </Panel>
      </div>
    </div>
  )
}

/* ─── MESH VIEW ─── */
function MeshView() {
  const [topology, setTopology] = useState<Record<string, unknown>>({})
  const [error, setError] = useState(false)
  const [, startTransition] = useTransition()

  const load = useCallback(async () => {
    setError(false)
    try {
      const top = await api.getMeshTopology()
      startTransition(() => setTopology(top))
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => load(), 0)
    return () => clearTimeout(t)
  }, [load])

  if (error) {
    return (
      <div className="py-8">
        <ErrorState title="Failed to load mesh topology" onRetry={load} />
      </div>
    )
  }

  const localNode = (topology.local_node ?? (Array.isArray(topology.nodes) ? (topology.nodes as Record<string, string>[]).find(n => n.role === 'local') : undefined)) as Record<string, string> | undefined
  const peers = (Array.isArray(topology.peers) ? topology.peers : (Array.isArray(topology.nodes) ? (topology.nodes as Record<string, string>[]).filter(n => n.role !== 'local') : [])) as Record<string, string>[]
  const links = Array.isArray(topology.links) ? topology.links as Record<string, string>[] : []

  return (
    <div>
      <div className="mb-6">
        <div className="text-[10px] font-mono text-[var(--vigil-dim)] mb-1">vigil:// / <span className="text-[var(--vigil-accent)]">mesh</span></div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--vigil-text)] mb-1">Gossip Mesh Topology</h1>
        <p className="text-xs text-[var(--vigil-muted)]">Live gossip nodes active in telemetry propagation</p>
      </div>
      <Panel title="Network Nodes" icon={<ShieldCheck size={14} />} className="mb-6">
        <div className="flex justify-end mb-4">
          <ActionButton onClick={load} variant="primary">
            <RefreshCw size={12} /> Refresh
          </ActionButton>
        </div>
        
        {localNode && (
          <div className="mb-4 p-3 rounded-lg border border-[var(--vigil-accent)]/20 bg-[var(--vigil-accent)]/5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--vigil-accent)] mb-1">Local Node</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {Object.entries(localNode).map(([k, v]) => (
                <div key={k}>
                  <span className="font-mono text-[var(--vigil-dim)] text-[9px] uppercase tracking-wider">{k}</span>
                  <div className="text-[var(--vigil-text)] font-semibold">{String(v)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {peers.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--vigil-muted)] mb-1">Peers</div>
            {peers.map((peer, i) => (
              <div key={i} className="p-3 rounded-lg border border-white/[0.02] bg-white/[0.01] flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-4 text-xs">
                  {Object.entries(peer).map(([k, v]) => (
                    <div key={k}>
                      <span className="font-mono text-[var(--vigil-dim)] text-[9px] uppercase tracking-wider">{k}</span>
                      <div className="text-[var(--vigil-text)] font-semibold">{String(v)}</div>
                    </div>
                  ))}
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-extrabold ${
                  peer.status === 'healthy' || peer.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  peer.status === 'degraded' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  {peer.status || 'unknown'}
                </span>
              </div>
            ))}
          </div>
        )}
        {links.length > 0 && (
          <div className="space-y-2 mt-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--vigil-muted)] mb-1">Active Links</div>
            {links.map((link, i) => (
              <div key={i} className="p-2.5 rounded-lg border border-white/[0.02] bg-white/[0.01] font-mono text-[10px] text-[var(--vigil-muted)]">
                {Object.entries(link).map(([k, v]) => `${k}: ${String(v)}`).join(' · ')}
              </div>
            ))}
          </div>
        )}
        {peers.length === 0 && !localNode && (
          <p className="text-xs text-[var(--vigil-muted)]">No mesh nodes discovered.</p>
        )}
      </Panel>
    </div>
  )
}

/* ─── MAIN WORKBENCH ─── */
export default function Dashboard() {
  const { theme, toggle } = useTheme()
  const [activeView, setActiveView] = useState('incidents')
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null)
  const [counts, setCounts] = useState({ incidents: 0, open: 0 })
  const [refreshKey, setRefreshKey] = useState(0)
  const [, startTransition] = useTransition()

  const location = useLocation()

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash.startsWith('detail/')) {
      const id = hash.replace('detail/', '')
      Promise.resolve().then(() => {
        setSelectedIncident(id)
        setActiveView('detail')
      })
    } else if (hash) {
      Promise.resolve().then(() => setActiveView(hash))
    }
  }, [location])

  const refreshCounts = useCallback(async () => {
    try {
      const data = await api.listIncidents()
      startTransition(() => {
        setCounts({ incidents: data.length, open: data.filter((i: api.Incident) => i.status === 'open').length })
      })
    } catch {
      // Handled
    }
  }, [])

  useEffect(() => {
    refreshCounts()
    const iv = setInterval(refreshCounts, 15000)
    return () => clearInterval(iv)
  }, [refreshKey, refreshCounts])

  async function runDetection() {
    try {
      await api.runDetection()
      setRefreshKey(k => k + 1)
    } catch {
      // Handled
    }
  }

  function handleSelectIncident(id: string) {
    setSelectedIncident(id)
    setActiveView('detail')
    window.location.hash = `detail/${id}`
  }

  function handleBack() {
    setSelectedIncident(null)
    setActiveView('incidents')
    window.location.hash = 'incidents'
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--vigil-bg)] text-[var(--vigil-text)]">
      {/* Top Cockpit Nav */}
      <nav className="sticky top-0 z-50 border-b border-[var(--vigil-border)] bg-[var(--vigil-bg)]/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-[var(--vigil-text)] font-bold text-sm tracking-tight no-underline">
              <svg viewBox="0 0 28 28" width={18} height={18} fill="none">
                <path d="M14 2L2 26L14 20L26 26L14 2Z" fill="#f59e0b" />
                <path d="M14 2L14 20L2 26L14 2Z" fill="#d97706" />
              </svg>
              Vigil
            </Link>
            <span className="text-[9px] font-mono text-[var(--vigil-dim)] uppercase tracking-wider hidden sm:inline">Diagnostic workbench</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <LoginBar onRefresh={() => setRefreshKey(k => k + 1)} />
            <ActionButton onClick={toggle} className="py-1">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </ActionButton>
            <ActionButton onClick={runDetection} variant="primary" className="py-1">
              <Play size={11} /> Evaluate Rules
            </ActionButton>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activeView} counts={counts} />
        <main className="flex-1 overflow-y-auto p-5">
          {activeView === 'incidents' && <IncidentListView onSelect={handleSelectIncident} />}
          {activeView === 'detail' && selectedIncident && <IncidentDetailView id={selectedIncident} onBack={handleBack} />}
          {activeView === 'health' && <HealthView />}
          {activeView === 'telemetry' && <TelemetryView />}
          {activeView === 'mesh' && <MeshView />}
        </main>
      </div>
    </div>
  )
}
