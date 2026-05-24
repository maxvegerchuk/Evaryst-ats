import { useState } from 'react'
import { Phone, Video, ExternalLink, ChevronLeft, ChevronRight, Plus, Check, RotateCcw, PhoneOff, Calendar } from 'lucide-react'
import { AddOutreachModal, type SaveData } from '../ui/AddOutreachModal'
import type { Candidate } from '../../types/candidate'

// ── Types ─────────────────────────────────────────────────────────────────────

export type EventStatus = 'upcoming' | 'needs-update' | 'completed' | 'rescheduled' | 'no-show'

export interface PanelEvent {
  id:           string
  date?:        Date
  time:         string
  hour:         number
  type:         'phone' | 'video'
  name:         string
  initials:     string
  avatarBg:     string
  avatarClr:    string
  company:      string
  note?:        string
  platform:     string
  phone?:       string
  meetingLink?: string
  timeSoon?:    string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  )
}

function getMondayOfWeek(d: Date): Date {
  const date = new Date(d)
  const day  = date.getDay()
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day))
  date.setHours(0, 0, 0, 0)
  return date
}

function fmt12h(t: string): string {
  const [hStr, mStr] = t.split(':')
  const h  = parseInt(hStr, 10)
  const m  = parseInt(mStr, 10)
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${ap}`
}

// Empty — all sample events removed
export const EVENTS: PanelEvent[] = []

const WEEK_ABBR = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

// ── Status visual config ──────────────────────────────────────────────────────

const STATUS_BORDER: Record<EventStatus, string | null> = {
  'upcoming':     null,
  'needs-update': '#F59E0B',
  'completed':    '#16A34A',
  'rescheduled':  '#F59E0B',
  'no-show':      '#DC2626',
}

const STATUS_BADGE: Record<EventStatus, { label: string; bg: string; color: string } | null> = {
  'upcoming':     null,
  'needs-update': { label: 'Update needed', bg: '#FEF3C7', color: '#92400E' },
  'completed':    { label: 'Completed',     bg: '#DCFCE7', color: '#15803D' },
  'rescheduled':  { label: 'Rescheduled',   bg: '#FEF3C7', color: '#92400E' },
  'no-show':      { label: 'Not reached',   bg: '#FEF2F2', color: '#DC2626' },
}

// ── EventCard ─────────────────────────────────────────────────────────────────

interface EventCardProps {
  ev:          PanelEvent
  status:      EventStatus
  onSetStatus: (s: EventStatus) => void
}

function EventCard({ ev, status, onSetStatus }: EventCardProps) {
  const isPhone     = ev.type === 'phone'
  const needsUpdate = status === 'needs-update'
  const isResolved  = status !== 'upcoming' && status !== 'needs-update'
  const border      = STATUS_BORDER[status]
  const badge       = STATUS_BADGE[status]

  return (
    <div
      className="px-4 py-3 border-b border-[#F1F5F9] last:border-0 transition-opacity"
      style={{
        borderLeft:      border ? `3px solid ${border}` : undefined,
        backgroundColor: status === 'needs-update' ? '#FFFBEB' : undefined,
        opacity:         isResolved ? 0.72 : 1,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${isPhone ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
          {isPhone
            ? <Phone className="w-3 h-3 text-blue-600" />
            : <Video className="w-3 h-3 text-purple-600" />
          }
        </div>
        <span className="text-[11px] font-medium text-[#64748B]">{ev.time}</span>
        {ev.timeSoon && status === 'upcoming' && (
          <span className="text-[10px] font-medium bg-[#FFFBEB] text-[#B45309] px-2 py-[2px] rounded-[10px]">{ev.timeSoon}</span>
        )}
        {badge && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold" style={{ backgroundColor: ev.avatarBg, color: ev.avatarClr }}>
          {ev.initials}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-[#1E293B] truncate">{ev.name}</p>
          <p className="text-[11px] text-[#64748B] truncate">{ev.company}</p>
        </div>
      </div>

      {ev.note && (
        <div className="ml-10 text-[11px] text-[#64748B] bg-[#F8FAFC] border-subtle rounded-lg px-2.5 py-1.5 mb-1.5">
          {ev.note}
        </div>
      )}

      <div className="ml-10 flex items-center gap-1 text-[11px] text-[#94A3B8]">
        {ev.type === 'phone' ? (
          <>
            <Phone className="w-3 h-3 shrink-0" />
            <span>{ev.phone ?? ev.platform}</span>
          </>
        ) : ev.meetingLink ? (
          <a href={ev.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#2563EB] hover:underline">
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span>Join meeting</span>
          </a>
        ) : (
          <>
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span>{ev.platform}</span>
          </>
        )}
      </div>

      {needsUpdate && (
        <div className="flex gap-1.5 mt-2 ml-10">
          <button type="button" title="Done" onClick={() => onSetStatus('completed')}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#64748B] bg-white transition-colors shrink-0"
            style={{ border: '0.5px solid #E2E8F0' }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.background = '#DCFCE7'; b.style.color = '#15803D'; b.style.borderColor = '#BBF7D0' }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'white'; b.style.color = '#64748B'; b.style.borderColor = '#E2E8F0' }}>
            <Check className="w-3.5 h-3.5" />
          </button>
          <button type="button" title="Reschedule" onClick={() => onSetStatus('rescheduled')}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#64748B] bg-white transition-colors shrink-0"
            style={{ border: '0.5px solid #E2E8F0' }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.background = '#FEF9C3'; b.style.color = '#92400E'; b.style.borderColor = '#FDE68A' }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'white'; b.style.color = '#64748B'; b.style.borderColor = '#E2E8F0' }}>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button type="button" title="Not reached" onClick={() => onSetStatus('no-show')}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#64748B] bg-white transition-colors shrink-0"
            style={{ border: '0.5px solid #E2E8F0' }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.background = '#FEF2F2'; b.style.color = '#DC2626'; b.style.borderColor = '#FECACA' }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'white'; b.style.color = '#64748B'; b.style.borderColor = '#E2E8F0' }}>
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}



// ── Props & main component ────────────────────────────────────────────────────

interface SchedulePanelProps {
  isOpen:        boolean
  onToggle:      () => void
  eventStatuses: Record<string, EventStatus>
  onSetStatus:   (id: string, status: EventStatus) => void
  events:        PanelEvent[]
  onAddEvent:    (ev: PanelEvent) => void
  candidates?:   Candidate[]
}

export function SchedulePanel({ isOpen, onToggle, eventStatuses, onSetStatus, events, onAddEvent, candidates = [] }: SchedulePanelProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const baseWeekStart = getMondayOfWeek(today)

  const [selectedDay, setSelectedDay] = useState<Date>(today)
  const [weekOffset,  setWeekOffset]  = useState(0)
  const [showModal,   setShowModal]   = useState(false)

  const displayWeekStart = new Date(baseWeekStart)
  displayWeekStart.setDate(baseWeekStart.getDate() + weekOffset * 7)

  const dayEvents = events
    .filter(ev => isSameDay(ev.date ? new Date(ev.date) : today, selectedDay))
    .sort((a, b) => a.hour - b.hour)

  function handleSave(data: SaveData) {
    const isCall    = data.context === 'call'
    const [y, m, d] = data.date.split('-').map(Number)
    const h         = parseInt(data.time.split(':')[0], 10)
    const panelEv: PanelEvent = {
      id:          'evt-' + Date.now(),
      date:        new Date(y, m - 1, d),
      time:        fmt12h(data.time),
      hour:        h,
      type:        isCall ? 'phone' : 'video',
      name:        data.person.name,
      initials:    data.person.initials,
      avatarBg:    data.person.avatarBg,
      avatarClr:   data.person.avatarClr,
      company:     data.person.role,
      platform:    isCall ? 'By Phone' : 'Google Meet',
      phone:       data.phone,
      meetingLink: data.meetingLink,
      note:        data.notes || undefined,
    }
    onAddEvent(panelEv)
    setShowModal(false)
  }

  return (
    <>
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        className={`absolute top-3 -left-3 z-20 w-6 h-6 bg-white border-subtle rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors ${!isOpen ? 'hidden' : ''}`}
        aria-label="Collapse schedule"
      >
        <ChevronRight className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 ${!isOpen ? 'rotate-180' : ''}`} />
      </button>

      <aside
        className={`h-full border-l border-[#E2E8F0] overflow-hidden transition-[width] duration-200 ${isOpen ? 'w-[280px]' : 'w-0'}`}
        aria-label="Schedule"
      >
        <div className="w-[280px] h-full bg-white flex flex-col overflow-y-auto">

          {/* Header */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
            <h2 className="text-[14px] font-medium text-[#1E293B] whitespace-nowrap">Schedule</h2>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 text-[12px] font-medium text-[#2563EB] bg-white border-subtle px-[10px] py-1 rounded-[6px] hover:bg-[#F8FAFC] transition-colors whitespace-nowrap"
            >
              <Plus className="w-3 h-3 text-[#2563EB]" />
              Add event
            </button>
          </div>

          {/* Calendar */}
          <div className="px-3 py-3 border-b border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-1">
              <button type="button" onClick={() => setWeekOffset(w => w - 1)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 transition-colors" aria-label="Previous week">
                <ChevronLeft className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>
              <button type="button" onClick={() => setWeekOffset(w => w + 1)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 transition-colors" aria-label="Next week">
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
              </button>
            </div>
            <div className="flex gap-0.5">
              {WEEK_ABBR.map((abbr, i) => {
                const day     = new Date(displayWeekStart)
                day.setDate(displayWeekStart.getDate() + i)
                const isToday = isSameDay(day, today)
                const isSel   = isSameDay(day, selectedDay)
                const isPast  = day < today && !isToday
                const hasEvt  = events.some(ev => isSameDay(ev.date ? new Date(ev.date) : today, day))

                return (
                  <button key={abbr} type="button" onClick={() => setSelectedDay(new Date(day))}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-1 rounded-lg transition-colors ${
                      isSel ? 'bg-[#2563EB]' : isToday ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-slate-50'
                    }`}>
                    <span className={`text-[9px] font-medium ${isSel ? 'text-blue-100' : isToday ? 'text-[#2563EB]' : isPast ? 'text-[#CBD5E1]' : 'text-[#94A3B8]'}`}>
                      {abbr}
                    </span>
                    <span className={`text-[12px] font-semibold ${isSel ? 'text-white' : isToday ? 'text-[#2563EB]' : isPast ? 'text-[#CBD5E1]' : 'text-[#1E293B]'}`}>
                      {day.getDate()}
                    </span>
                    <span className={`w-1 h-1 rounded-full ${hasEvt ? (isSel ? 'bg-white' : isPast ? 'bg-[#CBD5E1]' : 'bg-[#2563EB]') : 'bg-transparent'}`} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1">
            {dayEvents.length > 0 ? (
              dayEvents.map(ev => (
                <EventCard
                  key={ev.id}
                  ev={ev}
                  status={eventStatuses[ev.id] ?? 'upcoming'}
                  onSetStatus={s => onSetStatus(ev.id, s)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <Calendar className="w-9 h-9 text-[#E2E8F0] mb-2" />
                <p className="text-[12px] text-[#94A3B8]">No events scheduled</p>
              </div>
            )}
          </div>

        </div>
      </aside>
    </div>

    {showModal && (
      <AddOutreachModal
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        candidates={candidates}
      />
    )}
    </>
  )
}
