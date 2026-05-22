import { useState, useRef, useEffect } from 'react'
import { Phone, Video, Calendar, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Data ──────────────────────────────────────────────────────────────────────

interface SchedEvent {
  id:           string
  time:         string
  type:         'phone' | 'video'
  name:         string
  initials:     string
  avatarBg:     string
  avatarClr:    string
  company:      string
  description?: string
  platform:     string
  timeSoon?:    string
}

const DATA_DATE = new Date(2026, 4, 15, 0, 0, 0, 0) // May 15, 2026

const EVENTS_MAY15: SchedEvent[] = [
  {
    id: '1', time: '8:00 AM',  type: 'phone',
    name: 'John Scott',    initials: 'JS', avatarBg: '#FFFBEB', avatarClr: '#B45309',
    company: 'Elemental Dynamics', description: 'Review background and resume',
    platform: 'By Phone', timeSoon: 'in 15m',
  },
  {
    id: '2', time: '9:00 AM',  type: 'video',
    name: 'Ava Foster',    initials: 'AF', avatarBg: '#DBEAFE', avatarClr: '#1D4ED8',
    company: 'ZenithCraft', platform: 'Google Meet',
  },
  {
    id: '3', time: '10:00 AM', type: 'video',
    name: 'Mason Harper',  initials: 'MH', avatarBg: '#F3E8FF', avatarClr: '#6D28D9',
    company: 'Elemental Dynamics', platform: 'Google Meet',
  },
  {
    id: '4', time: '11:00 AM', type: 'video',
    name: 'Omar Mango',    initials: 'OM', avatarBg: '#DCFCE7', avatarClr: '#15803D',
    company: 'HealthSync', platform: 'Google Meet',
  },
  {
    id: '5', time: '1:00 PM',  type: 'video',
    name: 'Ahmad Vaccaro', initials: 'AV', avatarBg: '#FEE2E2', avatarClr: '#B91C1C',
    company: 'HealthSync', platform: 'Google Meet',
  },
  {
    id: '6', time: '4:30 PM',  type: 'phone',
    name: 'Sarah Kim',     initials: 'SK', avatarBg: '#F3E8FF', avatarClr: '#6D28D9',
    company: 'ABC Company', platform: 'By Phone',
  },
]

const WEEK_ABBR = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

// ── Sub-components (defined outside to avoid remounting) ──────────────────────

function EventListRow({ ev }: { ev: SchedEvent }) {
  const isPhone = ev.type === 'phone'
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#F1F5F9] last:border-0">
      <span className="text-[11px] text-[#94A3B8] w-[68px] shrink-0 tabular-nums">{ev.time}</span>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isPhone ? 'bg-blue-50' : 'bg-purple-50'
        }`}
      >
        {isPhone
          ? <Phone className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
          : <Video className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1E293B] truncate">{ev.name}</p>
        <p className="text-[11px] text-[#64748B] truncate">{ev.company}</p>
      </div>
      <span
        className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${
          isPhone ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
        }`}
      >
        {ev.platform}
      </span>
    </div>
  )
}

