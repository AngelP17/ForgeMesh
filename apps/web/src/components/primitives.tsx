/**
 * Vigil Shared Frontend Primitives
 * Theme-consistent building blocks used across Landing and Dashboard.
 */
import React from 'react'

/* ─── SEVERITY BADGE ─── */
interface SeverityBadgeProps {
  severity?: string | null
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const sev = (severity || 'low').toLowerCase()
  let classes = 'bg-slate-500/10 text-slate-400 border-slate-500/20'

  if (sev === 'critical') {
    classes = 'bg-red-500/10 text-red-400 border-red-500/20'
  } else if (sev === 'high') {
    classes = 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  } else if (sev === 'medium') {
    classes = 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  }

  return (
    <span className={`px-2 py-0.5 rounded border text-[10px] font-extrabold uppercase tracking-wider font-mono ${classes}`}>
      {sev}
    </span>
  )
}

/* ─── STATUS BADGE ─── */
interface StatusBadgeProps {
  status?: string | null
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const stat = (status || 'open').toLowerCase()
  let classes = 'bg-blue-500/10 text-blue-400 border-blue-500/20'

  if (stat === 'resolved') {
    classes = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  } else if (stat === 'acknowledged') {
    classes = 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  } else if (stat === 'assigned') {
    classes = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  }

  return (
    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider font-mono ${classes}`}>
      {stat}
    </span>
  )
}

/* ─── SKELETON LOADER ─── */
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-white/[0.04] border border-white/[0.02] rounded-xl ${className}`} />
  )
}

/* ─── DENSE METRIC TILE ─── */
interface MetricTileProps {
  label: string
  value: string | number
  sublabel?: string
}

export function MetricTile({ label, value, sublabel }: MetricTileProps) {
  return (
    <div className="flex flex-col justify-between p-4 rounded-xl border border-[var(--vigil-border)] bg-gradient-to-b from-white/[0.02] to-transparent">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--vigil-muted)] mb-1">
          {label}
        </div>
        <div className="text-2xl font-extrabold font-mono tracking-tight text-[var(--vigil-text)]">
          {value}
        </div>
      </div>
      {sublabel && (
        <div className="text-[10px] font-mono text-[var(--vigil-dim)] mt-1.5 truncate">
          {sublabel}
        </div>
      )}
    </div>
  )
}

/* ─── EMPTY STATE BLOCK ─── */
interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-[var(--vigil-border)] bg-[var(--vigil-card)]/10 my-4">
      {icon && <div className="text-[var(--vigil-dim)] mb-3">{icon}</div>}
      <h4 className="text-sm font-bold text-[var(--vigil-text)] mb-1">{title}</h4>
      <p className="text-xs text-[var(--vigil-muted)] max-w-sm leading-relaxed">{description}</p>
    </div>
  )
}

/* ─── ERROR STATE BLOCK ─── */
interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({ title = 'Data load failed', description = 'Check network connectivity or daemon status and retry.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 rounded-2xl border border-red-500/15 bg-red-500/[0.03] my-4">
      <h4 className="text-sm font-bold text-red-400 mb-1">{title}</h4>
      <p className="text-xs text-[var(--vigil-muted)] max-w-sm leading-relaxed mb-4">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-lg text-xs font-bold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}

/* ─── INTERACTIVE SPRING-TACTILE ACTION BUTTON ─── */
interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  children: React.ReactNode
}

export function ActionButton({ variant = 'secondary', children, className = '', ...props }: ActionButtonProps) {
  let baseClass = 'relative inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-150 select-none active:scale-[0.98]'
  
  if (variant === 'primary') {
    baseClass += ' bg-[var(--vigil-accent)] text-slate-950 border-[var(--vigil-accent)] hover:brightness-110 disabled:opacity-50'
  } else if (variant === 'danger') {
    baseClass += ' border-red-500/20 bg-red-500/5 text-red-400 hover:border-red-500/40 active:bg-red-500/10 disabled:opacity-50'
  } else {
    // Secondary
    baseClass += ' border-[var(--vigil-border)] bg-white/[0.02] text-[var(--vigil-text)] hover:border-[var(--vigil-accent)]/30 hover:text-[var(--vigil-accent)] active:bg-[var(--vigil-accent)]/5 disabled:opacity-50'
  }

  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  )
}

/* ─── STRUCTURED PANEL / CARD ─── */
interface PanelProps {
  title?: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Panel({ title, icon, children, className = '' }: PanelProps) {
  return (
    <div className={`p-5 rounded-xl border border-[var(--vigil-border)] bg-gradient-to-br from-[#0b0f19] to-transparent ${className}`}>
      {title && (
        <h3 className="text-xs font-bold text-[var(--vigil-text)] mb-4 flex items-center gap-2">
          {icon && <span className="text-[var(--vigil-accent)]">{icon}</span>}
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

/* ─── SECTION HEADER ─── */
interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function SectionHeader({ eyebrow, title, description, align = 'left' }: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : ''
  return (
    <div className={`mb-6 ${alignClass}`}>
      {eyebrow && (
        <div className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-[var(--vigil-accent)] mb-3">
          {eyebrow}
        </div>
      )}
      <h2 className="text-[clamp(1.75rem,3.5vw,3rem)] font-extrabold tracking-tight text-[var(--vigil-text)] mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-[var(--vigil-muted)] max-w-xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}

/* ─── NAV LINK BUTTON (for landing CTAs) ─── */
interface NavLinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
}

export function NavLinkButton({ variant = 'secondary', children, className = '', ...props }: NavLinkButtonProps) {
  const base = 'inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-extrabold no-underline transition-all active:scale-[0.98]'
  const style = variant === 'primary'
    ? 'bg-[var(--vigil-accent)] text-slate-950 hover:brightness-110 shadow-md'
    : 'border border-[var(--vigil-border)] bg-white/[0.02] text-[var(--vigil-text)] hover:border-[var(--vigil-accent)]/30 hover:text-[var(--vigil-accent)]'
  return <a className={`${base} ${style} ${className}`} {...props}>{children}</a>
}
