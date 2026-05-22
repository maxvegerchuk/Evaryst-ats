import { useState, useRef, type ChangeEvent } from 'react'
import { X, Upload, FileText } from 'lucide-react'
import type { Candidate, CandidateStage } from '../../types/candidate'
import type { User } from '../../types/auth'
import { CityAutocomplete } from './CityAutocomplete'
import { formatPhone } from '../../utils/formatPhone'

interface AddCandidateModalProps {
  isOpen:      boolean
  onClose:     () => void
  onSave:      (candidate: Candidate) => void
  currentUser: User
}

const STAGES: CandidateStage[] = ['New', 'Phone Screen', 'Interview', 'References', 'Submitted', 'Placed']

const INPUT_CLS = 'w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white placeholder:text-[#94A3B8] focus:border-[#2563EB] transition-colors'
const INPUT_ST  = { border: '0.5px solid #E2E8F0', padding: '8px 12px' }

export function AddCandidateModal({ isOpen, onClose, onSave, currentUser }: AddCandidateModalProps) {
  const [name,       setName]       = useState('')
  const [email,      setEmail]      = useState('')
  const [phone,      setPhone]      = useState('')
  const [specialty,  setSpecialty]  = useState('')
  const [city,       setCity]       = useState('')
  const [state,      setState]      = useState('')
  const [stage,      setStage]      = useState<CandidateStage>('New')
  const [source,     setSource]     = useState('Direct')
  const [notes,      setNotes]      = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const canSave = name.trim() && email.trim() && phone.trim() && specialty.trim()

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setResumeFile(file)
  }

  function handleSave() {
    if (!canSave) return
    const location = [city.trim(), state.trim()].filter(Boolean).join(', ')
    const newCandidate: Candidate = {
      id:             crypto.randomUUID(),
      name:           name.trim(),
      email:          email.trim(),
      phone:          phone.trim(),
      specialty:      specialty.trim(),
      location,
      stage,
      source,
      rating:         '',
      addedDate:      new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      notes:          notes.trim(),
      resumeFileName: resumeFile?.name,
      ownerId:        currentUser.id,
      ownerEmail:     currentUser.email,
      ownerName:      currentUser.name,
      attachedJobIds: [],
    }
    onSave(newCandidate)
    onClose()
    resetFields()
  }

  function resetFields() {
    setName(''); setEmail(''); setPhone(''); setSpecialty('')
    setCity(''); setState(''); setStage('New'); setSource('Direct'); setNotes(''); setResumeFile(null)
  }

  function handleClose() { onClose(); resetFields() }

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-candidate-heading"
        className="bg-white rounded-[10px] shadow-lg w-[480px] max-h-[85vh] overflow-hidden flex flex-col"
        style={{ border: '0.5px solid #E2E8F0' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '0.5px solid #E2E8F0' }}
        >
          <h2 id="add-candidate-heading" className="text-[15px] font-semibold text-[#1E293B]">Add candidate</h2>
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-3 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#475569]">Full name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. John Smith" className={INPUT_CLS} style={INPUT_ST} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#475569]">Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="john@email.com" className={INPUT_CLS} style={INPUT_ST} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#475569]">Phone *</label>
            <input type="tel" value={phone} onChange={e => setPhone(formatPhone(e.target.value))}
              placeholder="(555) 123-4567" className={INPUT_CLS} style={INPUT_ST} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#475569]">Specialty / Job title *</label>
            <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)}
              placeholder="e.g. Software Engineer, UX Designer" className={INPUT_CLS} style={INPUT_ST} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#475569]">Location</label>
            <CityAutocomplete
              cityValue={city}
              stateValue={state}
              onCityChange={setCity}
              onStateChange={setState}
              cityPlaceholder="City"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#475569]">Pipeline stage</label>
            <select value={stage} onChange={e => setStage(e.target.value as CandidateStage)}
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white focus:border-[#2563EB] transition-colors"
              style={{ border: '0.5px solid #E2E8F0', padding: '8px 12px' }}>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#475569]">Source</label>
            <select value={source} onChange={e => setSource(e.target.value)}
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white focus:border-[#2563EB] transition-colors"
              style={{ border: '0.5px solid #E2E8F0', padding: '8px 12px' }}>
              {['Direct', 'Referral', 'LinkedIn', 'Job boards', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#475569]">Resume</label>
            {resumeFile ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#EFF6FF] rounded-full w-fit">
                <FileText className="w-3 h-3 text-[#2563EB]" />
                <span className="text-[12px] text-[#2563EB] max-w-[280px] truncate">{resumeFile.name}</span>
                <button
                  type="button"
                  onClick={() => { setResumeFile(null); if (fileRef.current) fileRef.current.value = '' }}
                  className="text-[#2563EB] hover:text-blue-800"
                  aria-label="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border border-dashed border-[#E2E8F0] rounded-[8px] p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F8FAFC] transition-colors"
              >
                <Upload className="w-6 h-6 text-[#94A3B8] mb-2" />
                <p className="text-[12px] text-[#64748B] mb-1">Drop resume here or click to upload</p>
                <p className="text-[10px] text-[#94A3B8]">PDF, DOC, DOCX up to 10MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#475569]">Quick notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any initial notes about this candidate..."
              rows={3}
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white placeholder:text-[#94A3B8] resize-none focus:border-[#2563EB] transition-colors"
              style={{ border: '0.5px solid #E2E8F0', padding: '8px 12px', minHeight: 50 }}
            />
          </div>

        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-6 py-4 flex-shrink-0"
          style={{ borderTop: '0.5px solid #E2E8F0' }}
        >
          <button type="button" onClick={handleClose}
            className="px-4 py-2 text-[12px] font-medium text-[#475569] bg-white rounded-[7px] hover:bg-[#F8FAFC] transition-colors"
            style={{ border: '0.5px solid #E2E8F0' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={!canSave}
            className="px-4 py-2 text-[12px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Add candidate
          </button>
        </div>
      </div>
    </div>
  )
}
