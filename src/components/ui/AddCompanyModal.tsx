import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Company, CompanyStatus } from '../../types/company'
import type { User } from '../../types/auth'

interface AddCompanyModalProps {
  isOpen:      boolean
  onClose:     () => void
  onSave:      (company: Company) => void
  currentUser: User
}

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
  'Education', 'Logistics', 'Agriculture Tech', 'Aerospace', 'Data Analytics',
  'Renewable Energy', 'Medical Devices', 'Cloud Computing',
  'Information Technology', 'Other',
]

const US_STATES = [
  { abbr: 'AL', name: 'Alabama' },       { abbr: 'AK', name: 'Alaska' },
  { abbr: 'AZ', name: 'Arizona' },       { abbr: 'AR', name: 'Arkansas' },
  { abbr: 'CA', name: 'California' },    { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' },   { abbr: 'DE', name: 'Delaware' },
  { abbr: 'DC', name: 'Washington D.C.' },
  { abbr: 'FL', name: 'Florida' },       { abbr: 'GA', name: 'Georgia' },
  { abbr: 'HI', name: 'Hawaii' },        { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' },      { abbr: 'IN', name: 'Indiana' },
  { abbr: 'IA', name: 'Iowa' },          { abbr: 'KS', name: 'Kansas' },
  { abbr: 'KY', name: 'Kentucky' },      { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' },         { abbr: 'MD', name: 'Maryland' },
  { abbr: 'MA', name: 'Massachusetts' }, { abbr: 'MI', name: 'Michigan' },
  { abbr: 'MN', name: 'Minnesota' },     { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' },      { abbr: 'MT', name: 'Montana' },
  { abbr: 'NE', name: 'Nebraska' },      { abbr: 'NV', name: 'Nevada' },
  { abbr: 'NH', name: 'New Hampshire' }, { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' },    { abbr: 'NY', name: 'New York' },
  { abbr: 'NC', name: 'North Carolina' },{ abbr: 'ND', name: 'North Dakota' },
  { abbr: 'OH', name: 'Ohio' },          { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' },        { abbr: 'PA', name: 'Pennsylvania' },
  { abbr: 'RI', name: 'Rhode Island' },  { abbr: 'SC', name: 'South Carolina' },
  { abbr: 'SD', name: 'South Dakota' },  { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' },         { abbr: 'UT', name: 'Utah' },
  { abbr: 'VT', name: 'Vermont' },       { abbr: 'VA', name: 'Virginia' },
  { abbr: 'WA', name: 'Washington' },    { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' },     { abbr: 'WY', name: 'Wyoming' },
]

const LBL    = 'block text-[12px] font-medium text-[#475569] mb-1'
const INP    = 'w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white placeholder:text-[#94A3B8] focus:border-[#2563EB] transition-colors'
const INP_ST = { border: '0.5px solid #E2E8F0', padding: '8px 12px' }

// ── State combobox ─────────────────────────────────────────────────────────────

function StateSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState(value)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery(value)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, value])

  const q = query.trim().toLowerCase()
  const matches = q
    ? US_STATES.filter(s =>
        s.abbr.toLowerCase().startsWith(q) ||
        s.name.toLowerCase().startsWith(q) ||
        s.name.toLowerCase().includes(q)
      )
    : US_STATES

  function select(abbr: string) {
    onChange(abbr)
    setQuery(abbr)
    setOpen(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    onChange(v)
    setOpen(true)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && matches.length === 1) {
      select(matches[0].abbr)
    }
    if (e.key === 'Escape') {
      setOpen(false)
      setQuery(value)
    }
  }

  return (
    <div ref={wrapRef} className="relative" style={{ width: 68 }}>
      <input
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="TX"
        className={INP}
        style={{ ...INP_ST, width: 68 }}
        autoComplete="off"
      />
      {open && (
        <div
          className="absolute top-full left-0 mt-1 bg-white rounded-[8px] shadow-lg z-[60] w-[190px] max-h-[220px] overflow-y-auto py-1"
          style={{ border: '0.5px solid #E2E8F0', scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}
        >
          {matches.length === 0 ? (
            <p className="px-3 py-2 text-[12px] text-[#94A3B8]">No states found</p>
          ) : (
            matches.map(s => (
              <button
                key={s.abbr}
                type="button"
                onMouseDown={e => { e.preventDefault(); select(s.abbr) }}
                className={`flex items-center gap-2 w-full px-3 py-[6px] text-left hover:bg-[#F8FAFC] transition-colors ${
                  value === s.abbr ? 'bg-[#EFF6FF]' : ''
                }`}
              >
                <span className={`text-[12px] font-semibold w-6 flex-shrink-0 ${value === s.abbr ? 'text-[#2563EB]' : 'text-[#1E293B]'}`}>
                  {s.abbr}
                </span>
                <span className="text-[12px] text-[#64748B] truncate">{s.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Pill group ─────────────────────────────────────────────────────────────────

function PillGroup<T extends string>({
  options, value, onChange,
}: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(o => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-3 py-1.5 text-[12px] rounded-full border transition-colors ${
            value === o
              ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
              : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────────

export function AddCompanyModal({ isOpen, onClose, onSave, currentUser }: AddCompanyModalProps) {
  const [name,     setName]     = useState('')
  const [industry, setIndustry] = useState('')
  const [city,     setCity]     = useState('')
  const [state,    setState]    = useState('')
  const [zip,      setZip]      = useState('')
  const [phone,    setPhone]    = useState('')
  const [website,  setWebsite]  = useState('')
  const [status,   setStatus]   = useState<CompanyStatus>('Active')
  const [notes,    setNotes]    = useState('')

  if (!isOpen) return null

  const canSave = name.trim() && industry

  function reset() {
    setName(''); setIndustry(''); setCity(''); setState(''); setZip('')
    setPhone(''); setWebsite(''); setStatus('Active'); setNotes('')
  }

  function handleClose() { onClose(); reset() }

  function handleSave() {
    if (!canSave) return
    const location = [city.trim(), state.trim(), zip.trim()].filter(Boolean).join(', ')
    const company: Company = {
      id:         'comp-' + Date.now(),
      name:       name.trim(),
      industry,
      location:   location || '',
      city:       city.trim(),
      state:      state.trim(),
      zip:        zip.trim(),
      phone:      phone.trim(),
      website:    website.trim(),
      status,
      activeJobs: 0,
      dateAdded:  new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      notes:      notes.trim(),
      ownerId:    currentUser.id,
      ownerName:  currentUser.name,
    }
    onSave(company)
    handleClose()
  }

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" onClick={handleClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-company-heading"
        className="bg-white rounded-[10px] shadow-lg w-[480px] max-h-[85vh] overflow-hidden flex flex-col"
        style={{ border: '0.5px solid #E2E8F0' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
          <h2 id="add-company-heading" className="text-[15px] font-semibold text-[#1E293B]">Add company</h2>
          <button type="button" onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors" aria-label="Close">
            <X className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-3 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}>

          <div>
            <label className={LBL}>Company name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Coca-Cola, ABC Company" className={INP} style={INP_ST} />
          </div>

          <div>
            <label className={LBL}>Industry *</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)}
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white cursor-pointer"
              style={INP_ST}>
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className={LBL}>Location</label>
            <div className="flex gap-2 items-start">
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Dallas" className={`${INP} flex-1`} style={INP_ST} />
              <StateSelect value={state} onChange={setState} />
              <input value={zip} onChange={e => setZip(e.target.value)} placeholder="75022" className={INP} style={{ ...INP_ST, width: 76 }} />
            </div>
          </div>

          <div>
            <label className={LBL}>Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" className={INP} style={INP_ST} />
          </div>

          <div>
            <label className={LBL}>Website</label>
            <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="company.com" className={INP} style={INP_ST} />
          </div>

          <div>
            <label className={LBL}>Status</label>
            <PillGroup<CompanyStatus> options={['Active', 'Paused', 'Prospect']} value={status} onChange={setStatus} />
          </div>

          <div>
            <label className={LBL}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Notes about this company..."
              rows={3}
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white placeholder:text-[#94A3B8] resize-none"
              style={{ border: '0.5px solid #E2E8F0', padding: '8px 12px', minHeight: 60 }}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 flex-shrink-0" style={{ borderTop: '0.5px solid #E2E8F0' }}>
          <button type="button" onClick={handleClose}
            className="px-4 py-2 text-[12px] font-medium text-[#475569] bg-white rounded-[7px] hover:bg-[#F8FAFC] transition-colors"
            style={{ border: '0.5px solid #E2E8F0' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={!canSave}
            className="px-4 py-2 text-[12px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Add company
          </button>
        </div>
      </div>
    </div>
  )
}
