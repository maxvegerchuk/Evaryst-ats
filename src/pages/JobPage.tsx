import { useState, useEffect } from 'react'
import {
  ChevronLeft, ChevronRight, MoreHorizontal,
  Mail, Download, X,
  FilePlus, FileText, Send, Users, UserPlus, Pencil,
} from 'lucide-react'
import type { Job, JobType, JobStatus, SalaryType } from '../types/job'
import type { Candidate } from '../types/candidate'
import { getAvatarColor } from '../types/candidate'
import { logActivity } from '../lib/activity'
import { EditPanel } from '../components/ui/EditPanel'
import { CityAutocomplete } from '../components/ui/CityAutocomplete'

interface Recruiter { id: string; email: string; name?: string; role: string; status: string }

// ── Constants ──────────────────────────────────────────────────────────────────

const ICON_BTN   = 'w-[30px] h-[30px] flex items-center justify-center border-subtle rounded-[7px] bg-white hover:bg-[#F8FAFC] transition-colors flex-shrink-0'
const INFO_LABEL = 'text-[10px] uppercase text-[#94A3B8] font-medium tracking-[0.05em] mb-2'

type JobTab = 'candidates' | 'recruiters' | 'details' | 'documents'

const JOB_TABS: { id: JobTab; label: string }[] = [
  { id: 'details',    label: 'Job Details' },
  { id: 'candidates', label: 'Candidates'  },
  { id: 'recruiters', label: 'Recruiters'  },
  { id: 'documents',  label: 'Documents'   },
]

// Shared job description text — referenced by CandidatePage Interview Form
export const JOB_DESC_POSTING = `We are looking for a skilled .NET Developer to join our growing engineering team at ABC Company. The ideal candidate has 3+ years of C# experience, strong knowledge of ASP.NET Core, and experience with SQL Server and RESTful APIs.

You will work closely with our product team to build and maintain enterprise-level applications. Remote-friendly with occasional on-site requirements in Dallas, TX.`

export const JOB_DESC_INTERNAL = `Role: Senior .NET Developer
Company: ABC Company
Location: Dallas, TX (Hybrid — 3 days on site)

Requirements:
- 5+ years .NET development experience
- Strong C# and ASP.NET Core knowledge
- SQL Server and Entity Framework
- RESTful API design and development
- Experience with Azure or AWS preferred

Responsibilities:
- Design and develop enterprise applications
- Collaborate with product and QA teams
- Code reviews and mentoring junior developers
- Participate in architecture discussions

Salary: $150,000 – $175,000 / year
Start date: ASAP`

// ── Data ───────────────────────────────────────────────────────────────────────


const DOCS: { name: string; type: string; date: string }[] = []

// ── Component ──────────────────────────────────────────────────────────────────

interface JobPageProps {
  setCurrentPage:    (page: string) => void
  initialTab?:       'candidates' | 'details' | 'documents'
  isManager?:        boolean
  job?:              Job | null
  recruiters?:       Recruiter[]
  onUpdateJob?:      (job: Job) => void
  candidates?:       Candidate[]
  onUpdateCandidate?: (id: string, updates: Partial<Candidate>) => void
}

const JOB_STATUSES: readonly JobStatus[] = ['Open', 'On Hold', 'Closed']
const WORK_TYPE_OPTIONS = ['Full-Time', 'Part-Time', 'Contract', 'Contract to Hire', 'Fulltime Employee']

function PillGroup<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(o => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`px-3 py-1.5 text-[11px] rounded-full border transition-colors ${value === o ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]' : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]'}`}>
          {o}
        </button>
      ))}
    </div>
  )
}

const LBL = 'block text-[11px] font-medium text-[#475569] mb-1'
const INP = 'w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white placeholder:text-[#94A3B8]'
const INP_ST = { border: '0.5px solid #E2E8F0', padding: '7px 10px' } as const
const SEC = 'text-[10px] uppercase text-[#94A3B8] font-medium tracking-[0.05em] mb-3'

