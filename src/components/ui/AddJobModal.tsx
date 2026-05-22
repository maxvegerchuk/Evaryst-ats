import { useState } from 'react'
import { X } from 'lucide-react'
import type { Job, JobType, JobStatus, SalaryType } from '../../types/job'
import type { Company } from '../../types/company'
import { CityAutocomplete } from './CityAutocomplete'

interface Recruiter {
  id:     string
  email:  string
  name?:  string
  role:   string
}

interface AddJobModalProps {
  isOpen:            boolean
  onClose:           () => void
  onSave:            (job: Job) => void
  companies:         Company[]
  recruiters:        Recruiter[]
  defaultCompanyId?: string
}

const LBL = 'block text-[12px] font-medium text-[#475569] mb-1'
const INP = 'w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white placeholder:text-[#94A3B8] focus:border-[#2563EB] transition-colors'
const INP_ST = { border: '0.5px solid #E2E8F0', padding: '8px 12px' }

function PillGroup<T extends string>({
  options, value, onChange,
}: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(o => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`px-3 py-1.5 text-[12px] rounded-full border transition-colors ${
            value === o
              ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
              : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]'
          }`}>
          {o}
        </button>
      ))}
    </div>
  )
}

const DEFAULT_ID = 'JOB-' + Date.now().toString().slice(-6)
const JOB_TYPES: JobType[]      = ['Full Time', 'Part Time', 'Contract', 'Contract to Hire']
const JOB_STATUSES: JobStatus[] = ['Open', 'On Hold', 'Closed']