function TimelineCard({ ev }: { ev: SchedEvent }) {
  const isPhone = ev.type === 'phone'
  return (
    <div className="flex gap-3 px-4 py-3 border-b border-[#F1F5F9] last:border-0">
      {/* Icon + time badge */}
      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
        <div
          className={`w-8 h-8 rounded-full border flex items-center justify-center ${
            isPhone ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'
          }`}
        >
          {isPhone
            ? <Phone className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
            : <Video className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
          }
        </div>
        <span
          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
            isPhone ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
          }`}
        >
          {ev.time}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Avatar + name row */}
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
            style={{ backgroundColor: ev.avatarBg, color: ev.avatarClr }}
          >
            {ev.initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[13px] font-semibold text-[#1E293B] truncate">{ev.name}</p>
              {ev.timeSoon && (
                <span className="shrink-0 text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                  {ev.timeSoon}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#64748B] truncate">{ev.company}</p>
          </div>
        </div>

        {/* Description */}
        {ev.description && (
          <div className="ml-11 text-[11px] text-[#64748B] bg-[#F8FAFC] border-subtle rounded-lg px-3 py-2 mb-1.5">
            {ev.description}
          </div>
        )}

        {/* Platform */}
        <div className="ml-11 flex items-center gap-1 text-[11px] text-[#64748B]">
          <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
          <span>{ev.platform}</span>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ScheduleCard() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [selectedDay, setSelectedDay] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOfWeek(new Date()))

  // Date picker state
  const [pickerOpen, setPickerOpen]   = useState(false)
  const [viewMonth,  setViewMonth]    = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pickerOpen) return
    function onOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [pickerOpen])

  function selectDate(d: Date) {
    setSelectedDay(d)
    setWeekStart(getMondayOfWeek(d))
    setPickerOpen(false)
  }

  function prevWeek() {
    const ns = new Date(weekStart)
    ns.setDate(weekStart.getDate() - 7)
    setWeekStart(ns)
    const dow  = selectedDay.getDay()
    const diff = dow === 0 ? 6 : dow - 1
    const nd   = new Date(ns)
    nd.setDate(ns.getDate() + diff)
    setSelectedDay(nd)
  }

  function nextWeek() {
    const ns = new Date(weekStart)
    ns.setDate(weekStart.getDate() + 7)
    setWeekStart(ns)
    const dow  = selectedDay.getDay()
    const diff = dow === 0 ? 6 : dow - 1
    const nd   = new Date(ns)
    nd.setDate(ns.getDate() + diff)
    setSelectedDay(nd)
  }

  // Header labels
  const weekEnd   = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const weekLabel = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${weekEnd.getDate()}`

  const isSelectedToday = isSameDay(selectedDay, today)
  const pickerLabel     = isSelectedToday
    ? `Today · ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : selectedDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  // Events: only available for May 15, 2026
  const dayEvents = isSameDay(selectedDay, DATA_DATE) ? EVENTS_MAY15 : []

  // Calendar cells for date picker
  const vmYear      = viewMonth.getFullYear()
  const vmMonth     = viewMonth.getMonth()
  const firstDay    = new Date(vmYear, vmMonth, 1).getDay()
  const daysInMonth = new Date(vmYear, vmMonth + 1, 0).getDate()
  const monthLabel  = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <section
      className="bg-white border-subtle rounded-[10px] shadow-sm flex flex-col"
      aria-labelledby="schedule-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
        <h2 id="schedule-heading" className="text-[14px] font-medium text-[#1E293B]">
          Schedule
        </h2>

        <div className="flex items-center gap-3">
          {/* Week navigation */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={prevWeek}
              className="p-1 rounded hover:bg-slate-100 transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4 text-[#94A3B8]" />
            </button>
            <span className="text-[12px] font-medium text-[#64748B] whitespace-nowrap px-1">
              {weekLabel}
            </span>
            <button
              type="button"
              onClick={nextWeek}
              className="p-1 rounded hover:bg-slate-100 transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
            </button>
          </div>

          {/* Date picker */}
          <div ref={pickerRef} className="relative">
            <button
              type="button"
              onClick={() => setPickerOpen(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border-subtle rounded-[7px] text-[12px] font-medium text-[#1E293B] hover:bg-slate-50 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
              {pickerLabel}
            </button>

            {pickerOpen && (
              <div className="absolute right-0 top-9 z-50 bg-white border-subtle rounded-xl shadow-lg p-4 w-[272px]">
                {/* Month nav */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => setViewMonth(new Date(vmYear, vmMonth - 1, 1))}
                    className="p-1 rounded hover:bg-slate-100 transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#64748B]" />
                  </button>
                  <span className="text-[13px] font-bold text-[#1E293B]">{monthLabel}</span>
                  <button
                    type="button"
                    onClick={() => setViewMonth(new Date(vmYear, vmMonth + 1, 1))}
                    className="p-1 rounded hover:bg-slate-100 transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-4 h-4 text-[#64748B]" />
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-[#94A3B8] py-1">{d}</div>
                  ))}
                </div>

                {/* Date cells */}
                <div className="grid grid-cols-7 gap-y-0.5">
                  {cells.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} />
                    const cellDate = new Date(vmYear, vmMonth, day)
                    cellDate.setHours(0, 0, 0, 0)
                    const isSelected = isSameDay(cellDate, selectedDay)
                    const isTod      = isSameDay(cellDate, today)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => selectDate(cellDate)}
                        className={`relative flex flex-col items-center justify-center w-8 h-8 mx-auto rounded-full text-[12px] font-medium transition-colors ${
                          isSelected
                            ? 'bg-[#2563EB] text-white'
                            : 'hover:bg-slate-100 text-[#1E293B]'
                        }`}
                      >
                        {day}
                        {isTod && (
                          <span
                            className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-[#2563EB]'
                            }`}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body: two columns */}
      <div className="flex divide-x divide-[#E2E8F0]">

        {/* LEFT — week strip + event list */}
        <div className="flex-1 p-4 flex flex-col gap-3 min-w-0">

          {/* Week strip — 7 clickable day pills */}
          <div className="flex gap-1">
            {WEEK_ABBR.map((abbr, i) => {
              const day    = new Date(weekStart)
              day.setDate(weekStart.getDate() + i)
              const isDayToday = isSameDay(day, today)
              const isDaySel   = isSameDay(day, selectedDay)
              return (
                <button
                  key={abbr}
                  type="button"
                  onClick={() => setSelectedDay(new Date(day))}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-colors ${
                    isDaySel
                      ? 'bg-[#2563EB]'
                      : isDayToday
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`text-[10px] font-medium ${
                      isDaySel ? 'text-white' : isDayToday ? 'text-[#2563EB]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {abbr}
                  </span>
                  <span
                    className={`text-[13px] font-semibold ${
                      isDaySel ? 'text-white' : isDayToday ? 'text-[#2563EB]' : 'text-[#1E293B]'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Event list */}
          <div className="flex flex-col">
            {dayEvents.length > 0 ? (
              dayEvents.map(ev => <EventListRow key={ev.id} ev={ev} />)
            ) : (
              <p className="text-[13px] text-[#94A3B8] text-center py-8">No events for this day</p>
            )}
          </div>
        </div>

        {/* RIGHT — timeline */}
        <div className="w-[300px] shrink-0 overflow-y-auto max-h-[340px]">
          {dayEvents.length > 0 ? (
            dayEvents.map(ev => <TimelineCard key={ev.id} ev={ev} />)
          ) : (
            <p className="text-[13px] text-[#94A3B8] text-center py-8 px-4">No events</p>
          )}
        </div>

      </div>
    </section>
  )
}