export function JobPage({ setCurrentPage, initialTab, isManager, job, recruiters = [], onUpdateJob, candidates = [], onUpdateCandidate }: JobPageProps) {
  const [activeTab,      setActiveTab]      = useState<JobTab>(initialTab ?? 'details')
  const [showEditPanel,  setShowEditPanel]  = useState(false)
  const [isSaving,       setIsSaving]       = useState(false)

  // ── Edit panel state ──────────────────────────────────────────────────────────
  const [editTitle,          setEditTitle]          = useState('')
  const [editJobType,        setEditJobType]        = useState<JobType>('Full Time')
  const [editSalaryMin,      setEditSalaryMin]      = useState('')
  const [editSalaryMax,      setEditSalaryMax]      = useState('')
  const [editSalaryType,     setEditSalaryType]     = useState<SalaryType>('year')
  const [editStatus,         setEditStatus]         = useState<JobStatus>('Open')
  const [editInternalId,     setEditInternalId]     = useState('')
  const [editClientReq,      setEditClientReq]      = useState('')
  const [editCity,           setEditCity]           = useState('')
  const [editState,          setEditState]          = useState('')
  const [editZip,            setEditZip]            = useState('')
  const [editHiringMgr,      setEditHiringMgr]      = useState('')
  const [editTalentAcq,      setEditTalentAcq]      = useState('')
  const [editOther1,         setEditOther1]         = useState('')
  const [editOther2,         setEditOther2]         = useState('')
  const [editDaysOnSite,     setEditDaysOnSite]     = useState('')
  const [editTravelPct,      setEditTravelPct]      = useState('')
  const [editWorkTypes,      setEditWorkTypes]      = useState<string[]>([])
  const [editDescription,    setEditDescription]    = useState('')

  useEffect(() => {
    if (!showEditPanel || !job) return
    setEditTitle(job.title)
    setEditJobType(job.jobType)
    setEditSalaryMin(job.salaryMin)
    setEditSalaryMax(job.salaryMax)
    setEditSalaryType(job.salaryType)
    setEditStatus(job.status)
    setEditInternalId(job.internalId)
    setEditClientReq(job.clientReqNumber || '')
    setEditCity(job.city || '')
    setEditState(job.state || '')
    setEditZip(job.zip || '')
    setEditHiringMgr(job.hiringManager || '')
    setEditTalentAcq(job.talentAcquisition || '')
    setEditOther1(job.otherContact1 || '')
    setEditOther2(job.otherContact2 || '')
    setEditDaysOnSite(job.daysOnSite || '')
    setEditTravelPct(job.travelPct || '')
    setEditWorkTypes(job.workTypes || [])
    setEditDescription(job.description || '')
  }, [showEditPanel, job])

  async function handleSaveJob() {
    if (!job || !onUpdateJob) return
    setIsSaving(true)
    const location = [editCity.trim(), editState.trim()].filter(Boolean).join(', ')
    await onUpdateJob({
      ...job,
      title:            editTitle.trim(),
      jobType:          editJobType,
      salaryMin:        editSalaryMin.trim(),
      salaryMax:        editSalaryMax.trim(),
      salaryType:       editSalaryType,
      status:           editStatus,
      internalId:       editInternalId.trim(),
      clientReqNumber:  editClientReq.trim(),
      location:         location || job.location,
      city:             editCity.trim(),
      state:            editState.trim(),
      zip:              editZip.trim(),
      hiringManager:    editHiringMgr.trim(),
      talentAcquisition: editTalentAcq.trim(),
      otherContact1:    editOther1.trim(),
      otherContact2:    editOther2.trim(),
      daysOnSite:       editDaysOnSite,
      travelPct:        editTravelPct,
      workTypes:        editWorkTypes,
      description:      editDescription.trim(),
    })
    setIsSaving(false)
    setShowEditPanel(false)
  }

  // ── Candidates tab ────────────────────────────────────────────────────────────

  const CAND_STATUSES = ['New', 'Phone Screen', 'Interview', 'Submitted', 'Placed'] as const
  const CAND_RATINGS  = ['Paper A', 'Paper B', 'A', 'B'] as const

  const [candStatuses,         setCandStatuses]         = useState<Record<string, string>>({})
  const [candRatings,          setCandRatings]          = useState<Record<string, string>>({})
  const [showAddCandModal,     setShowAddCandModal]     = useState(false)
  const [candModalSelected,    setCandModalSelected]    = useState<Set<string>>(new Set())
  const [candSearch,           setCandSearch]           = useState('')
  const [confirmRemoveId,      setConfirmRemoveId]      = useState<string | null>(null)

  const jobCandidates      = candidates.filter(c => c.attachedJobIds?.includes(job?.id ?? '') && !c.isArchived)
  const availableCandidates = candidates.filter(c => !c.attachedJobIds?.includes(job?.id ?? '') && !c.isArchived)

  const filteredAvailable = candSearch.trim()
    ? availableCandidates.filter(c =>
        c.name.toLowerCase().includes(candSearch.toLowerCase()) ||
        c.specialty?.toLowerCase().includes(candSearch.toLowerCase())
      )
    : availableCandidates

  function openCandModal() { setCandModalSelected(new Set()); setCandSearch(''); setShowAddCandModal(true) }

  function confirmAddCandidates() {
    if (!job || candModalSelected.size === 0) return
    candModalSelected.forEach(id => {
      const c = candidates.find(x => x.id === id)
      if (!c) return
      const nextIds = [...new Set([...(c.attachedJobIds ?? []), job.id])]
      onUpdateCandidate?.(id, { attachedJobIds: nextIds })
    })
    setShowAddCandModal(false)
  }

  function removeCandidateFromJob(c: Candidate) {
    if (!job || !onUpdateCandidate) return
    const nextIds = (c.attachedJobIds ?? []).filter(id => id !== job.id)
    onUpdateCandidate(c.id, { attachedJobIds: nextIds })
    void logActivity('status_changed', `${c.name} removed from ${job.title}`, c.id, 'candidate')
    setConfirmRemoveId(null)
  }

  const candidatesTab = (
    <div className="p-4">
      {jobCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Users className="w-12 h-12 text-[#E2E8F0] mb-3" />
          <p className="text-[15px] font-medium text-[#1E293B] mb-1">No candidates yet</p>
          <p className="text-[13px] text-[#94A3B8] mb-4">Add candidates to this job opening</p>
          <button
            type="button"
            onClick={openCandModal}
            className="bg-[#2563EB] text-white rounded-[7px] px-4 py-2 text-[13px] font-medium hover:bg-[#1D4ED8] transition-colors"
          >
            + Add Candidates
          </button>
        </div>
      ) : (
      <>
        <div className="flex justify-end mb-3">
          <button type="button" onClick={openCandModal}
            className="flex items-center gap-1.5 bg-[#2563EB] text-white rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#1D4ED8] transition-colors">
            <UserPlus size={13} /> Add Candidates
          </button>
        </div>
        <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
                {['Name', 'Status', 'Rating', 'Added', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase text-[#64748B] font-medium" style={{ padding: '8px 16px', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobCandidates.map((c, i) => {
                const { bg, clr } = getAvatarColor(c.id)
                return (
                  <tr
                    key={c.id}
                    onClick={() => setCurrentPage('candidate')}
                    className="group hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                    style={{ borderBottom: i < jobCandidates.length - 1 ? '0.5px solid #F1F5F9' : undefined }}
                  >
                    <td style={{ padding: '10px 16px' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold" style={{ backgroundColor: bg, color: clr }}>
                          {getInitials(c.name)}
                        </div>
                        <span className="text-[13px] font-medium text-[#1E293B] hover:text-[#2563EB] transition-colors">{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <select
                        value={candStatuses[c.id] ?? c.stage}
                        onChange={e => {
                          const val = e.target.value
                          setCandStatuses(prev => ({ ...prev, [c.id]: val }))
                          onUpdateCandidate?.(c.id, { stage: val as Candidate['stage'] })
                        }}
                        onClick={e => e.stopPropagation()}
                        className="text-[11px] text-[#1E293B] bg-white rounded-[6px] focus:outline-none cursor-pointer"
                        style={{ border: '0.5px solid #E2E8F0', padding: '3px 6px' }}
                      >
                        {CAND_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <select
                        value={candRatings[c.id] ?? c.rating}
                        onChange={e => {
                          const val = e.target.value
                          setCandRatings(prev => ({ ...prev, [c.id]: val }))
                          onUpdateCandidate?.(c.id, { rating: val })
                        }}
                        onClick={e => e.stopPropagation()}
                        className="text-[11px] text-[#1E293B] bg-white rounded-[6px] focus:outline-none cursor-pointer"
                        style={{ border: '0.5px solid #E2E8F0', padding: '3px 6px' }}
                      >
                        {CAND_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="text-[12px] text-[#64748B]" style={{ padding: '10px 16px' }}>{c.addedDate}</td>
                    <td style={{ padding: '10px 16px' }} onClick={e => e.stopPropagation()}>
                      {confirmRemoveId === c.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-[#DC2626] whitespace-nowrap">Remove {c.name.split(' ')[0]}?</span>
                          <button
                            type="button"
                            onClick={() => removeCandidateFromJob(c)}
                            className="px-2 py-0.5 text-[11px] font-medium text-white bg-[#DC2626] rounded-[5px] hover:bg-red-700 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmRemoveId(null)}
                            className="px-2 py-0.5 text-[11px] font-medium text-[#475569] bg-white rounded-[5px] hover:bg-[#F8FAFC] transition-colors"
                            style={{ border: '0.5px solid #E2E8F0' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveId(c.id)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#FEF2F2] opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remove ${c.name} from job`}
                        >
                          <X className="w-3.5 h-3.5 text-[#94A3B8] hover:text-[#DC2626]" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </>
      )}

      {/* ── Add Candidates Modal ─────────────────────────────────────────────── */}
      {showAddCandModal && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
          <div
            className="bg-white rounded-[10px] shadow-lg w-[460px] max-h-[75vh] flex flex-col"
            style={{ border: '0.5px solid #E2E8F0' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
              <h2 className="text-[15px] font-semibold text-[#1E293B]">Add candidates</h2>
              <button type="button" onClick={() => setShowAddCandModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pt-3 pb-2 flex-shrink-0">
              <input
                type="text"
                value={candSearch}
                onChange={e => setCandSearch(e.target.value)}
                placeholder="Search by name or specialty..."
                className="w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white placeholder:text-[#94A3B8]"
                style={{ border: '0.5px solid #E2E8F0', padding: '7px 10px' }}
                autoFocus
              />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}>
              {filteredAvailable.length === 0 ? (
                <p className="text-[13px] text-[#94A3B8] py-4 text-center">
                  {availableCandidates.length === 0 ? 'All candidates are already added to this job.' : 'No candidates match your search.'}
                </p>
              ) : filteredAvailable.map(c => {
                const checked = candModalSelected.has(c.id)
                const { bg, clr } = getAvatarColor(c.id)
                return (
                  <label key={c.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] cursor-pointer transition-colors mb-1 ${checked ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8FAFC]'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setCandModalSelected(prev => {
                        const n = new Set(prev)
                        n.has(c.id) ? n.delete(c.id) : n.add(c.id)
                        return n
                      })}
                      className="w-4 h-4 accent-[#2563EB] flex-shrink-0"
                    />
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: bg, color: clr }}>
                      {getInitials(c.name)}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#1E293B] leading-none mb-0.5">{c.name}</p>
                      {c.specialty && <p className="text-[12px] text-[#94A3B8]">{c.specialty}</p>}
                    </div>
                    <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569] flex-shrink-0">{c.stage}</span>
                  </label>
                )
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderTop: '0.5px solid #E2E8F0' }}>
              <span className="text-[12px] text-[#64748B]">
                {candModalSelected.size > 0 ? `${candModalSelected.size} selected` : 'Select candidates to add'}
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddCandModal(false)}
                  className="px-4 py-2 text-[12px] font-medium text-[#475569] bg-white rounded-[7px] hover:bg-[#F8FAFC]"
                  style={{ border: '0.5px solid #E2E8F0' }}>
                  Cancel
                </button>
                <button type="button" onClick={confirmAddCandidates} disabled={candModalSelected.size === 0}
                  className="px-4 py-2 text-[12px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── Recruiters tab ────────────────────────────────────────────────────────────

  const [showRecruiterModal, setShowRecruiterModal] = useState(false)
  const [modalSelected,      setModalSelected]      = useState<Set<string>>(new Set())

  const assignedIds   = job?.recruiterIds ?? []
  const assignedList  = recruiters.filter(r => assignedIds.includes(r.id))
  const availableList = recruiters.filter(r => !assignedIds.includes(r.id))

  function openModal() { setModalSelected(new Set()); setShowRecruiterModal(true) }

  function confirmAddRecruiters() {
    if (!job || !onUpdateJob || modalSelected.size === 0) return
    const nextIds    = [...new Set([...assignedIds, ...modalSelected])]
    const nextEmails = [...new Set([...(job.recruiterEmails ?? []), ...recruiters.filter(r => modalSelected.has(r.id)).map(r => r.email)])]
    const firstNew   = recruiters.find(r => modalSelected.has(r.id))
    onUpdateJob({
      ...job,
      recruiterIds:           nextIds,
      recruiterEmails:        nextEmails,
      assignedRecruiterId:    job.assignedRecruiterId || firstNew?.id    || '',
      assignedRecruiterEmail: job.assignedRecruiterEmail || firstNew?.email || '',
      assignedRecruiterName:  job.assignedRecruiterName || firstNew?.email || '',
    })
    setShowRecruiterModal(false)
  }

  function removeRecruiter(id: string) {
    if (!job || !onUpdateJob) return
    const removed     = recruiters.find(r => r.id === id)
    const nextIds     = assignedIds.filter(x => x !== id)
    const nextEmails  = (job.recruiterEmails ?? []).filter(e => e !== removed?.email)
    const stillPrimary = nextIds.includes(job.assignedRecruiterId)
    const first        = recruiters.find(r => nextIds.includes(r.id))
    onUpdateJob({
      ...job,
      recruiterIds:           nextIds,
      recruiterEmails:        nextEmails,
      assignedRecruiterId:    stillPrimary ? job.assignedRecruiterId    : (first?.id    ?? ''),
      assignedRecruiterEmail: stillPrimary ? job.assignedRecruiterEmail : (first?.email ?? ''),
      assignedRecruiterName:  stillPrimary ? job.assignedRecruiterName  : (first?.email ?? ''),
    })
  }

  function getInitials(name: string) {
    const p = name.trim().split(' ')
    return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : p[0].slice(0, 2)).toUpperCase()
  }

  const recruitersTab = (
    <div className="p-4">
      {assignedList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Users className="w-12 h-12 text-[#E2E8F0] mb-3" />
          <p className="text-[15px] font-medium text-[#1E293B] mb-1">No recruiters assigned</p>
          <p className="text-[13px] text-[#94A3B8] mb-4">Assign recruiters who will work this job opening</p>
          {isManager && availableList.length > 0 && (
            <button type="button" onClick={openModal}
              className="bg-[#2563EB] text-white rounded-[7px] px-4 py-2 text-[13px] font-medium hover:bg-[#1D4ED8] transition-colors">
              + Add Recruiter
            </button>
          )}
        </div>
      ) : (
        <>
          {isManager && (
            <div className="flex justify-end mb-3">
              <button type="button" onClick={openModal}
                className="flex items-center gap-1.5 bg-[#2563EB] text-white rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#1D4ED8] transition-colors">
                <UserPlus size={13} /> Add Recruiter
              </button>
            </div>
          )}

          <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
                  {['Recruiter', 'Email', 'Role', ''].map(h => (
                    <th key={h} className="text-left text-[10px] uppercase text-[#64748B] font-medium" style={{ padding: '8px 16px', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignedList.map((r, i) => (
                  <tr key={r.id} className="group hover:bg-[#F8FAFC] transition-colors"
                    style={{ borderBottom: i < assignedList.length - 1 ? '0.5px solid #F1F5F9' : undefined }}>
                    <td style={{ padding: '10px 16px' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[10px] font-bold text-[#1D4ED8] flex-shrink-0">
                          {getInitials(r.name || r.email)}
                        </div>
                        <span className="text-[13px] font-medium text-[#1E293B]">{r.name || r.email}</span>
                        {r.id === job?.assignedRecruiterId && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8]">Primary</span>
                        )}
                      </div>
                    </td>
                    <td className="text-[12px] text-[#475569]" style={{ padding: '10px 16px' }}>{r.email}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569]">Recruiter</span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      {isManager && (
                        <button type="button" onClick={() => removeRecruiter(r.id)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove">
                          <X className="w-3.5 h-3.5 text-[#64748B]" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Add Recruiters Modal ─────────────────────────────────────────────── */}
      {showRecruiterModal && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" onClick={() => setShowRecruiterModal(false)}>
          <div
            className="bg-white rounded-[10px] shadow-lg w-[440px] max-h-[70vh] flex flex-col"
            style={{ border: '0.5px solid #E2E8F0' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
              <h2 className="text-[15px] font-semibold text-[#1E293B]">Add recruiters</h2>
              <button type="button" onClick={() => setShowRecruiterModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {availableList.length === 0 ? (
                <p className="text-[13px] text-[#94A3B8] py-4 text-center">All team recruiters are already assigned to this job.</p>
              ) : availableList.map(r => {
                const checked = modalSelected.has(r.id)
                return (
                  <label key={r.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] cursor-pointer transition-colors mb-1 ${checked ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8FAFC]'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setModalSelected(prev => {
                        const n = new Set(prev)
                        n.has(r.id) ? n.delete(r.id) : n.add(r.id)
                        return n
                      })}
                      className="w-4 h-4 accent-[#2563EB] flex-shrink-0"
                    />
                    <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[11px] font-bold text-[#1D4ED8] flex-shrink-0">
                      {getInitials(r.name || r.email)}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#1E293B] leading-none mb-0.5">{r.name || r.email}</p>
                      {r.name && <p className="text-[12px] text-[#94A3B8]">{r.email}</p>}
                    </div>
                  </label>
                )
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderTop: '0.5px solid #E2E8F0' }}>
              <span className="text-[12px] text-[#64748B]">
                {modalSelected.size > 0 ? `${modalSelected.size} selected` : 'Select recruiters to add'}
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowRecruiterModal(false)}
                  className="px-4 py-2 text-[12px] font-medium text-[#475569] bg-white rounded-[7px] hover:bg-[#F8FAFC]"
                  style={{ border: '0.5px solid #E2E8F0' }}>
                  Cancel
                </button>
                <button type="button" onClick={confirmAddRecruiters} disabled={modalSelected.size === 0}
                  className="px-4 py-2 text-[12px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── Job Details tab ───────────────────────────────────────────────────────────

  const detailsTab = (
    <div className="p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: '60% 1fr' }}>

        {/* LEFT: Job posting + internal description */}
        <div>
          {/* Card 1: Job posting */}
          <div className="bg-white rounded-[10px] p-4 mb-4" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#1E293B]">Post to careers page</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">Active</span>
            </div>
            <p className="text-[10px] uppercase text-[#94A3B8] font-medium mt-3 mb-2" style={{ letterSpacing: '0.05em' }}>Job Ad</p>
            <textarea
              readOnly
              defaultValue={JOB_DESC_POSTING}
              className="w-full text-[12px] text-[#475569] leading-[1.6] resize-none focus:outline-none rounded-[7px] p-3 bg-[#F8FAFC]"
              style={{ border: '0.5px solid #E2E8F0', minHeight: 180, fontFamily: 'inherit' }}
            />
          </div>

          {/* Card 2: Internal job description */}
          <div className="bg-white rounded-[10px] p-4" style={{ border: '0.5px solid #E2E8F0' }}>
            <p className="text-[10px] uppercase text-[#94A3B8] font-medium mb-1" style={{ letterSpacing: '0.05em' }}>Job Description</p>
            <p className="text-[10px] text-[#94A3B8] italic mb-2">Used in candidate Interview Form</p>
            <textarea
              readOnly
              defaultValue={JOB_DESC_INTERNAL}
              className="w-full text-[12px] text-[#475569] leading-[1.6] resize-none focus:outline-none rounded-[7px] p-3 bg-[#F8FAFC]"
              style={{ border: '0.5px solid #E2E8F0', minHeight: 200, fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* RIGHT: Details summary */}
        <div>
          <div className="bg-white rounded-[10px] p-4" style={{ border: '0.5px solid #E2E8F0' }}>
            <p className="text-[10px] uppercase text-[#94A3B8] font-medium mb-3" style={{ letterSpacing: '0.05em' }}>Details</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] text-[#94A3B8] min-w-[72px] flex-shrink-0">Job ID</span>
              <span className="text-[12px] text-[#1E293B]">{job?.internalId?.trim() || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Documents tab ─────────────────────────────────────────────────────────────

  const documentsTab = (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <button type="button" className="flex items-center gap-1.5 border-subtle bg-white rounded-[7px] px-3 py-1.5 text-[12px] text-[#475569] hover:bg-[#F8FAFC] transition-colors">
          <FilePlus className="w-3.5 h-3.5" aria-hidden="true" />
          Add From File
        </button>
        <button type="button" className="flex items-center gap-1.5 border-subtle bg-white rounded-[7px] px-3 py-1.5 text-[12px] text-[#475569] hover:bg-[#F8FAFC] transition-colors">
          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          Add Active Word Doc
        </button>
        <button type="button" className="flex items-center gap-1.5 border-subtle bg-white rounded-[7px] px-3 py-1.5 text-[12px] text-[#475569] hover:bg-[#F8FAFC] transition-colors">
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
          Email Document
        </button>
      </div>
      {DOCS.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-[13px] text-[#94A3B8]">No documents yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
                <th style={{ width: 32, padding: '8px 16px' }} className="text-left">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-[#2563EB]" />
                </th>
                {['Document name', 'Document type', 'Date'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase text-[#64748B] font-medium" style={{ padding: '8px 16px', letterSpacing: '0.05em' }}>{h}</th>
                ))}
                <th style={{ width: 64, padding: '8px 16px' }} />
              </tr>
            </thead>
            <tbody>
              {DOCS.map((d, i) => (
                <tr key={i} className="group hover:bg-[#F8FAFC] transition-colors" style={{ borderBottom: i < DOCS.length - 1 ? '0.5px solid #F1F5F9' : undefined }}>
                  <td style={{ padding: '10px 16px' }}>
                    <input type="checkbox" className="w-3.5 h-3.5 accent-[#2563EB]" />
                  </td>
                  <td className="text-[12px] text-[#2563EB] hover:underline cursor-pointer" style={{ padding: '10px 16px' }}>{d.name}</td>
                  <td className="text-[12px] text-[#475569]" style={{ padding: '10px 16px' }}>{d.type}</td>
                  <td className="text-[12px] text-[#64748B]" style={{ padding: '10px 16px' }}>{d.date}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div className="flex items-center gap-1 justify-end">
                      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Download">
                        <Download className="w-3.5 h-3.5 text-[#64748B]" />
                      </button>
                      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove">
                        <X className="w-3.5 h-3.5 text-[#64748B]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F8FAFC]">

      {/* ROW 1: Breadcrumbs + Prev/Next */}
      <div
        className="h-[34px] bg-white flex items-center px-4 flex-shrink-0"
        style={{ borderBottom: '0.5px solid #E2E8F0' }}
      >
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage('jobs')}
            className="flex items-center gap-0.5 text-[12px] text-[#2563EB] hover:underline"
          >
            <ChevronLeft size={13} />
            Jobs
          </button>
          <span className="text-[12px] text-[#94A3B8]">›</span>
          <span className="text-[12px] text-[#64748B]">{job?.title ?? '—'}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-0.5 px-2 py-1 text-[11px] text-[#64748B] rounded-md hover:bg-[#F8FAFC]" style={{ border: '0.5px solid #E2E8F0' }}>
            <ChevronLeft size={11} /> Prev
          </button>
          <span className="text-[11px] text-[#94A3B8]">1 / 12</span>
          <button className="flex items-center gap-0.5 px-2 py-1 text-[11px] text-[#64748B] rounded-md hover:bg-[#F8FAFC]" style={{ border: '0.5px solid #E2E8F0' }}>
            Next <ChevronRight size={11} />
          </button>
        </div>
      </div>

      {/* ROW 2: Title + Actions */}
      <div className="bg-white flex items-center px-4 gap-2 flex-shrink-0" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <span className="text-[18px] font-medium text-[#1E293B] flex-1">{job?.title ?? '—'}</span>
        <span
          className="text-[10px] font-medium px-3 py-1.5 rounded-full"
          style={{
            background: job?.status === 'On Hold' ? '#FEF3C7' : job?.status === 'Closed' ? '#F1F5F9' : '#DCFCE7',
            color:      job?.status === 'On Hold' ? '#92400E' : job?.status === 'Closed' ? '#475569' : '#15803D',
            border:     `1px solid ${job?.status === 'On Hold' ? '#FDE68A' : job?.status === 'Closed' ? '#E2E8F0' : '#BBF7D0'}`,
          }}
        >
          {job?.status ?? 'Open'}
        </span>
        <div className="w-px h-4 bg-[#E2E8F0] mx-1 flex-shrink-0" />
        <button className="px-3 py-1.5 text-[12px] text-[#1E293B] bg-white rounded-[7px] hover:bg-[#F8FAFC]" style={{ border: '0.5px solid #E2E8F0' }}>
          <Mail size={13} className="inline mr-1.5 text-[#64748B]" />
          Email
        </button>
        {isManager && job && (
          <button type="button" onClick={() => setShowEditPanel(true)}
            className="w-[30px] h-[30px] flex items-center justify-center border-subtle rounded-[7px] bg-white hover:bg-[#F8FAFC] transition-colors"
            title="Edit job">
            <Pencil size={13} className="text-[#64748B]" />
          </button>
        )}
        <button className={ICON_BTN}>
          <MoreHorizontal size={15} className="text-[#64748B]" />
        </button>
      </div>

      {/* INFO BLOCK */}
      <div className="bg-white flex-shrink-0 px-4 pb-3" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
        <div className="grid grid-cols-4 gap-0">

          {/* Col 1: Job Details */}
          <div className="pr-6">
            <p className={INFO_LABEL}>Job Details</p>
            <div className="flex flex-col gap-[3px]">
              <div className="flex items-baseline gap-[5px]">
                <span className="text-[10px] text-[#94A3B8] min-w-[56px] flex-shrink-0">Client</span>
                <button onClick={() => setCurrentPage('company')} className="text-[12px] text-[#2563EB] hover:underline text-left">
                  {job?.companyName ?? '—'}
                </button>
              </div>
              {([
                ['Job type', job?.workTypes?.length ? job.workTypes.join(', ') : (job?.jobType ?? '—')],
                ['Location', job?.location  ?? '—'],
                ['Client Req.', job?.clientReqNumber && job.clientReqNumber.trim() !== '' ? job.clientReqNumber : '—'],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex items-baseline gap-[5px]">
                  <span className="text-[10px] text-[#94A3B8] min-w-[56px] flex-shrink-0">{label}</span>
                  <span className="text-[12px] text-[#1E293B]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: Compensation */}
          <div className="px-6">
            <p className={INFO_LABEL}>Compensation</p>
            <div className="flex flex-col gap-[3px]">
              {([
                ['Salary',   job?.salaryMin && job?.salaryMax ? `$${job.salaryMin} – $${job.salaryMax}` : '—'],
                ['Pay Type', job?.salaryType === 'hour' ? 'Hourly' : job?.salaryType === 'year' ? 'Annual' : '—'],
                ['Posted',   job?.dateAdded ?? '—'],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex items-baseline gap-[5px]">
                  <span className="text-[10px] text-[#94A3B8] min-w-[56px] flex-shrink-0">{label}</span>
                  <span className="text-[12px] text-[#1E293B]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Hiring Manager */}
          <div className="px-6">
            <p className={INFO_LABEL}>Hiring Manager</p>
            <span className="text-[12px] font-medium text-[#1E293B]">
              {job?.ownerName || '—'}
            </span>
          </div>

          {/* Col 4: Notes */}
          <div className="px-6 flex flex-col">
            <p className={INFO_LABEL}>Notes</p>
            <textarea
              className="flex-1 w-full min-h-[60px] text-[12px] text-[#1E293B] leading-[1.5] resize-none focus:outline-none placeholder-[#94A3B8] bg-transparent"
              style={{ fontFamily: 'inherit', border: 'none' }}
              placeholder="Quick notes about this job..."
              defaultValue="Client needs someone with 3+ years .NET experience. Prefers local candidates but open to remote."
            />
          </div>
        </div>
      </div>

      {/* TABS BAR */}
      <div
        className="bg-white h-[40px] flex items-center px-4 flex-shrink-0 sticky z-10"
        style={{ borderBottom: '0.5px solid #E2E8F0' }}
      >
        {JOB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-full px-4 text-[13px] flex items-center transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[#2563EB] text-[#2563EB] font-medium'
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        {activeTab === 'candidates' && candidatesTab}
        {activeTab === 'recruiters' && recruitersTab}
        {activeTab === 'details'    && detailsTab}
        {activeTab === 'documents'  && documentsTab}
      </div>

      <EditPanel isOpen={showEditPanel} onClose={() => setShowEditPanel(false)} title="Edit job" onSave={handleSaveJob} isSaving={isSaving}>
        <div className="space-y-4">

          {/* Job Info */}
          <p className={SEC}>Job Info</p>
          <div>
            <label className={LBL}>Job title</label>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className={INP} style={INP_ST} />
          </div>
          <div>
            <label className={LBL}>Job type</label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {WORK_TYPE_OPTIONS.map(wt => (
                <label key={wt} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editWorkTypes.includes(wt)}
                    onChange={() => setEditWorkTypes(prev => prev.includes(wt) ? prev.filter(x => x !== wt) : [...prev, wt])}
                    className="w-3.5 h-3.5 accent-[#2563EB]" />
                  <span className="text-[12px] text-[#1E293B]">{wt}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={LBL}>Salary range</label>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#64748B]">$</span>
              <input value={editSalaryMin} onChange={e => setEditSalaryMin(e.target.value)} placeholder="50,000" className={INP} style={{ ...INP_ST, width: 100 }} />
              <span className="text-[12px] text-[#94A3B8]">–</span>
              <span className="text-[12px] text-[#64748B]">$</span>
              <input value={editSalaryMax} onChange={e => setEditSalaryMax(e.target.value)} placeholder="75,000" className={INP} style={{ ...INP_ST, width: 100 }} />
              <div className="flex gap-1 ml-1">
                {(['year', 'hour'] as SalaryType[]).map(t => (
                  <button key={t} type="button" onClick={() => setEditSalaryType(t)}
                    className={`px-2 py-1.5 text-[11px] rounded-full border transition-colors ${editSalaryType === t ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]' : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className={LBL}>Status</label>
            <PillGroup options={JOB_STATUSES} value={editStatus} onChange={setEditStatus} />
          </div>
          <div>
            <label className={LBL}>Job description</label>
            <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={4}
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white placeholder:text-[#94A3B8] resize-none"
              style={{ border: '0.5px solid #E2E8F0', padding: '7px 10px', minHeight: 80 }} />
          </div>

          {/* Job Numbers */}
          <p className={SEC} style={{ marginTop: 8 }}>Job Numbers</p>
          <div>
            <label className={LBL}>Internal Job ID</label>
            <input value={editInternalId} onChange={e => setEditInternalId(e.target.value)} className={INP} style={INP_ST} />
          </div>
          <div>
            <label className={LBL}>Client Req. Number</label>
            <input value={editClientReq} onChange={e => setEditClientReq(e.target.value)} placeholder="—" className={INP} style={INP_ST} />
          </div>

          {/* Location */}
          <p className={SEC} style={{ marginTop: 8 }}>Location</p>
          <CityAutocomplete cityValue={editCity} stateValue={editState} onCityChange={setEditCity} onStateChange={setEditState} cityPlaceholder="City" />
          <div>
            <label className={LBL}>ZIP</label>
            <input value={editZip} onChange={e => setEditZip(e.target.value)} placeholder="75000" className={INP} style={{ ...INP_ST, width: 96 }} />
          </div>

          {/* Hiring Team */}
          <p className={SEC} style={{ marginTop: 8 }}>Hiring Team</p>
          <div>
            <label className={LBL}>Hiring Manager</label>
            <div className="text-[12px] text-[#1E293B] rounded-[7px] bg-[#F8FAFC]" style={{ border: '0.5px solid #E2E8F0', padding: '7px 10px' }}>
              {job?.ownerName || '—'}
            </div>
          </div>


        </div>
      </EditPanel>

    </div>
  )
}