export function AddJobModal({ isOpen, onClose, onSave, companies, recruiters, defaultCompanyId }: AddJobModalProps) {
  const [title,       setTitle]       = useState('')
  const [companyId,   setCompanyId]   = useState(defaultCompanyId ?? '')
  const [jobType,     setJobType]     = useState<JobType>('Full Time')
  const [salaryMin,   setSalaryMin]   = useState('')
  const [salaryMax,   setSalaryMax]   = useState('')
  const [salaryType,  setSalaryType]  = useState<SalaryType>('year')
  const [jobCity,     setJobCity]     = useState('')
  const [jobState,    setJobState]    = useState('')
  const [recruiterId, setRecruiterId] = useState('')
  const [status,      setStatus]      = useState<JobStatus>('Open')
  const [description, setDescription] = useState('')
  const [clientReq,   setClientReq]   = useState('')
  const [internalId]                  = useState(DEFAULT_ID)

  if (!isOpen) return null

  const selectedCompany = companies.find(c => c.id === companyId)
  const canSave = title.trim() && companyId

  function handleCompanySelect(id: string) {
    setCompanyId(id)
    const company = companies.find(c => c.id === id)
    if (company) {
      setJobCity(company.city || '')
      setJobState(company.state || '')
    }
  }

  function reset() {
    setTitle(''); setCompanyId(defaultCompanyId ?? ''); setJobType('Full Time')
    setSalaryMin(''); setSalaryMax(''); setSalaryType('year')
    setJobCity(''); setJobState(''); setRecruiterId(''); setStatus('Open')
    setDescription(''); setClientReq('')
  }

  function handleClose() { onClose(); reset() }

  function handleSave() {
    if (!canSave) return
    const selectedRecruiter = recruiters.find(r => r.id === recruiterId)
    const location = [jobCity.trim(), jobState.trim()].filter(Boolean).join(', ')
    const job: Job = {
      id:                    crypto.randomUUID(),
      title:                 title.trim(),
      companyId,
      companyName:           selectedCompany?.name ?? '',
      jobType,
      salaryMin:             salaryMin.trim(),
      salaryMax:             salaryMax.trim(),
      salaryType,
      location,
      status,
      assignedRecruiterId:    recruiterId,
      assignedRecruiterEmail: selectedRecruiter?.email ?? '',
      assignedRecruiterName:  selectedRecruiter?.name || selectedRecruiter?.email || '',
      recruiterIds:           recruiterId ? [recruiterId] : [],
      recruiterEmails:        selectedRecruiter?.email ? [selectedRecruiter.email] : [],
      description:           description.trim(),
      dateAdded:             new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      candidates:            0,
      internalId,
      clientReqNumber:       clientReq.trim(),
    }
    console.log('Saving job:', {
      assigned_recruiter_email: job.assignedRecruiterEmail,
      assigned_recruiter_id:   job.assignedRecruiterId,
    })
    onSave(job)
    handleClose()
  }

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-job-heading"
        className="bg-white rounded-[10px] shadow-lg w-[520px] max-h-[85vh] overflow-hidden flex flex-col"
        style={{ border: '0.5px solid #E2E8F0' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
          <h2 id="add-job-heading" className="text-[15px] font-semibold text-[#1E293B]">Add job</h2>
          <button type="button" onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors" aria-label="Close">
            <X className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-3 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}>

          <div>
            <label className={LBL}>Job title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. .Net Developer, UX Designer"
              className={INP} style={INP_ST} />
          </div>

          {!defaultCompanyId && (
            <div>
              <label className={LBL}>Company *</label>
              {companies.length === 0 ? (
                <p className="text-[12px] text-[#94A3B8] py-2">No companies yet. Add a company first.</p>
              ) : (
                <select value={companyId} onChange={e => handleCompanySelect(e.target.value)}
                  className="w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white cursor-pointer"
                  style={INP_ST}>
                  <option value="">Select company</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>
          )}

          <div>
            <label className={LBL}>Job type</label>
            <PillGroup options={JOB_TYPES} value={jobType} onChange={setJobType} />
          </div>

          <div>
            <label className={LBL}>Salary range</label>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#64748B]">$</span>
              <input value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="50,000"
                className={INP} style={{ ...INP_ST, width: 112 }} />
              <span className="text-[12px] text-[#94A3B8]">–</span>
              <span className="text-[12px] text-[#64748B]">$</span>
              <input value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="75,000"
                className={INP} style={{ ...INP_ST, width: 112 }} />
              <div className="flex gap-1 ml-1">
                {(['year', 'hour'] as SalaryType[]).map(t => (
                  <button key={t} type="button" onClick={() => setSalaryType(t)}
                    className={`px-2.5 py-1.5 text-[11px] rounded-full border transition-colors ${
                      salaryType === t ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]' : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className={LBL}>Location</label>
            <CityAutocomplete
              cityValue={jobCity}
              stateValue={jobState}
              onCityChange={setJobCity}
              onStateChange={setJobState}
              cityPlaceholder="Dallas"
            />
          </div>

          <div>
            <label className={LBL}>Assign recruiter</label>
            {recruiters.length === 0 ? (
              <p className="text-[12px] text-[#94A3B8] py-2">No recruiters in team yet.</p>
            ) : (
              <select value={recruiterId} onChange={e => setRecruiterId(e.target.value)}
                className="w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white cursor-pointer"
                style={INP_ST}>
                <option value="">Unassigned</option>
                {recruiters.map(r => <option key={r.id} value={r.id}>{r.email}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className={LBL}>Status</label>
            <PillGroup options={JOB_STATUSES} value={status} onChange={setStatus} />
          </div>

          <div>
            <label className={LBL}>Job description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe the role, requirements..."
              rows={4}
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white placeholder:text-[#94A3B8] resize-none"
              style={{ border: '0.5px solid #E2E8F0', padding: '8px 12px', minHeight: 100 }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LBL}>Internal Job ID</label>
              <input value={internalId} readOnly
                className="w-full text-[12px] text-[#94A3B8] rounded-[7px] focus:outline-none"
                style={{ ...INP_ST, background: '#F8FAFC' }} />
            </div>
            <div>
              <label className={LBL}>Client Req Number</label>
              <input value={clientReq} onChange={e => setClientReq(e.target.value)} placeholder="e.g. 0122231"
                className={INP} style={INP_ST} />
            </div>
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
            Add job
          </button>
        </div>
      </div>
    </div>
  )
}
