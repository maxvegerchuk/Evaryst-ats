import { useState, useRef, useEffect } from 'react'
import { useClickOutside } from '../hooks/useClickOutside'
import {
  ExternalLink, BarChart2, Search, ChevronDown,
  MoreHorizontal, Mail, Globe, X, TrendingUp,
  ChevronLeft, ChevronRight, Building2, Plus,
} from 'lucide-react'
import type { Company, CompanyStatus } from '../types/company'
import type { User } from '../types/auth'
import { AddCompanyModal } from '../components/ui/AddCompanyModal'

const SORT_OPTIONS = ['Date Added', 'Name (A-Z)', 'Active Jobs', 'Status'] as const

type SortOption = typeof SORT_OPTIONS[number]

const STATUS_OPTIONS   = ['All', 'Active', 'Paused', 'Prospect'] as const
const INDUSTRY_OPTIONS = [
  'All', 'Information Tech.', 'Technology', 'Renewable Energy', 'Healthcare',
  'Data Analytics', 'Aerospace', 'Agriculture Tech', 'Cloud Computing',
  'Medical Devices', 'Logistics', 'Education',
] as const
const LOCATION_OPTIONS = [
  'All', 'Dallas, TX', 'San Francisco, CA', 'Austin, TX', 'Boston, MA',
  'New York, NY', 'Seattle, WA', 'Chicago, IL', 'Denver, CO',
  'Miami, FL', 'Houston, TX', 'Los Angeles, CA',
] as const

const STATUS_STYLE: Record<CompanyStatus, string> = {
  'Active':  'bg-[#DCFCE7] text-[#15803D]',
  'Paused':  'bg-[#FEF3C7] text-[#92400E]',
  'Prospect':'bg-[#DBEAFE] text-[#1D4ED8]',
}

function sortCompanies(list: Company[], sort: SortOption): Company[] {
  const s = [...list]
  if (sort === 'Name (A-Z)')  s.sort((a, b) => a.name.localeCompare(b.name))
  if (sort === 'Status')      s.sort((a, b) => a.status.localeCompare(b.status))
  if (sort === 'Active Jobs') s.sort((a, b) => b.activeJobs - a.activeJobs)
  return s
}

// ── Component ──────────────────────────────────────────────────────────────────

interface CompaniesPageProps {
  onNavigate:          (page: string) => void
  onNavigateToCompany: (id: string) => void
  isManager?:          boolean
  companies:           Company[]
  onAddCompany:        (company: Company) => void
  onDeleteCompany:     (id: string) => void
  currentUser:         User
  jobs?:               import('../types/job').Job[]
}

