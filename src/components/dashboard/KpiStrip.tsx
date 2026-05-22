import {
  Users, Briefcase, Calendar, TrendingUp, TrendingDown,
  Clock, BadgeCheck,
} from 'lucide-react'

export function KpiStrip() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="list" aria-label="Key metrics">

      <div className="bg-white border-subtle rounded-[10px] p-3 flex flex-col gap-2 shadow-sm" role="listitem">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Active Candidates</span>
          <Users className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
        </div>
        <p className="text-[20px] font-bold text-text-primary leading-none tabular-nums">47</p>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted" aria-label="Up 8 this week">
          <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" aria-hidden="true" />
          +8 this week
        </span>
      </div>

      <div className="bg-white border-subtle rounded-[10px] p-3 flex flex-col gap-2 shadow-sm" role="listitem">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Open Jobs</span>
          <Briefcase className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
        </div>
        <p className="text-[20px] font-bold text-text-primary leading-none tabular-nums">12</p>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted" aria-label="Down 2 this month">
          <TrendingDown className="w-3.5 h-3.5 text-[#CA8A04]" aria-hidden="true" />
          2 this month
        </span>
      </div>

      <div className="bg-white border-subtle rounded-[10px] p-3 flex flex-col gap-2 shadow-sm" role="listitem">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Interviews Today</span>
          <Calendar className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
        </div>
        <p className="text-[20px] font-bold text-text-primary leading-none tabular-nums">5</p>
        <span className="inline-flex items-center gap-1.5 self-start text-[11px] font-semibold bg-[#EFF6FF] text-blue-700 px-2.5 py-1 rounded-full border border-blue-200" aria-label="Next interview at 10:30 AM">
          <Clock className="w-3 h-3" aria-hidden="true" />
          Next 10:30 AM
        </span>
      </div>

      <div className="bg-white border-subtle rounded-[10px] p-3 flex flex-col gap-2 shadow-sm" role="listitem">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Placements</span>
          <BadgeCheck className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
        </div>
        <p className="text-[20px] font-bold text-text-primary leading-none tabular-nums">2</p>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted" aria-label="Up 1 this month">
          <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" aria-hidden="true" />
          +1 this month
        </span>
      </div>

    </div>
  )
}
