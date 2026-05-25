import { useState } from 'react'
import { Trophy, Send, Calendar, Phone, Briefcase, Users } from 'lucide-react'
import type { Candidate } from '../types/candidate'
import type { Job }       from '../types/job'
import type { User }      from '../types/auth'
import { getInitials, getAvatarColor } from '../types/candidate'
import { daysOpen } from '../types/job'

// ── Types ──────────────────────────────────────────────────────────────────────

type Period = 'week' | 'month'

interface StoredTeamMember {
  id:     string
  email:  string
  name?:  string
  role:   'recruiter' | 'talent_acquisition_manager'
  status: 'pending' | 'active'
}

// ── Style constants ────────────────────────────────────────────────────────────

const SECTION_LABEL = 'text-[10px] uppercase text-[#64748B] font-medium mb-3'
const CARD    = 'bg-white rounded-[10px]'
const CARD_ST = { border: '0.5px solid #E2E8F0' } as const
const TH      = 'text-[10px] font-medium text-[#64748B] uppercase px-4 py-2.5'

const FUNNEL_FILLS = ['#DBEAFE', '#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1', '#4F46E5']

// ── Helpers ────────────────────────────────────────────────────────────────────

function loadTeamMembers(teamId: string): StoredTeamMember[] {
  try { return JSON.parse(localStorage.getItem(`evaryst_team_members_${teamId}`) || '[]') } catch { return [] }
}

function conversionBadge(pct: number) {
  if (pct > 20) return { bg: '#DCFCE7', clr: '#15803D' }
  if (pct > 10) return { bg: '#FEF3C7', clr: '#B45309' }
  return { bg: '#FEE2E2', clr: '#B91C1C' }
}

// ── Component ──────────────────────────────────────────────────────────────────

interface ReportsPageProps {
  setCurrentPage: (page: string) => void
  candidates:     Candidate[]
  jobs:           Job[]
  isManager?:     boolean
  currentUser:    User
}