export function CompaniesPage({ onNavigateToCompany, isManager, companies, onAddCompany, onDeleteCompany, currentUser, jobs = [] }: CompaniesPageProps) {
  const [showAddCompany,  setShowAddCompany]  = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [search,         setSearch]         = useState('')
  const [sortBy,         setSortBy]         = useState<SortOption>('Date Added')
  const [statusFilter,   setStatusFilter]   = useState('All')
  const [industryFilter, setIndustryFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All')
  const [selected,       setSelected]       = useState<Set<string>>(new Set())
  const [showStats,      setShowStats]      = useState(false)
  const [openFilter,     setOpenFilter]     = useState<'status' | 'industry' | 'location' | null>(null)
  const [actionDropdown, setActionDropdown] = useState<string | null>(null)
  const [dropdownPos,    setDropdownPos]    = useState<{ top: number; right: number } | null>(null)

  const filterPillsRef = useRef<HTMLDivElement>(null)

  useClickOutside(filterPillsRef, () => setOpenFilter(null), openFilter !== null)

  useEffect(() => {
    if (!actionDropdown) return
    function handler() { setActionDropdown(null); setDropdownPos(null) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [actionDropdown])

  const filtered = sortCompanies(
    companies.filter(c => {
      const q = search.toLowerCase()
      const matchSearch   = !q || c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)
      const matchStatus   = statusFilter   === 'All' || c.status   === statusFilter
      const matchIndustry = industryFilter === 'All' || c.industry === industryFilter
      const matchLocation = locationFilter === 'All' || c.location === locationFilter
      return matchSearch && matchStatus && matchIndustry && matchLocation
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
    setSelected(allSelected ? new Set() : new Set(filtered.map(c => c.id)))
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
      <h1 className="text-[24px] font-semibold text-[#1E293B] mb-5">Companies</h1>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 border-subtle bg-white rounded-[7px] px-3 py-1.5 text-[12px] text-[#475569] hover:bg-[#F8FAFC] transition-colors">
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            Export
          </button>
          {isManager && (
            <button type="button" onClick={() => setShowAddCompany(true)} className="flex items-center gap-1.5 bg-[#2563EB] text-white rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#1D4ED8] transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add Company
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowStats(v => !v)}
            className={`flex items-center gap-1.5 border rounded-[7px] px-3 py-1.5 text-[12px] transition-colors ${
              showStats
                ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" aria-hidden="true" />
            Stats Overview
          </button>
        </div>
        <div className="flex items-center gap-3">
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
      </div>

      {/* Search + filter row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full pl-9 pr-3 text-[12px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none bg-white rounded-[7px]"
            style={{ border: '0.5px solid #E2E8F0', paddingTop: 6, paddingBottom: 6 }}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0" ref={filterPillsRef}>
          {/* Industry */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenFilter(openFilter === 'industry' ? null : 'industry')}
              className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                industryFilter !== 'All'
                  ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                  : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              Industry: {industryFilter === 'All' ? 'All' : industryFilter.split(' ')[0]}
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            </button>
            {openFilter === 'industry' && (
              <div className="absolute top-full left-0 mt-1 bg-white border-subtle rounded-[7px] shadow-md z-20 min-w-[180px] py-1 max-h-[240px] overflow-y-auto">
                {INDUSTRY_OPTIONS.map(o => (
                  <button key={o} type="button" onClick={() => { setIndustryFilter(o); setOpenFilter(null) }}
                    className={`flex w-full px-3 py-1.5 text-[12px] hover:bg-slate-50 text-left ${industryFilter === o ? 'text-[#2563EB] font-medium' : 'text-[#1E293B]'}`}>
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
              <div className="absolute top-full left-0 mt-1 bg-white border-subtle rounded-[7px] shadow-md z-20 min-w-[120px] py-1">
                {STATUS_OPTIONS.map(o => (
                  <button key={o} type="button" onClick={() => { setStatusFilter(o); setOpenFilter(null) }}
                    className={`flex w-full px-3 py-1.5 text-[12px] hover:bg-slate-50 text-left ${statusFilter === o ? 'text-[#2563EB] font-medium' : 'text-[#1E293B]'}`}>
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenFilter(openFilter === 'location' ? null : 'location')}
              className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                locationFilter !== 'All'
                  ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]'
                  : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              Location: {locationFilter === 'All' ? 'All' : locationFilter.split(',')[0]}
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            </button>
            {openFilter === 'location' && (
              <div className="absolute top-full left-0 mt-1 bg-white border-subtle rounded-[7px] shadow-md z-20 min-w-[180px] py-1 max-h-[240px] overflow-y-auto">
                {LOCATION_OPTIONS.map(o => (
                  <button key={o} type="button" onClick={() => { setLocationFilter(o); setOpenFilter(null) }}
                    className={`flex w-full px-3 py-1.5 text-[12px] hover:bg-slate-50 text-left ${locationFilter === o ? 'text-[#2563EB] font-medium' : 'text-[#1E293B]'}`}>
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Building2 className="w-12 h-12 text-[#E2E8F0] mb-3" />
          <p className="text-[15px] font-medium text-[#1E293B] mb-1">No companies yet</p>
          {isManager ? (
            <button type="button" onClick={() => setShowAddCompany(true)} className="mt-2 bg-[#2563EB] text-white rounded-[7px] px-4 py-2 text-[13px] font-medium hover:bg-[#1D4ED8] transition-colors">
              + Add your first company
            </button>
          ) : (
            <p className="text-[13px] text-[#94A3B8]">Companies will appear here once added by your manager</p>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white border-subtle rounded-[10px] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th style={{ width: 40 }}  className="px-4 py-2.5 text-left">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-3.5 h-3.5 accent-[#2563EB]" aria-label="Select all" />
                  </th>
                  <th style={{ width: 220 }} className="px-4 py-2.5 text-left text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Company Name</th>
                  <th style={{ width: 160 }} className="px-4 py-2.5 text-left text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Industry</th>
                  <th style={{ width: 150 }} className="px-4 py-2.5 text-left text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Location</th>
                  <th style={{ width: 100 }} className="px-4 py-2.5 text-center text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Active Jobs</th>
                  <th style={{ width: 110 }} className="px-4 py-2.5 text-left text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Status</th>
                  <th style={{ width: 120 }} className="px-4 py-2.5 text-left text-[10px] font-medium text-[#64748B] uppercase tracking-wide">Date Added</th>
                  <th style={{ width: 48 }}  className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => onNavigateToCompany(c.id)}
                    className="group border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="w-3.5 h-3.5 accent-[#2563EB]"
                        aria-label={`Select ${c.name}`}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        onClick={e => { e.stopPropagation(); onNavigateToCompany(c.id) }}
                        className="text-[13px] font-medium text-[#1E293B] hover:text-[#2563EB] cursor-pointer transition-colors"
                      >
                        {c.name}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-[#475569]">{c.industry}</td>
                    <td className="px-4 py-2.5 text-[13px] text-[#475569]">{c.location}</td>
                    <td className="px-4 py-2.5 text-center">
                      {(() => {
                        const cnt = jobs.filter(j => j.companyId === c.id && j.status === 'Open').length
                        return <span className={`text-[13px] ${cnt === 0 ? 'text-[#94A3B8]' : 'text-[#1E293B]'}`}>{cnt}</span>
                      })()}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#64748B]">{c.dateAdded}</td>
                    <td className="px-4 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={e => handleActionClick(e, c.id)}
                        className="p-1 rounded hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="w-4 h-4 text-[#94A3B8]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-[12px] text-[#64748B]">
          Showing 1–{filtered.length} of {companies.length} companies
        </span>
        <div className="flex items-center gap-1">
          <button type="button" disabled className="flex items-center gap-1 border-subtle rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#475569] bg-white disabled:opacity-40">
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          {[1, 2, 3].map(p => (
            <button key={p} type="button"
              className={`w-8 h-8 rounded-[6px] text-[12px] font-medium ${p === 1 ? 'bg-[#2563EB] text-white' : 'bg-white border-subtle text-[#475569] hover:bg-[#F8FAFC]'}`}>
              {p}
            </button>
          ))}
          <span className="text-[12px] text-[#94A3B8] px-1">...</span>
          <button type="button" className="w-8 h-8 rounded-[6px] text-[12px] font-medium bg-white border-subtle text-[#475569] hover:bg-[#F8FAFC]">5</button>
          <button type="button" className="flex items-center gap-1 border-subtle rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#475569] bg-white hover:bg-[#F8FAFC]">
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats panel */}
      {showStats && (
        <>
          <div className="fixed inset-0 bg-black/10 z-30" onClick={() => setShowStats(false)} />
          <div className="fixed top-0 right-0 h-full w-72 bg-white border-l border-[#E2E8F0] shadow-lg z-40 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] shrink-0">
              <h3 className="text-[14px] font-medium text-[#1E293B]">Stats Overview</h3>
              <button type="button" onClick={() => setShowStats(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>
            <div className="flex flex-col gap-3 p-4 overflow-y-auto">
              {[
                { label: 'Total Companies', value: '47', trend: '+5 this month'     },
                { label: 'Active',          value: '39', trend: '+3 this week'      },
                { label: 'Active Jobs',     value: '83', trend: '+12 vs last month' },
              ].map(s => (
                <div key={s.label} className="bg-[#F8FAFC] border-subtle rounded-[8px] p-3">
                  <p className="text-[11px] text-[#64748B] mb-1">{s.label}</p>
                  <p className="text-[20px] font-medium text-[#1E293B] leading-none mb-1">{s.value}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" aria-hidden="true" />
                    <span className="text-[11px] text-[#16A34A] font-medium">{s.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <AddCompanyModal
        isOpen={showAddCompany}
        onClose={() => setShowAddCompany(false)}
        onSave={c => { onAddCompany(c); setShowAddCompany(false) }}
        currentUser={currentUser}
      />

      {/* Action dropdown */}
      {actionDropdown && dropdownPos && (
        <div
          className="fixed z-50 bg-white border-subtle rounded-[8px] shadow-md py-1 w-44"
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
          onClick={e => e.stopPropagation()}
        >
          <button type="button" onClick={() => { onNavigateToCompany(actionDropdown); setActionDropdown(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#1E293B] hover:bg-slate-50">
            <Globe className="w-3.5 h-3.5 text-[#64748B]" />
            View profile
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
                Delete company
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
            <p className="text-[15px] font-semibold text-[#1E293B] mb-1">Delete company?</p>
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
                onClick={() => { onDeleteCompany(deleteConfirmId); setDeleteConfirmId(null) }}
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
