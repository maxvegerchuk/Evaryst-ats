import { useState } from 'react'
import { Phone, Video, MoreHorizontal, ExternalLink } from 'lucide-react'

// ── Shared helpers ────────────────────────────────────────────────────────────

function dayMidnight(d: Date): Date {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  )
}

function getMondayOfWeek(d: Date): Date {
  const day = d.getDay()
  const mon = new Date(d)
  mon.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  mon.setHours(0, 0, 0, 0)
  return mon
}

const STRIP_ABBR = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

// ── Section 1 data — compact Calls / Meetings list ────────────────────────────

interface ListEntry {
  id:     string
  name:   string
  detail: string
}

type MeetingRow =
  | { kind: 'employer';  label: string }
  | { kind: 'jobTitle';  name:  string }
  | { kind: 'candidate'; id: string; name: string; bold?: boolean }

const sharedClients: ListEntry[] = [
  { id: 'olivia-bennett',  name: 'Olivia Bennett',  detail: 'QuantumSynergy Solutions'  },
  { id: 'ethan-rodriguez', name: 'Ethan Rodriguez', detail: 'InnovateHub Technologies'  },
]

const callsCandidates: ListEntry[] = [
  { id: 'ava-foster',      name: 'Ava Foster',      detail: 'UX Designer'              },
  { id: 'mason-harper',    name: 'Mason Harper',    detail: 'Software Engineer'         },
  { id: 'lily-turner',     name: 'Lily Turner',     detail: 'Accountant'               },
  { id: 'jackson-rivera',  name: 'Jackson Rivera',  detail: 'Administrative Assistant' },
  { id: 'sophia-phillips', name: 'Sophia Phillips', detail: 'Helpdesk'                 },
]

const meetingCandRows: MeetingRow[] = [
  { kind: 'employer',  label: 'NATIONSTAR MORTGAGE' },
  { kind: 'jobTitle',  name: 'Senior .NET Developer' },
  { kind: 'candidate', id: 'lily-turner-m',    name: 'Lily Turner'    },
  { kind: 'candidate', id: 'jackson-rivera-m', name: 'Jackson Rivera' },
  { kind: 'employer',  label: 'METHANEX' },
  { kind: 'candidate', id: 'biz-rel-mgr',  name: 'Business Relationship Manager', bold: true },
  { kind: 'candidate', id: 'aiden-hayes',  name: 'Aiden Hayes'   },
  { kind: 'candidate', id: 'caleb-brooks', name: 'Caleb Brooks'  },
]

function EntryRow({
  entry, selected, toggle,
}: { entry: ListEntry; selected: Set<string>; toggle: (id: string) => void }) {
  return (
    <label className="flex items-start gap-2 px-3 py-[5px] hover:bg-[#F8FAFC] cursor-pointer">
      <input
        type="checkbox"
        checked={selected.has(entry.id)}
        onChange={() => toggle(entry.id)}
        className="mt-0.5 w-3.5 h-3.5 shrink-0 accent-blue-600"
      />
      <div className="min-w-0">
        <p className="text-[12px] text-[#1E293B] leading-tight truncate">{entry.name}</p>
        <p className="text-[11px] text-[#64748B] leading-tight truncate">{entry.detail}</p>
      </div>
    </label>
  )
}

// ── Section 2 data — Timeline ─────────────────────────────────────────────────

interface TLEvent {
  id:           string
  type:         'phone' | 'video'
  time:         string
  timeSoon?:    string
  name:         string
  initials:     string
  avatarBg:     string
  avatarText:   string
  company:      string
  description?: string
  platform:     string
}

const TL_DATE = new Date(2026, 4, 15)

const tlEvents: TLEvent[] = [
  {
    id: '1', type: 'phone', time: '8:00 AM', timeSoon: 'in 15m',
    name: 'John Scott',    initials: 'JS', avatarBg: '#FFFBEB', avatarText: '#B45309',
    company: 'Elemental Dynamics',
    description: 'Review background and resume',
    platform: 'By Phone',
  },
  {
    id: '2', type: 'video', time: '9:00 AM',
    name: 'Ava Foster',    initials: 'AF', avatarBg: '#DBEAFE', avatarText: '#1D4ED8',
    company: 'ZenithCraft Innovations',
    platform: 'In Google Meet',
  },
  {
    id: '3', type: 'video', time: '10:00 AM',
    name: 'Mason Harper',  initials: 'MH', avatarBg: '#F3E8FF', avatarText: '#6D28D9',
    company: 'Elemental Dynamics',
    platform: 'In Google Meet',
  },
  {
    id: '4', type: 'video', time: '11:00 AM',
    name: 'Omar Mango',    initials: 'OM', avatarBg: '#DCFCE7', avatarText: '#15803D',
    company: 'HealthSync Systems',
    description: 'Interview with developer for recipe app',
    platform: 'In Google Meet',
  },
  {
    id: '5', type: 'video', time: '1:00 PM',
    name: 'Ahmad Vaccaro', initials: 'AV', avatarBg: '#FFEDD5', avatarText: '#9A3412',
    company: 'HealthSync Systems',
    platform: 'In Google Meet',
  },
  {
    id: '6', type: 'phone', time: '1:00 PM',
    name: 'Ruben Curtis',  initials: 'RC', avatarBg: '#EEF2FF', avatarText: '#3730A3',
    company: 'UrbanGrow Inc.',
    platform: 'By Phone',
  },
]

