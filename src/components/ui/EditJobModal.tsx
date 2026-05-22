import { useState } from 'react'
import { X } from 'lucide-react'
import type { Job, JobType, JobStatus, SalaryType } from '../../types/job'

interface Recruiter { id: string; email: string; name?: string; role: string }

interface EditJobModalProps {
  isOpen:     boolean
  onClose:    () => void
  onSave:     (job: Job) => void
  job:        Job
  recruiters: Recruiter[]
}

const LBL    = 'block text-[12px] font-medium text-[#475569] mb-1'
const INP    = 'w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white placeholder:text-[#94A3B8] focus:border-[#2563EB] transition-colors'
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

const JOB_TYPES:   readonly JobType[]   = ['Full Time', 'Part Time', 'Contract', 'Contract to Hire']
const JOB_STATUSES: readonly JobStatus[] = ['Open', 'On Hold', 'Closed']

export function EditJobModal({ isOpen, onClose, onSave, job, recruiters }: EditJobModalProps) {
  const [title,       setTitle]       = useState(job.title)
  const [jobType,     setJobType]     = useState<JobType>(job.jobType)
  const [salaryMin,   setSalaryMin]   = useState(job.salaryMin)
  const [salaryMax,   setSalaryMax]   = useState(job.salaryMax)
  const [salaryType,  setSalaryType]  = useState<SalaryType>(job.salaryType)
  const [location,    setLocation]    = useState(job.location)
  const [recruiterId, setRecruiterId] = useState(job.assignedRecruiterId)
  const [status,      setStatus]      = useState<JobStatus>(job.status)
  const [description, setDescription] = useState(job.description)
  const [clientReq,   setClientReq]   = useState(job.clientReqNumber)

  if (!isOpen) return null

  const canSave = title.trim().length > 0

  function handleSave() {
    if (!canSave) return
    const selectedRecruiter = recruiters.find(r => r.id === recruiterId)
    onSave({
      ...job,
      title:                  title.trim(),
      jobType,
      salaryMin:              salaryMin.trim(),
      salaryMax:              salaryMax.trim(),
      salaryType,
      location:               location.trim(),
      status,
      assignedRecruiterId:    recruiterId,
      assignedRecruiterEmail: selectedRecruiter?.email || job.assignedRecruiterEmail || '',
      assignedRecruiterName:  selectedRecruiter?.name || selectedRecruiter?.email || job.assignedRecruiterName,
      description:            description.trim(),
      clientReqNumber:        clientReq.trim(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-job-heading"
        className="bg-white rounded-[10px] shadow-lg w-[520px] max-h-[85vh] overflow-hidden flex flex-col"
        style={{ border: '0.5px solid #E2E8F0' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
          <h2 id="edit-job-heading" className="text-[15px] font-semibold text-[#1E293B]">Edit job</h2>
          <button type="button" onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors" aria-label="Close">
            <X className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}>

          <div>
            <label className={LBL}>Job title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. .Net Developer, UX Designer"
              className={INP} style={INP_ST} />
          </div>

          <div>
            <label className={LBL}>Company</label>
            <input value={job.companyName} readOnly
              className="w-full text-[12px] text-[#94A3B8] rounded-[7px]"
              style={{ ...INP_ST, background: '#F8FAFC' }} />
          </div>

          <div>
            <label className={LBL}>Status</label>
            <PillGroup options={JOB_STATUSES} value={status} onChange={setStatus} />
          </div>

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
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Dallas, TX"
              className={INP} style={INP_ST} />
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
                {recruiters.map(r => <option key={r.id} value={r.id}>{r.name || r.email}</option>)}
              </select>
            )}
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
              <input value={job.internalId} readOnly
                className="w-full text-[12px] text-[#94A3B8] rounded-[7px]"
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
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-[12px] font-medium text-[#475569] bg-white rounded-[7px] hover:bg-[#F8FAFC] transition-colors"
            style={{ border: '0.5px solid #E2E8F0' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={!canSave}
            className="px-4 py-2 text-[12px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}
