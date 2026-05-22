import { useState } from 'react'
import { X, Search } from 'lucide-react'
import { formatPhone } from '../../utils/formatPhone'
import type { Candidate } from '../../types/candidate'
import { getInitials, getAvatarColor } from '../../types/candidate'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ModalCandidate {
  id:        string
  name:      string
  role:      string
  initials:  string
  avatarBg:  string
  avatarClr: string
}

export interface SaveData {
  person:       ModalCandidate
  personType:   'client' | 'candidate'
  context:      OutreachContext
  date:         string
  time:         string
  status:       string
  phone?:       string
  meetingLink?: string
  notes:        string
}

export type OutreachContext = 'call' | 'meeting'

const STATUS_OPTIONS = ['New', 'Contacted', 'Interested', 'Not Interested', 'Follow Up', 'Negotiation']

function getDefaultDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function getDefaultTime(): string {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return d.toTimeString().slice(0, 5)
}

function candidateToModal(c: Candidate): ModalCandidate {
  const { bg, clr } = getAvatarColor(c.id)
  return {
    id:        c.id,
    name:      c.name,
    role:      c.specialty,
    initials:  getInitials(c.name),
    avatarBg:  bg,
    avatarClr: clr,
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AddOutreachModalProps {
  context?:    OutreachContext
  onClose:     () => void
  onSave:      (data: SaveData) => void
  candidates?: Candidate[]
}

export function AddOutreachModal({ context, onClose, onSave, candidates = [] }: AddOutreachModalProps) {
  const [search,       setSearch]       = useState('')
  const [selected,     setSelected]     = useState<ModalCandidate | null>(null)
  const [showDrop,     setShowDrop]     = useState(false)
  const [personType,   setPersonType]   = useState<'client' | 'candidate'>('candidate')
  const [innerContext, setInnerContext] = useState<OutreachContext>('call')
  const [status,       setStatus]       = useState('')
  const [date,         setDate]         = useState(getDefaultDate)
  const [time,         setTime]         = useState(getDefaultTime)
  const [phone,        setPhone]        = useState('')
  const [meetingLink,  setMeetingLink]  = useState('')
  const [notes,        setNotes]        = useState('')

  const effectiveContext = context ?? innerContext

  const modalCandidates = candidates.map(candidateToModal)

  const filtered = search.length > 0
    ? modalCandidates.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
    : []

  function handleSave() {
    if (!selected) return
    onSave({
      person: selected, personType, context: effectiveContext,
      date, time, status,
      phone:       effectiveContext === 'call'    ? phone       || undefined : undefined,
      meetingLink: effectiveContext === 'meeting' ? meetingLink || undefined : undefined,
      notes,
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
      style={{ backdropFilter: 'blur(2px)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-outreach-heading"
        className="bg-white rounded-[12px] shadow-lg w-[420px] p-6 flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 id="add-outreach-heading" className="text-[16px] font-semibold text-[#1E293B]">
            {context === 'call' ? 'Schedule Call' : context === 'meeting' ? 'Schedule Meeting' : 'Add Event'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>

        {/* Call / Meeting toggle — only shown when context is not fixed externally */}
        {context === undefined && (
          <div className="flex gap-2">
            {(['call', 'meeting'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setInnerContext(t)}
                className={`flex-1 py-2 text-[13px] font-medium rounded-[7px] border transition-colors ${
                  innerContext === t
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                    : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
                }`}
              >
                {t === 'call' ? 'Call' : 'Meeting'}
              </button>
            ))}
          </div>
        )}

        {/* Person search */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[#1E293B]">Person</label>
          <div className="relative">
            {selected ? (
              <div className="flex items-center gap-2 rounded-[7px]" style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{ backgroundColor: selected.avatarBg, color: selected.avatarClr }}
                >
                  {selected.initials}
                </div>
                <span className="flex-1 text-[13px] text-[#1E293B]">{selected.name}</span>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setSearch('') }}
                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-slate-100"
                  aria-label="Clear selection"
                >
                  <X className="w-3 h-3 text-[#94A3B8]" />
                </button>
              </div>
            ) : (
              <>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setShowDrop(true) }}
                  onFocus={() => setShowDrop(true)}
                  onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                  placeholder="Type a name..."
                  className="w-full pl-8 pr-3 text-[12px] text-[#1E293B] rounded-[7px] outline-none bg-white"
                  style={{ border: '0.5px solid #E2E8F0', paddingTop: 6, paddingBottom: 6 }}
                />
                {showDrop && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border-subtle rounded-[7px] shadow-md z-10 overflow-hidden">
                    {candidates.length === 0 ? (
                      <p className="text-[12px] text-[#94A3B8] px-3 py-3">No candidates in system yet. Add candidates first.</p>
                    ) : filtered.length > 0 ? (
                      filtered.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onMouseDown={() => { setSelected(c); setSearch(''); setShowDrop(false) }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-slate-50 text-left transition-colors"
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{ backgroundColor: c.avatarBg, color: c.avatarClr }}
                          >
                            {c.initials}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-[#1E293B]">{c.name}</p>
                            <p className="text-[11px] text-[#64748B]">{c.role}</p>
                          </div>
                        </button>
                      ))
                    ) : search.length > 0 ? (
                      <p className="text-[12px] text-[#94A3B8] px-3 py-3">No match found.</p>
                    ) : null}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Person type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[#1E293B]">Type</label>
          <div className="flex gap-2">
            {(['client', 'candidate'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setPersonType(t)}
                className={`flex-1 py-2 text-[13px] font-medium rounded-[7px] border transition-colors capitalize ${
                  personType === t
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                    : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
                }`}
              >
                {t === 'client' ? 'Client' : 'Candidate'}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[#1E293B]">
            Status <span className="text-[#94A3B8] font-normal">(optional)</span>
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full text-[12px] text-[#1E293B] rounded-[7px] outline-none bg-white"
            style={{ border: '0.5px solid #E2E8F0', padding: '6px 28px 6px 10px' }}
          >
            <option value="">Select status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Date + Time */}
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#1E293B]">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] outline-none bg-white"
              style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }} />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#1E293B]">Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] outline-none bg-white"
              style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }} />
          </div>
        </div>

        {/* Phone / Meeting link */}
        {effectiveContext === 'call' ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#1E293B]">
              Phone <span className="text-[#94A3B8] font-normal">(optional)</span>
            </label>
            <input type="tel" value={phone} onChange={e => setPhone(formatPhone(e.target.value))}
              placeholder="(555) 000-0000"
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] outline-none bg-white"
              style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }} />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#1E293B]">
              Meeting link <span className="text-[#94A3B8] font-normal">(optional)</span>
            </label>
            <input type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)}
              placeholder="Paste Google Meet link..."
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] outline-none bg-white"
              style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }} />
          </div>
        )}

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[#1E293B]">
            Notes <span className="text-[#94A3B8] font-normal">(optional)</span>
          </label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Add context or agenda..."
            className="w-full text-[12px] text-[#1E293B] placeholder:text-[#94A3B8] rounded-[7px] outline-none bg-white resize-none"
            style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }} />
        </div>

        {/* Footer */}
        <div className="flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2 text-[13px] font-medium text-[#64748B] border-subtle rounded-[7px] hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={!selected}
            className="flex-1 py-2 text-[13px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-blue-700 transition-colors disabled:opacity-50">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