function TimelineCard({ evt }: { evt: TLEvent }) {
  const isPhone = evt.type === 'phone'
  const IconComp = isPhone ? Phone : Video
  const iconBg   = isPhone ? 'bg-blue-50 border border-blue-200'     : 'bg-purple-50 border border-purple-200'
  const iconClr  = isPhone ? 'text-blue-600'                          : 'text-purple-600'

  return (
    <div className="flex gap-3 px-3 py-3 border-b border-[#F1F5F9] last:border-0">
      {/* Type icon circle */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
        <IconComp className={`w-3.5 h-3.5 ${iconClr}`} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Time row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {evt.timeSoon && (
              <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full leading-none">
                {evt.timeSoon}
              </span>
            )}
            <span className="text-[11px] text-[#64748B]">{evt.time}</span>
          </div>
          <button
            type="button"
            className="p-0.5 rounded hover:bg-slate-100 transition-colors shrink-0"
            aria-label="More options"
          >
            <MoreHorizontal className="w-3.5 h-3.5 text-[#CBD5E1]" />
          </button>
        </div>

        {/* Avatar + Name + Company */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
            style={{ backgroundColor: evt.avatarBg, color: evt.avatarText }}
          >
            {evt.initials}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#1E293B] leading-tight">{evt.name}</p>
            <p className="text-[12px] text-[#64748B] leading-tight truncate">{evt.company}</p>
          </div>
        </div>

        {/* Description */}
        {evt.description && (
          <div className="bg-[#F8FAFC] rounded-md px-2 py-2 text-[12px] text-[#64748B] border border-[#F1F5F9] mb-1.5">
            {evt.description}
          </div>
        )}

        {/* Platform */}
        <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
          <span>{evt.platform}</span>
          <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

// ── Section 3 data — My Jobs ──────────────────────────────────────────────────

interface Job {
  client:   string
  position: string
  days:     number
  sub:      number
  int:      number
  active:   number
}

const jobs: Job[] = [
  { client: 'MedStar',     position: 'Network Admin',   days: 12, sub: 2, int: 0, active: 2 },
  { client: 'Tyco',        position: 'HR Manager',       days: 7,  sub: 4, int: 3, active: 2 },
  { client: 'Senderra Rx', position: '.NET Developer',   days: 4,  sub: 2, int: 0, active: 2 },
  { client: 'Glazers',     position: 'Helpdesk',         days: 8,  sub: 6, int: 2, active: 3 },
  { client: 'Pepsico',     position: 'Business Analyst', days: 3,  sub: 1, int: 1, active: 1 },
]

// ── Main component ─────────────────────────────────────────────────────────────

export function RightPanel() {
  const today = dayMidnight(new Date())

  // Section 1 state
  const [tab, setTab]           = useState<'calls' | 'meetings'>('calls')
  const [selected, setSelected] = useState<Set<string>>(() => new Set(['biz-rel-mgr']))

  // Section 2 state
  const [selectedDay, setSelectedDay] = useState<Date>(() => dayMidnight(new Date()))

  // Compute week strip (Mon → Sun of current week)
  const monday  = getMondayOfWeek(today)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  const todayLabel = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const isSelectedToday = isSameDay(selectedDay, today)
  const dayHasEvents = (d: Date) => isSameDay(d, dayMidnight(TL_DATE))

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function viewProfiles() {
    selected.forEach(id => window.open('/candidates/' + id, '_blank'))
    setSelected(new Set())
  }

  return (
    <aside
      className="w-[280px] shrink-0 bg-white flex flex-col overflow-y-auto"
      style={{ borderLeft: '0.5px solid #E2E8F0' }}
      aria-label="Calls, schedule, and jobs panel"
    >

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — COMPACT CALLS / MEETINGS
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col">

        {/* Tab bar + View Profiles */}
        <div className="flex items-center border-b border-[#E2E8F0] px-3">
          <div className="flex flex-1">
            {(['calls', 'meetings'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`py-2.5 px-2 text-[12px] font-medium border-b-2 -mb-px capitalize transition-colors ${
                  tab === t
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                {t === 'calls' ? 'Calls' : 'Meetings'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={viewProfiles}
            disabled={selected.size === 0}
            className="text-[11px] font-medium bg-[#2563EB] text-white px-2.5 py-1 rounded-md shrink-0 disabled:opacity-50 transition-opacity whitespace-nowrap"
          >
            {selected.size > 0 ? `View Profiles (${selected.size})` : 'View Profiles'}
          </button>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto" style={{ maxHeight: 220 }}>
          {tab === 'calls' ? (
            <>
              <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.08em]">Clients</div>
              {sharedClients.map(c => <EntryRow key={c.id} entry={c} selected={selected} toggle={toggle} />)}
              <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.08em]">Candidates</div>
              {callsCandidates.map(c => <EntryRow key={c.id} entry={c} selected={selected} toggle={toggle} />)}
            </>
          ) : (
            <>
              <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.08em]">Clients</div>
              {sharedClients.map(c => <EntryRow key={c.id} entry={c} selected={selected} toggle={toggle} />)}
              <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.08em]">Candidates</div>
              {meetingCandRows.map((row, i) => {
                if (row.kind === 'employer') {
                  return <div key={i} className="px-3 pt-2.5 pb-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em]">{row.label}</div>
                }
                if (row.kind === 'jobTitle') {
                  return <div key={i} className="px-3 py-[5px] text-[12px] font-medium text-[#1E293B]">{row.name}</div>
                }
                return (
                  <label
                    key={row.id}
                    className={`flex items-center gap-2 py-[5px] pr-3 hover:bg-[#F8FAFC] cursor-pointer ${row.bold ? 'px-3' : 'pl-5'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggle(row.id)}
                      className="w-3.5 h-3.5 shrink-0 accent-blue-600"
                    />
                    <span className={`text-[12px] text-[#1E293B] truncate ${row.bold ? 'font-medium' : ''}`}>
                      {row.name}
                    </span>
                  </label>
                )
              })}
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — TIMELINE SCHEDULE
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col border-t border-[#E2E8F0]">

        {/* Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <span className="text-[12px] font-medium text-[#1E293B]">Schedule</span>
          <span className="text-[11px] text-[#64748B]">{todayLabel}</span>
        </div>

        {/* Week strip */}
        <div className="flex gap-0.5 px-2 pb-2">
          {weekDays.map((day, i) => {
            const isTod   = isSameDay(day, today)
            const isSel   = isSameDay(day, selectedDay)
            const hasEvts = dayHasEvents(day)
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDay(dayMidnight(day))}
                className={`flex-1 flex flex-col items-center py-1 rounded-md transition-colors ${
                  isSel ? 'bg-[#EFF6FF]' : 'hover:bg-slate-50'
                }`}
              >
                <span className={`text-[10px] leading-none mb-0.5 ${isTod ? 'text-[#2563EB] font-medium' : 'text-[#64748B]'}`}>
                  {STRIP_ABBR[i]}
                </span>
                <span className={`text-[12px] font-medium leading-none ${isSel || isTod ? 'text-[#2563EB]' : 'text-[#1E293B]'}`}>
                  {day.getDate()}
                </span>
                {hasEvts ? (
                  <span className="w-1 h-1 rounded-full bg-[#2563EB] mt-0.5" />
                ) : (
                  <span className="w-1 h-1 mt-0.5" />
                )}
              </button>
            )
          })}
        </div>

        {/* Timeline events */}
        <div className="border-t border-[#F1F5F9] overflow-y-auto" style={{ maxHeight: 420 }}>
          {isSelectedToday ? (
            tlEvents.map(evt => <TimelineCard key={evt.id} evt={evt} />)
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-[13px] text-[#64748B]">No events scheduled</span>
            </div>
          )}
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — MY JOBS
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col border-t border-[#E2E8F0]">

        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <span className="text-[12px] font-medium text-[#1E293B]">My jobs</span>
          <button type="button" className="text-[11px] font-semibold text-[#2563EB] hover:text-blue-700 transition-colors">
            View all →
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
          <table className="w-full">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-[#E2E8F0]">
                <th scope="col" className="text-left pl-3 pr-1 py-1.5 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.06em]"      title="Client">Client</th>
                <th scope="col" className="text-left px-1 py-1.5 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.06em]"           title="Position">Pos</th>
                <th scope="col" className="text-center px-1 py-1.5 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.06em] w-8"     title="Days open">Days</th>
                <th scope="col" className="text-center px-1 py-1.5 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.06em] w-7"     title="Submitted">Sub</th>
                <th scope="col" className="text-center px-1 py-1.5 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.06em] w-7"     title="Interviews">Int</th>
                <th scope="col" className="text-center pr-3 pl-1 py-1.5 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.06em] w-9" title="Active candidates">Act</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.client} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition-colors">
                  <td className="pl-3 pr-1 py-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {job.active > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                      <span className="text-[12px] font-medium text-[#1E293B] truncate">{job.client}</span>
                    </div>
                  </td>
                  <td className="px-1 py-2 max-w-[52px]">
                    <span className="block text-[12px] text-[#64748B] truncate">{job.position}</span>
                  </td>
                  <td className="px-1 py-2 text-[12px] text-[#1E293B] text-center tabular-nums">{job.days}</td>
                  <td className="px-1 py-2 text-[12px] text-[#1E293B] text-center tabular-nums">{job.sub}</td>
                  <td className="px-1 py-2 text-[12px] text-[#1E293B] text-center tabular-nums">{job.int}</td>
                  <td className="pr-3 pl-1 py-2 text-[12px] text-[#1E293B] text-center tabular-nums">{job.active}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </aside>
  )
}
