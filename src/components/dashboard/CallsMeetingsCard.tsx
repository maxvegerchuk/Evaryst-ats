import { useState, useRef, useEffect, useMemo } from 'react'
import { Phone, Video, MoreHorizontal, Calendar, Plus, SlidersHorizontal } from 'lucide-react'
import { AddOutreachModal, type SaveData, type OutreachContext } from '../ui/AddOutreachModal'
import type { PanelEvent } from '../layout/SchedulePanel'
import type { Candidate } from '../../types/candidate'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PersonEntry {
  id:           string
  candidateId?: string
  initials:     string
  avatarBg:     string
  avatarClr:    string
  name:         string
  sub:          string
  type?:        'phone' | 'video'
  scheduledAt?: Date
  company?:     string
}

type GroupRow =
  | { kind: 'company'; label: string }
  | { kind: 'person';  entry: PersonEntry }

type Section = 'calls-clients' | 'calls-candidates' | 'meetings-clients' | 'meetings-candidates'

interface FilterState {
  sort: 'time' | 'name'
  show: 'all' | 'today' | 'no-time'
  type: 'all' | 'clients' | 'candidates'
}

const DEFAULT_FILTER: FilterState = { sort: 'time', show: 'all', type: 'all' }

function fmt12h(t: string): string {
  const [hStr, mStr] = t.split(':')
  const h  = parseInt(hStr, 10)
  const m  = parseInt(mStr, 10)
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${ap}`
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  )
}
function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function formatTooltip(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + formatTime(d)
}

// ── Filter logic ──────────────────────────────────────────────────────────────

function applyClientFilter(clients: PersonEntry[], filter: FilterState, now: Date): PersonEntry[] {
  let filtered = clients
  if (filter.show === 'today') {
    filtered = filtered.filter(p => p.scheduledAt && isSameDay(p.scheduledAt, now))
  } else if (filter.show === 'no-time') {
    filtered = filtered.filter(p => !p.scheduledAt)
  }
  return [...filtered].sort((a, b) => {
    if (filter.sort === 'name') return a.name.localeCompare(b.name)
    const ta = a.scheduledAt?.getTime() ?? Infinity
    const tb = b.scheduledAt?.getTime() ?? Infinity
    return ta - tb
  })
}

function applyGroupFilter(rows: GroupRow[], filter: FilterState, now: Date): GroupRow[] {
  const result: GroupRow[] = []
  let i = 0
  while (i < rows.length) {
    const row = rows[i]
    if (row.kind === 'company') {
      let j = i + 1
      const persons: PersonEntry[] = []
      while (j < rows.length && rows[j].kind === 'person') {
        persons.push((rows[j] as { kind: 'person'; entry: PersonEntry }).entry)
        j++
      }

      let filtered = persons
      if (filter.show === 'today') {
        filtered = filtered.filter(p => p.scheduledAt && isSameDay(p.scheduledAt, now))
      } else if (filter.show === 'no-time') {
        filtered = filtered.filter(p => !p.scheduledAt)
      }
      filtered = [...filtered].sort((a, b) => {
        if (filter.sort === 'name') return a.name.localeCompare(b.name)
        const ta = a.scheduledAt?.getTime() ?? Infinity
        const tb = b.scheduledAt?.getTime() ?? Infinity
        return ta - tb
      })

      if (filtered.length > 0) {
        result.push(row)
        filtered.forEach(e => result.push({ kind: 'person', entry: e }))
      }
      i = j
    } else {
      result.push(row)
      i++
    }
  }
  return result
}

// ── Filter dropdown ───────────────────────────────────────────────────────────

interface FilterDropdownProps {
  filter:   FilterState
  onChange: (f: FilterState) => void
  onReset:  () => void
}

function FilterDropdown({ filter, onChange, onReset }: FilterDropdownProps) {
  return (
    <div className="absolute top-full right-0 mt-1 bg-white border-subtle rounded-[8px] shadow-md z-50 w-[220px] p-3 flex flex-col gap-3">
      {/* Sort */}
      <div>
        <p className="text-[11px] font-semibold text-[#64748B] mb-1.5">Sort</p>
        <div className="flex flex-col gap-0.5">
          {([['time', 'By time'], ['name', 'By name']] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange({ ...filter, sort: val })}
              className="flex items-center gap-2 w-full py-[3px] px-1 text-[12px] text-[#1E293B] hover:bg-slate-50 rounded text-left"
            >
              <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                filter.sort === val ? 'border-[#2563EB]' : 'border-[#CBD5E1]'
              }`}>
                {filter.sort === val && <span className="w-2 h-2 rounded-full bg-[#2563EB]" />}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Show */}
      <div>
        <p className="text-[11px] font-semibold text-[#64748B] mb-1.5">Show</p>
        <div className="flex gap-1 flex-wrap">
          {([['all', 'All'], ['today', 'Today only'], ['no-time', 'No time set']] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange({ ...filter, show: val })}
              className={`text-[11px] px-2 py-[3px] rounded-full border transition-colors ${
                filter.show === val
                  ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                  : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div>
        <p className="text-[11px] font-semibold text-[#64748B] mb-1.5">Type</p>
        <div className="flex gap-1">
          {([['all', 'All'], ['clients', 'Clients'], ['candidates', 'Candidates']] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange({ ...filter, type: val })}
              className={`text-[11px] px-2 py-[3px] rounded-full border transition-colors ${
                filter.type === val
                  ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                  : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] text-[#2563EB] hover:underline"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

// ── Column header (outside scroll area so dropdown is unclipped) ──────────────

interface ColHeaderProps {
  text:          string
  count:         number
  onAdd:         () => void
  appliedFilter: FilterState
  onApplyFilter: (f: FilterState) => void
}

function ColHeader({ text, count, onAdd, appliedFilter, onApplyFilter }: ColHeaderProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const isActive =
    appliedFilter.sort !== 'time' ||
    appliedFilter.show !== 'all'  ||
    appliedFilter.type !== 'all'

  return (
    <div className="bg-white px-4 py-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.08em] border-b border-[#E2E8F0] shrink-0">
      <span className="flex-1 truncate">
        {text} <span className="text-[#CBD5E1] normal-case">({count})</span>
      </span>

      {/* Filter */}
      <div className="relative shrink-0" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          title="Filter"
          className={`w-7 h-7 flex items-center justify-center border rounded-[6px] bg-white hover:bg-[#F8FAFC] transition-colors normal-case tracking-normal ${
            isActive ? 'border-[#2563EB]' : 'border-[#E2E8F0]'
          }`}
        >
          <SlidersHorizontal
            className={`w-3.5 h-3.5 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`}
            aria-hidden="true"
          />
        </button>
        {open && (
          <FilterDropdown
            filter={appliedFilter}
            onChange={onApplyFilter}
            onReset={() => onApplyFilter(DEFAULT_FILTER)}
          />
        )}
      </div>

      {/* Add */}
      <button
        type="button"
        onClick={onAdd}
        className="w-7 h-7 flex items-center justify-center border-subtle rounded-[6px] bg-white hover:bg-[#F8FAFC] transition-colors normal-case tracking-normal shrink-0"
        aria-label={`Add to ${text}`}
      >
        <Plus className="w-3.5 h-3.5 text-[#64748B]" aria-hidden="true" />
      </button>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SubLabel({ text, count }: { text: string; count: number }) {
  return (
    <div className="px-4 pt-1.5 pb-0.5 shrink-0">
      <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.08em]">
        {text} <span className="text-[#CBD5E1] normal-case">({count})</span>
      </span>
    </div>
  )
}

function CompanyLabel({ label }: { label: string }) {
  return (
    <div className="px-4 pt-1 pb-0.5 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] shrink-0">
      {label}
    </div>
  )
}

function TimeIndicator({ scheduledAt }: { scheduledAt?: Date }) {
  if (!scheduledAt) return null
  const now = new Date()
  if (isSameDay(scheduledAt, now)) {
    const diffMin = Math.round((scheduledAt.getTime() - now.getTime()) / 60000)
    if (diffMin >= 0 && diffMin <= 30) {
      return (
        <span className="text-[10px] font-medium bg-[#FFFBEB] text-[#B45309] px-2 py-[2px] rounded-[10px] shrink-0 whitespace-nowrap">
          in {diffMin}m
        </span>
      )
    }
    return (
      <span className="text-[11px] text-[#64748B] shrink-0 whitespace-nowrap">
        {formatTime(scheduledAt)}
      </span>
    )
  }
  return (
    <span title={formatTooltip(scheduledAt)}>
      <Calendar className="w-[13px] h-[13px] text-[#94A3B8] shrink-0" aria-hidden="true" />
      <span className="sr-only">Scheduled {formatTooltip(scheduledAt)}</span>
    </span>
  )
}

interface PersonRowProps {
  entry:    PersonEntry
  selected: Set<string>
  onToggle: (id: string) => void
  showType: boolean
}

function PersonRow({ entry, selected, onToggle, showType }: PersonRowProps) {
  const isSelected = selected.has(entry.id)
  return (
    <div
      role="row"
      tabIndex={0}
      onClick={() => onToggle(entry.id)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(entry.id) } }}
      className={`flex items-center gap-2 px-4 cursor-pointer transition-colors shrink-0 ${
        isSelected ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8FAFC]'
      }`}
      style={{ height: 36 }}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(entry.id)}
        onClick={e => e.stopPropagation()}
        className="w-3.5 h-3.5 shrink-0 accent-blue-600"
        aria-label={entry.name}
      />
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
        style={{ backgroundColor: entry.avatarBg, color: entry.avatarClr }}
      >
        {entry.initials}
      </div>
      <p className="flex-1 min-w-0 text-[12px] font-medium text-[#1E293B] truncate">
        {entry.name}{' '}
        <span className="font-normal text-[#64748B]">· {entry.sub}</span>
      </p>
      <TimeIndicator scheduledAt={entry.scheduledAt} />
      {showType && entry.type === 'phone' && (
        <Phone className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" aria-hidden="true" />
      )}
      {showType && entry.type === 'video' && (
        <Video className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" aria-hidden="true" />
      )}
      <button
        type="button"
        onClick={e => e.stopPropagation()}
        className="p-1 rounded hover:bg-slate-100 shrink-0"
        aria-label={`More options for ${entry.name}`}
      >
        <MoreHorizontal className="w-3.5 h-3.5 text-[#94A3B8]" />
      </button>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface CallsMeetingsCardProps {
  onAddScheduleEvent:     (ev: PanelEvent) => void
  candidates:             Candidate[]
  onNavigateToCandidates: (ids: string[]) => void
}

export function CallsMeetingsCard({ onAddScheduleEvent, candidates, onNavigateToCandidates }: CallsMeetingsCardProps) {
  const [selected,      setSelected]      = useState<Set<string>>(() => new Set())
  const [notFoundMsg,   setNotFoundMsg]   = useState(false)
  const [cardHeight,   setCardHeight]   = useState(400)
  const [addSection,   setAddSection]   = useState<'calls' | 'meetings' | null>(null)
  const [extraEntries, setExtraEntries] = useState<Record<Section, PersonEntry[]>>(() => ({
    'calls-clients':       [],
    'calls-candidates':    [],
    'meetings-clients':    [],
    'meetings-candidates': [],
  }))
  const [callsFilter,    setCallsFilter]    = useState<FilterState>(DEFAULT_FILTER)
  const [meetingsFilter, setMeetingsFilter] = useState<FilterState>(DEFAULT_FILTER)

  const now = useMemo(() => new Date(), [])

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function viewProfiles() {
    const allEntries = [
      ...extraEntries['calls-clients'],
      ...extraEntries['calls-candidates'],
      ...extraEntries['meetings-clients'],
      ...extraEntries['meetings-candidates'],
    ]
    const matchedIds = allEntries
      .filter(e => selected.has(e.id) && e.candidateId)
      .map(e => e.candidateId!)
    setSelected(new Set())
    if (matchedIds.length > 0) {
      onNavigateToCandidates(matchedIds)
    } else {
      setNotFoundMsg(true)
      setTimeout(() => setNotFoundMsg(false), 2000)
    }
  }

  function onResizeStart(e: React.MouseEvent) {
    e.preventDefault()
    const el = (e.currentTarget as HTMLElement).closest('section') as HTMLElement | null
    function onMouseMove(ev: MouseEvent) {
      if (!el) return
      setCardHeight(Math.max(280, Math.min(700, ev.clientY - el.getBoundingClientRect().top)))
    }
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup',   onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup',   onMouseUp)
  }

  function handleSave(data: SaveData) {
    if (!addSection) return
    const section: Section = addSection === 'calls'
      ? (data.personType === 'client' ? 'calls-clients' : 'calls-candidates')
      : (data.personType === 'client' ? 'meetings-clients' : 'meetings-candidates')
    const entry: PersonEntry = {
      id:        data.person.id + '-' + Date.now(),
      initials:  data.person.initials,
      avatarBg:  data.person.avatarBg,
      avatarClr: data.person.avatarClr,
      name:      data.person.name,
      sub:       data.person.role,
      type:      addSection === 'calls' ? 'phone' : 'video',
    }
    setExtraEntries(prev => ({ ...prev, [section]: [...prev[section], entry] }))

    const dateParts = data.date.split('-').map(Number)
    const eventDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
    const h = parseInt(data.time.split(':')[0], 10)
    const panelEv: PanelEvent = {
      id:        'evt-' + Date.now(),
      date:      eventDate,
      time:      fmt12h(data.time),
      hour:      h,
      type:      addSection === 'calls' ? 'phone' : 'video',
      name:      data.person.name,
      initials:  data.person.initials,
      avatarBg:  data.person.avatarBg,
      avatarClr: data.person.avatarClr,
      company:      '',
      platform:     addSection === 'calls' ? 'By Phone' : 'Google Meet',
      phone:        data.phone,
      meetingLink:  data.meetingLink,
      note:         data.notes || undefined,
    }
    onAddScheduleEvent(panelEv)
    setAddSection(null)
  }

  // Build display rows
  const allCallsClients    = [...extraEntries['calls-clients']]
  const allMeetingsClients = [...extraEntries['meetings-clients']]

  const allCallsCandRows: GroupRow[] = [
    ...extraEntries['calls-candidates'].map(e => ({ kind: 'person' as const, entry: e })),
  ]
  const allMeetingsCandRows: GroupRow[] = [
    ...extraEntries['meetings-candidates'].map(e => ({ kind: 'person' as const, entry: e })),
  ]

  // Apply filters
  const filteredCallsClients    = applyClientFilter(allCallsClients,    callsFilter,    now)
  const filteredMeetingsClients = applyClientFilter(allMeetingsClients, meetingsFilter, now)
  const filteredCallsCands      = applyGroupFilter(allCallsCandRows,    callsFilter,    now)
  const filteredMeetingsCands   = applyGroupFilter(allMeetingsCandRows, meetingsFilter, now)

  const callsShowClients    = callsFilter.type    !== 'candidates'
  const callsShowCandidates = callsFilter.type    !== 'clients'
  const meetsShowClients    = meetingsFilter.type !== 'candidates'
  const meetsShowCandidates = meetingsFilter.type !== 'clients'

  const callsCandCount    = filteredCallsCands.filter(r => r.kind === 'person').length
  const meetingsCandCount = filteredMeetingsCands.filter(r => r.kind === 'person').length

  const callsTotalCount    = (callsShowClients ? filteredCallsClients.length : 0) + (callsShowCandidates ? callsCandCount : 0)
  const meetingsTotalCount = (meetsShowClients ? filteredMeetingsClients.length : 0) + (meetsShowCandidates ? meetingsCandCount : 0)

  const modalContext: OutreachContext = addSection === 'calls' ? 'call' : 'meeting'

  return (
    <>
      <section
        className="bg-white border-subtle rounded-[10px] shadow-sm flex flex-col"
        aria-labelledby="outreach-heading"
        style={{ height: cardHeight }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
          <h2 id="outreach-heading" className="text-[15px] font-bold text-text-primary">Outreach</h2>
          <div className="flex items-center gap-2">
            <button type="button" className="text-[11px] font-medium text-[#64748B] border-subtle px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors">
              Export
            </button>
            <button type="button" className="text-[11px] font-medium text-[#64748B] border-subtle px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors">
              Email
            </button>
            <button
              type="button"
              onClick={viewProfiles}
              disabled={selected.size === 0}
              className="text-[11px] font-medium bg-[#2563EB] text-white px-3 py-1.5 rounded-md disabled:opacity-50 transition-opacity whitespace-nowrap"
            >
              {selected.size > 0 ? `View Profiles (${selected.size})` : 'View Profiles'}
            </button>
          </div>
        </div>

        {notFoundMsg && (
          <div className="px-4 py-1.5 shrink-0">
            <p className="text-[12px] text-[#94A3B8]">Some contacts not found in candidates list</p>
          </div>
        )}

        {/* Two-column body */}
        <div className="flex flex-1 min-h-0 divide-x divide-[#E2E8F0]">

            {/* CALLS column */}
            <div className="flex-1 flex flex-col min-h-0">
              <ColHeader
                text="Calls"
                count={callsTotalCount}
                onAdd={() => setAddSection('calls')}
                appliedFilter={callsFilter}
                onApplyFilter={setCallsFilter}
              />
              <div className="flex-1 overflow-y-auto">
                {callsShowClients && (
                  <>
                    <SubLabel text="Clients" count={filteredCallsClients.length} />
                    {filteredCallsClients.map(c => (
                      <PersonRow key={c.id} entry={c} selected={selected} onToggle={toggle} showType />
                    ))}
                  </>
                )}
                {callsShowCandidates && (
                  <>
                    <SubLabel text="Candidates" count={callsCandCount} />
                    {filteredCallsCands.map((row, i) =>
                      row.kind === 'company'
                        ? <CompanyLabel key={i} label={row.label} />
                        : <PersonRow key={row.entry.id} entry={row.entry} selected={selected} onToggle={toggle} showType />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* MEETINGS column */}
            <div className="flex-1 flex flex-col min-h-0">
              <ColHeader
                text="Meetings"
                count={meetingsTotalCount}
                onAdd={() => setAddSection('meetings')}
                appliedFilter={meetingsFilter}
                onApplyFilter={setMeetingsFilter}
              />
              <div className="flex-1 overflow-y-auto">
                {meetsShowClients && (
                  <>
                    <SubLabel text="Clients" count={filteredMeetingsClients.length} />
                    {filteredMeetingsClients.map(c => (
                      <PersonRow key={c.id} entry={c} selected={selected} onToggle={toggle} showType={false} />
                    ))}
                  </>
                )}
                {meetsShowCandidates && (
                  <>
                    <SubLabel text="Candidates" count={meetingsCandCount} />
                    {filteredMeetingsCands.map((row, i) =>
                      row.kind === 'company'
                        ? <CompanyLabel key={i} label={row.label} />
                        : <PersonRow key={row.entry.id} entry={row.entry} selected={selected} onToggle={toggle} showType={false} />
                    )}
                  </>
                )}
              </div>
            </div>

          </div>

        {/* Resize handle */}
        <div
          onMouseDown={onResizeStart}
          className="flex items-center justify-center h-2 cursor-row-resize shrink-0 hover:bg-slate-50 transition-colors"
          aria-hidden="true"
        >
          <div className="w-8 h-[3px] bg-[#CBD5E1] rounded-[2px]" />
        </div>
      </section>

      {addSection !== null && (
        <AddOutreachModal
          context={modalContext}
          onClose={() => setAddSection(null)}
          onSave={handleSave}
          candidates={candidates}
        />
      )}
    </>
  )
}
