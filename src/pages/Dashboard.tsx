import { Calendar, AlertTriangle } from 'lucide-react'
import { CallsMeetingsCard } from '../components/dashboard/CallsMeetingsCard'
import { TasksCard }         from '../components/dashboard/TasksCard'
import { ActivityFeed }      from '../components/dashboard/ActivityFeed'
import type { PanelEvent }   from '../components/layout/SchedulePanel'
import type { Candidate }    from '../types/candidate'
import type { User }         from '../types/auth'

interface DashboardProps {
  isScheduleOpen:         boolean
  onToggleSchedule:       () => void
  needsUpdateCount:       number
  onAddScheduleEvent:     (ev: PanelEvent) => void
  isNewUser:              boolean
  candidates:             Candidate[]
  onNavigateToCandidates: (ids: string[]) => void
  isManager?:             boolean
  currentUser:            User
}

export function Dashboard({ isScheduleOpen, onToggleSchedule, needsUpdateCount, onAddScheduleEvent, isNewUser, candidates, onNavigateToCandidates, isManager, currentUser }: DashboardProps) {
  const today     = new Date()
  const dateStr   = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const firstName = currentUser.name.split(' ')[0]
  const hour      = today.getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const myCandidates = isManager
    ? candidates
    : candidates.filter(c => !c.ownerId || c.ownerId === currentUser.id || c.ownerEmail === currentUser.email)


  return (
    <div className="px-5 pt-3 pb-5 flex flex-col gap-4 max-w-[1400px]">

      {/* Greeting row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-[18px] font-medium text-[#1E293B]">{greeting}, {firstName} 👋</p>
          {isManager && (
            <span className="text-[10px] font-medium text-[#2563EB] bg-[#EFF6FF] rounded-full px-2 py-0.5">
              Talent Acquisition Manager
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleSchedule}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] transition-colors ${
            isScheduleOpen
              ? 'hover:bg-slate-100'
              : 'border-subtle bg-white shadow-sm hover:bg-slate-50'
          }`}
          aria-label="Toggle schedule panel"
        >
          <Calendar
            className={`w-4 h-4 ${isScheduleOpen ? 'text-[#94A3B8]' : 'text-[#2563EB]'}`}
            aria-hidden="true"
          />
          <span className={`text-[13px] font-medium ${isScheduleOpen ? 'text-[#64748B]' : 'text-[#1E293B]'}`}>
            {dateStr}
          </span>
        </button>
      </div>

      {/* Call log banner */}
      {needsUpdateCount > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-[10px]"
          style={{ backgroundColor: '#FEF3C7', border: '0.5px solid #F59E0B' }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#92400E' }} aria-hidden="true" />
          <span className="text-[13px] font-medium" style={{ color: '#92400E' }}>
            {needsUpdateCount} call{needsUpdateCount > 1 ? 's' : ''} from today need status update
          </span>
        </div>
      )}

      {/* ── CONTENT ───────────────────────────────────────────────────────────── */}
      <CallsMeetingsCard onAddScheduleEvent={onAddScheduleEvent} candidates={myCandidates} onNavigateToCandidates={onNavigateToCandidates} />

      <div className="grid grid-cols-2 gap-4">
        <TasksCard isNewUser={isNewUser} />
        <ActivityFeed teamId={currentUser.teamId} />
      </div>

    </div>
  )
}
