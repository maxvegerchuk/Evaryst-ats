import { useState, useRef, useEffect } from 'react'
import { useClickOutside } from '../hooks/useClickOutside'
import {
  ExternalLink, Search, ChevronDown, Plus,
  MoreHorizontal, User, Mail, X,
  ChevronLeft, ChevronRight, Briefcase,
} from 'lucide-react'
import type { Job, JobStatus } from '../types/job'
import { daysOpen } from '../types/job'
import type { Company } from '../types/company'
import type { User as AppUser } from '../types/auth'
import { AddJobModal } from '../components/ui/AddJobModal'

// ── Constants ──────────────────────────────────────────────────────────────────

const SORT_OPTIONS    = ['Date Posted', 'Title (A-Z)', 'Company', 'Status', 'Recruiter'] as const
type SortOption = typeof SORT_OPTIONS[number]

const STATUS_OPTIONS:   readonly string[] = ['All', 'Open', 'On Hold', 'Closed']
const JOB_TYPE_OPTIONS: readonly string[] = ['All', 'Full Time', 'Part Time', 'Contract', 'Contract to Hire']

const STATUS_STYLE: Record<JobStatus, string> = {
  'Open':    'bg-[#DCFCE7] text-[#15803D]',
  'Closed':  'bg-[#F1F5F9] text-[#475569]',
  'On Hold': 'bg-[#FEF3C7] text-[#92400E]',
}

interface Recruiter { id: string; email: string; name?: string; role: string }

function recruiterLabel(job: Job): string {
  return job.assignedRecruiterName || job.assignedRecruiterEmail || ''
}

function recruiterInitials(label: string): string {
  const parts = label.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return label.slice(0, 2).toUpperCase()
}

function formatSalary(job: Job): string {
  if (!job.salaryMin && !job.salaryMax) return '—'
  const fmt = (v: string) => v ? `$${v}` : ''
  const range = [fmt(job.salaryMin), fmt(job.salaryMax)].filter(Boolean).join(' – ')
  return range ? `${range} / ${job.salaryType}` : '—'
}

function sortJobs(list: Job[], sort: SortOption): Job[] {
  const s = [...list]
  if (sort === 'Title (A-Z)') s.sort((a, b) => a.title.localeCompare(b.title))
  if (sort === 'Company')     s.sort((a, b) => a.companyName.localeCompare(b.companyName))
  if (sort === 'Status')      s.sort((a, b) => a.status.localeCompare(b.status))
  if (sort === 'Recruiter')   s.sort((a, b) => recruiterLabel(a).localeCompare(recruiterLabel(b)))
  return s
}

// ── Component ──────────────────────────────────────────────────────────────────

interface JobsPageProps {
  onNavigate:      (page: string) => void
  onNavigateToJob: (id: string) => void
  isManager?:      boolean
  jobs:            Job[]
  companies:       Company[]
  onAddJob:        (job: Job) => void
  onDeleteJob:     (id: string) => void
  recruiters:      Recruiter[]
  currentUser:     AppUser
  candidates?:     import('../types/candidate').Candidate[]
}