export function ReportsPage({ candidates, jobs, isManager, currentUser }: ReportsPageProps) {
  const [period, setPeriod] = useState<Period>('month')

  // My own candidates
  const myCandidates = isManager
    ? candidates
    : candidates.filter(c => !c.ownerId || c.ownerId === currentUser.id || c.ownerEmail === currentUser.email)

  // Pipeline funnel uses myCandidates for recruiter, all for manager
  const pipelineCandidates = myCandidates

  // Period helpers
  function isThisPeriod(dateStr: string): boolean {
    const date = new Date(dateStr)
    const now  = new Date()
    if (period === 'week') return (now.getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }

  const periodCandidates = myCandidates.filter(c => isThisPeriod(c.addedDate))

  // MY PERFORMANCE metrics
  const myPlacements  = periodCandidates.filter(c => c.stage === 'Placed').length
  const mySubmissions = periodCandidates.filter(c => c.stage === 'Submitted').length
  const myInterviews  = periodCandidates.filter(c => c.stage === 'Interview').length
  const myActive      = myCandidates.filter(c => !c.isArchived).length

  const perfCards = [
    { icon: Trophy,   iconBg: '#EFF6FF', iconClr: '#2563EB', label: 'Placements',       value: myPlacements  },
    { icon: Send,     iconBg: '#F3E8FF', iconClr: '#8B5CF6', label: 'Submissions',       value: mySubmissions },
    { icon: Calendar, iconBg: '#FEF3C7', iconClr: '#F59E0B', label: 'Interviews',        value: myInterviews  },
    { icon: Phone,    iconBg: '#DCFCE7', iconClr: '#10B981', label: 'Active candidates', value: myActive      },
  ]

  // TEAM PERFORMANCE (manager only)
  const teamMembers = isManager ? loadTeamMembers(currentUser.teamId) : []
  const recruiters  = teamMembers.filter(m => m.role === 'recruiter' && m.status === 'active')

  const teamKpiCards = [
    { icon: Trophy,   iconBg: '#EFF6FF', iconClr: '#2563EB', label: 'Total Placements',  value: candidates.filter(c => c.stage === 'Placed').length },
    { icon: Users,    iconBg: '#F0FDF4', iconClr: '#16A34A', label: 'Active Candidates', value: candidates.filter(c => !c.isArchived).length },
    { icon: Briefcase,iconBg: '#FEF3C7', iconClr: '#F59E0B', label: 'Open Jobs',         value: jobs.filter(j => j.status === 'Open').length },
    { icon: Calendar, iconBg: '#F5F3FF', iconClr: '#8B5CF6', label: 'Interviews',        value: 0 },
  ]

  const teamRows = isManager
    ? [
        // Manager row first
        (() => {
          const owned = candidates.filter(c => c.ownerEmail === currentUser.email || c.ownerId === currentUser.id)
          const total       = owned.length
          const placements  = owned.filter(c => c.stage === 'Placed').length
          const submissions = owned.filter(c => c.stage === 'Submitted').length
          const active      = owned.filter(c => !c.isArchived).length
          const pct         = total > 0 ? Math.round((placements / total) * 100) : 0
          return { id: currentUser.id, name: currentUser.name, email: currentUser.email, role: 'Manager' as const, total, active, placements, submissions, pct }
        })(),
        ...recruiters.map(r => {
          const owned = candidates.filter(c => c.ownerEmail === r.email || c.ownerId === r.id)
          const total       = owned.length
          const placements  = owned.filter(c => c.stage === 'Placed').length
          const submissions = owned.filter(c => c.stage === 'Submitted').length
          const active      = owned.filter(c => !c.isArchived).length
          const pct         = total > 0 ? Math.round((placements / total) * 100) : 0
          return { id: r.id, name: r.name || r.email, email: r.email, role: 'Recruiter' as const, total, active, placements, submissions, pct }
        }),
      ]
    : []

  // PIPELINE HEALTH funnel
  const STAGE_LABELS = ['New candidates', 'Phone Screen', 'Interview', 'References', 'Submitted', 'Placed'] as const
  const STAGE_KEYS   = ['New', 'Phone Screen', 'Interview', 'References', 'Submitted', 'Placed'] as const
  const stageCounts  = STAGE_KEYS.map(s => pipelineCandidates.filter(c => c.stage === s).length)
  const maxCount     = Math.max(...stageCounts, 1)

  const funnel = STAGE_LABELS.map((label, i) => ({
    stage: label,
    count: stageCounts[i],
    fill:  FUNNEL_FILLS[i],
    pct:   Math.round((stageCounts[i] / maxCount) * 100),
  }))

  const pillBase     = 'text-[12px] rounded-[7px] transition-colors cursor-pointer'
  const pillActive   = `${pillBase} bg-[#EFF6FF] text-[#2563EB] font-medium`
  const pillInactive = `${pillBase} bg-white text-[#64748B] hover:bg-[#F8FAFC]`

  const STATUS_BADGE: Record<string, { bg: string; clr: string; label: string }> = {
    'Open':    { bg: '#DCFCE7', clr: '#15803D', label: 'Open'    },
    'On Hold': { bg: '#FEF3C7', clr: '#B45309', label: 'On Hold' },
    'Closed':  { bg: '#F1F5F9', clr: '#64748B', label: 'Closed'  },
  }

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-[#1E293B] flex-1">Reports</h1>
        <div className="flex items-center gap-1" style={{ border: '0.5px solid #E2E8F0', borderRadius: 9, padding: 3, background: 'white' }}>
          <button type="button" onClick={() => setPeriod('week')}  className={period === 'week'  ? pillActive : pillInactive} style={{ padding: '6px 14px' }}>This week</button>
          <button type="button" onClick={() => setPeriod('month')} className={period === 'month' ? pillActive : pillInactive} style={{ padding: '6px 14px' }}>This month</button>
        </div>
      </div>

      {/* ── SECTION A: MY PERFORMANCE ─────────────────────────────────────────── */}
      <p className={SECTION_LABEL} style={{ letterSpacing: '0.05em' }}>My Performance</p>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {perfCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`${CARD} p-4`} style={CARD_ST}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: card.iconBg }}>
                <Icon size={16} style={{ color: card.iconClr }} />
              </div>
              <p className="text-[11px] text-[#64748B] mt-2">{card.label}</p>
              <p className="text-[28px] font-semibold text-[#1E293B] leading-none mt-1">{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* ── SECTION B: TEAM PERFORMANCE (manager only) ────────────────────────── */}
      {isManager && (
        <>
          <p className={SECTION_LABEL} style={{ letterSpacing: '0.05em' }}>Team Performance</p>

          {/* Team KPI cards */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {teamKpiCards.map(card => {
              const Icon = card.icon
              return (
                <div key={card.label} className={`${CARD} p-4`} style={CARD_ST}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: card.iconBg }}>
                    <Icon size={16} style={{ color: card.iconClr }} />
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-2">{card.label}</p>
                  <p className="text-[28px] font-semibold text-[#1E293B] leading-none mt-1">{card.value}</p>
                </div>
              )
            })}
          </div>

          {/* Recruiter breakdown table */}
          <div className={`${CARD} overflow-hidden mb-6`} style={CARD_ST}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
                  <th scope="col" className={`${TH} text-left`}   style={{ letterSpacing: '0.05em' }}>Recruiter</th>
                  <th scope="col" className={`${TH} text-center`} style={{ letterSpacing: '0.05em' }}>Total</th>
                  <th scope="col" className={`${TH} text-center`} style={{ letterSpacing: '0.05em' }}>Active</th>
                  <th scope="col" className={`${TH} text-center`} style={{ letterSpacing: '0.05em' }}>Placements</th>
                  <th scope="col" className={`${TH} text-center`} style={{ letterSpacing: '0.05em' }}>Submissions</th>
                  <th scope="col" className={`${TH} text-center`} style={{ letterSpacing: '0.05em' }}>Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {teamRows.map((row, idx, arr) => {
                  const { bg, clr } = getAvatarColor(row.id)
                  const badge = conversionBadge(row.pct)
                  const isLast = idx === arr.length - 1
                  return (
                    <tr key={row.id} style={isLast ? undefined : { borderBottom: '0.5px solid #F1F5F9' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold leading-none"
                            style={{ backgroundColor: bg, color: clr }}
                          >
                            {getInitials(row.name)}
                          </div>
                          <div className="leading-tight">
                            <p className="text-[13px] font-medium text-[#1E293B]">{row.name}</p>
                            <p className="text-[11px] text-[#64748B]">{row.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center text-[13px] text-[#1E293B] px-4 py-3">{row.total}</td>
                      <td className="text-center text-[13px] text-[#1E293B] px-4 py-3">{row.active}</td>
                      <td className="text-center text-[13px] text-[#1E293B] px-4 py-3">{row.placements}</td>
                      <td className="text-center text-[13px] text-[#1E293B] px-4 py-3">{row.submissions}</td>
                      <td className="text-center px-4 py-3">
                        <span
                          className="inline-block text-[11px] font-medium rounded-full px-2 py-0.5"
                          style={{ backgroundColor: badge.bg, color: badge.clr }}
                        >
                          {row.pct}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {teamRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-[12px] text-[#64748B]">No team members yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── SECTION C: PIPELINE HEALTH ────────────────────────────────────────── */}
      <p className={SECTION_LABEL} style={{ letterSpacing: '0.05em' }}>Pipeline Health</p>
      <div className={`${CARD} p-5 mb-6`} style={CARD_ST}>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[13px] font-medium text-[#1E293B]">Conversion funnel</span>
          <span className="text-[11px] text-[#64748B]">Active candidates in pipeline</span>
        </div>
        <div className="flex flex-col gap-3">
          {funnel.map(row => (
            <div key={row.stage} className="flex items-center gap-3">
              <span className="text-[13px] text-[#1E293B]" style={{ minWidth: 140 }}>{row.stage}</span>
              <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${row.pct}%`, backgroundColor: row.fill }} />
              </div>
              <span className="text-[13px] font-medium text-[#1E293B]" style={{ minWidth: 32, textAlign: 'right' }}>{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION D: JOBS ACTIVITY ──────────────────────────────────────────── */}
      <p className={SECTION_LABEL} style={{ letterSpacing: '0.05em' }}>Jobs Activity</p>
      <div className={`${CARD} overflow-hidden mb-6`} style={CARD_ST}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
              <th scope="col" className={`${TH} text-left`}   style={{ letterSpacing: '0.05em' }}>Client</th>
              <th scope="col" className={`${TH} text-left`}   style={{ letterSpacing: '0.05em' }}>Position</th>
              <th scope="col" className={`${TH} text-center`} style={{ letterSpacing: '0.05em' }} title="Days since job was opened">Days Open</th>
              <th scope="col" className={`${TH} text-center`} style={{ letterSpacing: '0.05em' }} title="Candidates submitted to client">Submitted</th>
              <th scope="col" className={`${TH} text-center`} style={{ letterSpacing: '0.05em' }} title="Interviews scheduled">Interviews</th>
              <th scope="col" className={`${TH} text-center`} style={{ letterSpacing: '0.05em' }} title="Candidates in pipeline">Active</th>
              <th scope="col" className={`${TH} text-left`}   style={{ letterSpacing: '0.05em' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-[12px] text-[#64748B]">No jobs yet</td>
              </tr>
            ) : jobs.map((job, idx, arr) => {
              const badge      = STATUS_BADGE[job.status] ?? STATUS_BADGE['Closed']
              const isLast     = idx === arr.length - 1
              const jobCands   = candidates.filter(c => c.attachedJobIds?.includes(job.id))
              const submitted  = jobCands.filter(c => c.stage === 'Submitted').length
              const interviews = jobCands.filter(c => c.stage === 'Interview').length
              const active     = jobCands.filter(c => !c.isArchived).length
              return (
                <tr key={job.id} style={isLast ? undefined : { borderBottom: '0.5px solid #F1F5F9' }}>
                  <td className="px-4 py-3 text-[13px] text-[#1E293B]">{job.companyName}</td>
                  <td className="px-4 py-3 text-[13px] text-[#1E293B]">{job.title}</td>
                  <td className="px-4 py-3 text-center text-[13px] text-[#1E293B]">{job.dateAdded ? daysOpen(job.dateAdded) : '—'}</td>
                  <td className="px-4 py-3 text-center text-[13px] text-[#1E293B]">{submitted}</td>
                  <td className="px-4 py-3 text-center text-[13px] text-[#1E293B]">{interviews}</td>
                  <td className="px-4 py-3 text-center text-[13px] text-[#1E293B]">{active}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block text-[11px] font-medium rounded-full px-2 py-0.5"
                      style={{ backgroundColor: badge.bg, color: badge.clr }}
                    >
                      {badge.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── SECTION E: SOURCE BREAKDOWN ───────────────────────────────────────── */}
      <p className={SECTION_LABEL} style={{ letterSpacing: '0.05em' }}>Source Breakdown</p>
      <div className={`${CARD} p-5`} style={{ ...CARD_ST, maxWidth: 460 }}>
        <p className="text-[13px] font-medium text-[#1E293B] mb-4">Where candidates come from</p>
        {(() => {
          const total = myCandidates.length
          if (total === 0) return <p className="text-[12px] text-[#64748B]">No source data yet</p>
          const SOURCE_FILLS = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#64748B']
          const sources = ['Referral', 'LinkedIn', 'Job boards', 'Direct', 'Other']
            .map((s, si) => ({
              name:  s,
              fill:  SOURCE_FILLS[si],
              count: myCandidates.filter(c => c.source === s).length,
            }))
            .filter(s => s.count > 0)
            .sort((a, b) => b.count - a.count)
          if (sources.length === 0) return <p className="text-[12px] text-[#64748B]">No source data yet</p>
          return (
            <div className="flex flex-col gap-3">
              {sources.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-[13px] text-[#1E293B]" style={{ minWidth: 90 }}>{s.name}</span>
                  <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((s.count / total) * 100)}%`, backgroundColor: s.fill }} />
                  </div>
                  <span className="text-[12px] text-[#64748B]" style={{ minWidth: 52, textAlign: 'right' }}>
                    {s.count} ({Math.round((s.count / total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          )
        })()}
      </div>

    </div>
  )
}
