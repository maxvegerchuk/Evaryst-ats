import { useState } from 'react'
import { X } from 'lucide-react'
import type { Company, CompanyStatus } from '../../types/company'
import type { User } from '../../types/auth'
import { CityAutocomplete } from './CityAutocomplete'
import { formatPhone } from '../../utils/formatPhone'

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

const LBL    = 'block text-[12px] font-medium text-[#475569] mb-1'
const INP    = 'w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white placeholder:text-[#94A3B8] focus:border-[#2563EB] transition-colors'
const INP_ST = { border: '0.5px solid #E2E8F0', padding: '8px 12px' }

// ── State combobox ─────────────────────────────────────────────────────────────

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
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-company-heading"
        className="bg-white rounded-[10px] shadow-lg w-[480px] max-h-[85vh] overflow-hidden flex flex-col"
        style={{ border: '0.5px solid #E2E8F0' }}
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
              <CityAutocomplete
                cityValue={city}
                stateValue={state}
                onCityChange={setCity}
                onStateChange={setState}
                cityPlaceholder="Dallas"
              />
              <input value={zip} onChange={e => setZip(e.target.value)} placeholder="75022" className={INP} style={{ ...INP_ST, width: 76 }} />
            </div>
          </div>

          <div>
            <label className={LBL}>Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="(555) 123-4567" className={INP} style={INP_ST} />
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