export function JobsPage({ onNavigateToJob, isManager, jobs, companies, onAddJob, onDeleteJob, recruiters, candidates = [], currentUser }: JobsPageProps) {
  const [showAddJob,      setShowAddJob]      = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [search,          setSearch]          = useState('')
  const [sortBy,          setSortBy]          = useState<SortOption>('Date Posted')
  const [companyFilter,   setCompanyFilter]   = useState('All')
  const [statusFilter,    setStatusFilter]    = useState('All')
  const [typeFilter,      setTypeFilter]      = useState('All')
  const [selected,        setSelected]        = useState<Set<string>>(new Set())
  const [recruiterFilter, setRecruiterFilter] = useState('All')
  const [openFilter,      setOpenFilter]      = useState<'company' | 'status' | 'type' | 'recruiter' | null>(null)
  const [actionDropdown,  setActionDropdown]  = useState<string | null>(null)
  const [dropdownPos,     setDropdownPos]     = useState<{ top: number; right: number } | null>(null)

  const filterPillsRef = useRef<HTMLDivElement>(null)

  const companyOptions   = ['All', ...Array.from(new Set(jobs.map(j => j.companyName).filter(Boolean))).sort()]
  const recruiterOptions = ['All', ...Array.from(new Set(jobs.map(j => recruiterLabel(j)).filter(Boolean))).sort()]

  useClickOutside(filterPillsRef, () => setOpenFilter(null), openFilter !== null)

  useEffect(() => {
    if (!actionDropdown) return
    function handler() { setActionDropdown(null); setDropdownPos(null) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [actionDropdown])

  const visibleJobs = jobs
  useEffect(() => {
    console.log('Safari debug:')
    console.log('currentUser email:', currentUser?.email)
    console.log('total jobs:', jobs.length)
    console.log('visible jobs:', visibleJobs.length)
    console.log('all job emails:', jobs.map(j => j.assignedRecruiterEmail))
  }, [jobs, currentUser, visibleJobs.length])

  const filtered = sortJobs(
    jobs.filter(j => {
      const q = search.toLowerCase()
      const label = recruiterLabel(j)
      const matchSearch    = !q || j.title.toLowerCase().includes(q) || j.companyName.toLowerCase().includes(q)
      const matchCompany   = companyFilter   === 'All' || j.companyName === companyFilter
      const matchStatus    = statusFilter    === 'All' || j.status      === statusFilter
      const matchType      = typeFilter      === 'All' || j.jobType     === typeFilter
      const matchRecruiter = recruiterFilter === 'All' || label         === recruiterFilter
      return matchSearch && matchCompany && matchStatus && matchType && matchRecruiter
    }),
    sortBy,
  )

  const allSelected = filtered.length > 0 && selected.size === filtered.length

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map(j => j.id)))
  }

  function handleActionClick(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (actionDropdown === id) { setActionDropdown(null); setDropdownPos(null); return }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    setActionDropdown(id)
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <h1 className="text-[24px] font-semibold text-[#1E293B] mb-5">Jobs</h1>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 border-subtle bg-white rounded-[7px] px-3 py-1.5 text-[12px] text-[#475569] hover:bg-[#F8FAFC] transition-colors">
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            Export
          </button>
          {isManager && (
            <button type="button" onClick={() => setShowAddJob(true)} className="flex items-center gap-1.5 bg-[#2563EB] text-white rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#1D4ED8] transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add Job
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#64748B]">Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="text-[12px] text-[#1E293B] bg-white rounded-[7px] outline-none cursor-pointer hover:bg-[#F8FAFC]"
            style={{ border: '0.5px solid #E2E8F0', padding: '6px 28px 6px 10px' }}
          >
            {SORT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Search + filter row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs by title, company..."
            className="w-full pl-9 pr-3 text-[12px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none bg-white rounded-[7px]"
            style={{ border: '0.5px solid #E2E8F0', paddingTop: 6, paddingBottom: 6 }}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0" ref={filterPillsRef}>
          {/* Company */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenFilter(openFilter === 'company' ? null : 'company')}
              className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                companyFilter !== 'All'
                  ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                  : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              Company: {companyFilter === 'All' ? 'All' : companyFilter.split(' ')[0]}
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            </button>
            {openFilter === 'company' && (
              <div className="absolute top-full left-0 mt-1 bg-white border-subtle rounded-[7px] shadow-md z-20 min-w-[200px] py-1 max-h-[240px] overflow-y-auto">
                {companyOptions.map(o => (
                  <button key={o} type="button" onClick={() => { setCompanyFilter(o); setOpenFilter(null) }}
                    className={`flex w-full px-3 py-1.5 text-[12px] hover:bg-slate-50 text-left ${companyFilter === o ? 'text-[#2563EB] font-medium' : 'text-[#1E293B]'}`}>
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenFilter(openFilter === 'status' ? null : 'status')}
              className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                statusFilter !== 'All'
                  ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                  : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              Status: {statusFilter}
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            </button>
            {openFilter === 'status' && (
              <div className="absolute top-full left-0 mt-1 bg-white border-subtle rounded-[7px] shadow-md z-20 min-w-[130px] py-1">
                {STATUS_OPTIONS.map(o => (
                  <button key={o} type="button" onClick={() => { setStatusFilter(o); setOpenFilter(null) }}
                    className={`flex w-full px-3 py-1.5 text-[12px] hover:bg-slate-50 text-left ${statusFilter === o ? 'text-[#2563EB] font-medium' : 'text-[#1E293B]'}`}>
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Job Type */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenFilter(openFilter === 'type' ? null : 'type')}
              className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                typeFilter !== 'All'
                  ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                  : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              Type: {typeFilter === 'All' ? 'All' : typeFilter}
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            </button>
            {openFilter === 'type' && (
              <div className="absolute top-full left-0 mt-1 bg-white border-subtle rounded-[7px] shadow-md z-20 min-w-[160px] py-1">
                {JOB_TYPE_OPTIONS.map(o => (
                  <button key={o} type="button" onClick={() => { setTypeFilter(o); setOpenFilter(null) }}
                    className={`flex w-full px-3 py-1.5 text-[12px] hover:bg-slate-50 text-left ${typeFilter === o ? 'text-[#2563EB] font-medium' : 'text-[#1E293B]'}`}>
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recruiter */}
          {isManager && recruiterOptions.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenFilter(openFilter === 'recruiter' ? null : 'recruiter')}
                className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                  recruiterFilter !== 'All'
                    ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                    : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
                }`}
              >
                Recruiter: {recruiterFilter === 'All' ? 'All' : recruiterFilter.split(' ')[0]}
                <ChevronDown className="w-3 h-3" aria-hidden="true" />
              </button>
              {openFilter === 'recruiter' && (
                <div className="absolute top-full right-0 mt-1 bg-white border-subtle rounded-[7px] shadow-md z-20 min-w-[180px] py-1 max-h-[240px] overflow-y-auto">
                  {recruiterOptions.map(o => (
                    <button key={o} type="button" onClick={() => { setRecruiterFilter(o); setOpenFilter(null) }}
                      className={`flex w-full px-3 py-1.5 text-[12px] hover:bg-slate-50 text-left ${recruiterFilter === o ? 'text-[#2563EB] font-medium' : 'text-[#1E293B]'}`}>
                      {o === 'All' ? 'All' : o}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Briefcase className="w-12 h-12 text-[#E2E8F0] mb-3" />
          <p className="text-[15px] font-medium text-[#1E293B] mb-1">No jobs yet</p>
          {isManager ? (
            <button type="button" onClick={() => setShowAddJob(true)} className="mt-2 bg-[#2563EB] text-white rounded-[7px] px-4 py-2 text-[13px] font-medium hover:bg-[#1D4ED8] transition-colors">
              + Add your first job
            </button>
          ) : (
            <p className="text-[13px] text-[#94A3B8]">Jobs will appear here once your manager assigns them to you</p>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white border-subtle rounded-[10px] overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th style={{ width: 40 }}  className="px-4 py-2.5 text-left">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-3.5 h-3.5 accent-[#2563EB]" aria-label="Select all" />
                  </th>
                  <th style={{ width: isManager ? 155 : 160 }} className="px-4 py-2.5 text-left text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Job Title</th>
                  <th style={{ width: isManager ? 140 : 155 }} className="px-4 py-2.5 text-left text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Company</th>
                  <th style={{ width: isManager ? 110 : 120 }} className="px-4 py-2.5 text-left text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Job Type</th>
                  <th style={{ width: isManager ? 105 : 115 }} className="px-4 py-2.5 text-left text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Salary</th>
                  <th style={{ width: isManager ? 82 : 90 }}  className="px-4 py-2.5 text-left text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Status</th>
                  {isManager && <th style={{ width: 115 }} className="px-4 py-2.5 text-left text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Recruiter</th>}
                  <th style={{ width: isManager ? 74 : 80 }}  className="px-4 py-2.5 text-center text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Candidates</th>
                  <th style={{ width: isManager ? 78 : 85 }}  className="px-4 py-2.5 text-center text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Days Open</th>
                  <th style={{ width: isManager ? 95 : 105 }} className="px-4 py-2.5 text-left text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Date Added</th>
                  <th style={{ width: 48 }}  className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(j => {
                  const days  = daysOpen(j.dateAdded)
                  const label = recruiterLabel(j)
                  return (
                    <tr
                      key={j.id}
                      onClick={() => onNavigateToJob(j.id)}
                      className="group border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(j.id)}
                          onChange={() => toggleSelect(j.id)}
                          className="w-3.5 h-3.5 accent-[#2563EB]"
                          aria-label={`Select ${j.title}`}
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          onClick={e => { e.stopPropagation(); onNavigateToJob(j.id) }}
                          className="text-[13px] font-medium text-[#1E293B] hover:text-[#2563EB] cursor-pointer transition-colors"
                        >
                          {j.title}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[13px] text-[#475569]">{j.companyName}</td>
                      <td className="px-4 py-2.5 text-[13px] text-[#475569]">{j.jobType}</td>
                      <td className="px-4 py-2.5 text-[13px] text-[#475569]">{formatSalary(j)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[j.status]}`}>
                          {j.status}
                        </span>
                      </td>
                      {isManager && (
                        <td className="px-4 py-2.5">
                          {label ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                                <span className="text-[9px] font-bold text-[#1D4ED8]">{recruiterInitials(label)}</span>
                              </div>
                              <span className="text-[12px] text-[#475569] truncate">{label}</span>
                            </div>
                          ) : (
                            <span className="text-[12px] text-[#CBD5E1]">—</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-2.5 text-center">
                        {(() => {
                          const cnt = candidates.filter(c => c.attachedJobIds?.includes(j.id) && !c.isArchived).length
                          return <span className={`text-[13px] ${cnt === 0 ? 'text-[#94A3B8]' : 'text-[#1E293B]'}`}>{cnt}</span>
                        })()}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-[13px] font-medium" style={{ color: days > 30 ? '#DC2626' : days > 14 ? '#F59E0B' : '#1E293B' }}>
                          {days}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#64748B]">{j.dateAdded}</td>
                      <td className="px-4 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={e => handleActionClick(e, j.id)}
                          className="p-1 rounded hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="More actions"
                        >
                          <MoreHorizontal className="w-4 h-4 text-[#94A3B8]" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-[12px] text-[#64748B]">
          Showing 1–{filtered.length} of {jobs.length} jobs
        </span>
        <div className="flex items-center gap-1">
          <button type="button" disabled className="flex items-center gap-1 border-subtle rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#475569] bg-white disabled:opacity-40">
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          <button type="button" className="w-8 h-8 rounded-[6px] text-[12px] font-medium bg-[#2563EB] text-white">1</button>
          <button type="button" disabled className="flex items-center gap-1 border-subtle rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#475569] bg-white disabled:opacity-40">
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AddJobModal
        isOpen={showAddJob}
        onClose={() => setShowAddJob(false)}
        onSave={j => { onAddJob(j); setShowAddJob(false) }}
        companies={companies}
        recruiters={recruiters}
        currentUser={currentUser}
      />

      {/* Action dropdown */}
      {actionDropdown && dropdownPos && (
        <div
          className="fixed z-50 bg-white border-subtle rounded-[8px] shadow-md py-1 w-44"
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
          onClick={e => e.stopPropagation()}
        >
          <button type="button" onClick={() => { onNavigateToJob(actionDropdown!); setActionDropdown(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#1E293B] hover:bg-slate-50">
            <User className="w-3.5 h-3.5 text-[#64748B]" />
            View job
          </button>
          <button type="button" className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#1E293B] hover:bg-slate-50">
            <Mail className="w-3.5 h-3.5 text-[#64748B]" />
            Send email
          </button>
          {isManager && (
            <>
              <div className="my-1 border-t border-[#F1F5F9]" />
              <button
                type="button"
                onClick={() => { setDeleteConfirmId(actionDropdown); setActionDropdown(null) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#DC2626] hover:bg-[#FEF2F2]"
              >
                <X className="w-3.5 h-3.5" />
                Delete job
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" onClick={() => setDeleteConfirmId(null)}>
          <div
            className="bg-white rounded-[10px] shadow-lg w-[360px] p-6"
            style={{ border: '0.5px solid #E2E8F0' }}
            onClick={e => e.stopPropagation()}
          >
            <p className="text-[15px] font-semibold text-[#1E293B] mb-1">Delete job?</p>
            <p className="text-[13px] text-[#64748B] mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-[12px] font-medium text-[#475569] bg-white rounded-[7px] hover:bg-[#F8FAFC]"
                style={{ border: '0.5px solid #E2E8F0' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { onDeleteJob(deleteConfirmId); setDeleteConfirmId(null) }}
                className="px-4 py-2 text-[12px] font-medium text-white bg-[#DC2626] rounded-[7px] hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
