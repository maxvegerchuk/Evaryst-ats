import { useState, useRef, useEffect } from 'react'
import { useClickOutside } from '../hooks/useClickOutside'
import {
  ExternalLink, BarChart2, Plus, Search, ChevronDown,
  MoreHorizontal, User, Mail, Briefcase, Archive,
  TrendingUp, ChevronLeft, ChevronRight, Users, Star,
  RotateCcw, Trash2,
} from 'lucide-react'
import type { Candidate, CandidateStage } from '../types/candidate'
import { getInitials, getAvatarColor } from '../types/candidate'
import type { Contact, ContactStatus } from '../types/contact'

// ── Types ─────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = ['Date Added', 'Name (A-Z)', 'Last Contact', 'Status'] as const
type SortOption = typeof SORT_OPTIONS[number]

const STATUS_OPTIONS = ['All', 'New', 'Phone Screen', 'Interview', 'References', 'Submitted', 'Placed'] as const

const STATUS_STYLE: Record<CandidateStage, string> = {
  'New':          'bg-[#F1F5F9] text-[#475569]',
  'Phone Screen': 'bg-[#DBEAFE] text-[#1D4ED8]',
  'Interview':    'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]',
  'References':   'bg-[#F3E8FF] text-[#6D28D9]',
  'Submitted':    'bg-[#FFEDD5] text-[#9A3412]',
  'Placed':       'bg-[#DCFCE7] text-[#15803D]',
}

const CONTACT_STATUS_STYLE: Record<ContactStatus, string> = {
  'Active':   'bg-[#DCFCE7] text-[#15803D]',
  'Inactive': 'bg-[#F1F5F9] text-[#475569]',
  'Lead':     'bg-[#DBEAFE] text-[#1D4ED8]',
}

function sortCandidates(list: Candidate[], sort: SortOption): Candidate[] {
  const s = [...list]
  if (sort === 'Name (A-Z)')   s.sort((a, b) => a.name.localeCompare(b.name))
  if (sort === 'Status')       s.sort((a, b) => a.stage.localeCompare(b.stage))
  if (sort === 'Last Contact') s.sort((a, b) => b.addedDate.localeCompare(a.addedDate))
  return s
}

// ── Component ─────────────────────────────────────────────────────────────────

interface CandidatesPageProps {
  onNavigateToCandidate:          (id: string) => void
  onNavigateToMultipleCandidates: (ids: string[]) => void
  candidates:                     Candidate[]
  onAddCandidate:                 () => void
  onToggleStar:                   (id: string) => void
  isManager?:                     boolean
  contacts:                       Contact[]
  onAddContact:                   (c: Contact) => void
  onDeleteContact:                (id: string) => void
  archivedCandidates:             Candidate[]
  onArchiveCandidate:             (id: string) => void
  onRestoreCandidate:             (id: string) => void
  onDeleteCandidate:              (id: string) => void
  currentUser?:                   { id: string; name?: string }
}

export function CandidatesPage({
  onNavigateToCandidate, onNavigateToMultipleCandidates,
  candidates, onAddCandidate, onToggleStar, isManager,
  contacts, onAddContact, onDeleteContact,
  archivedCandidates, onArchiveCandidate, onRestoreCandidate, onDeleteCandidate,
}: CandidatesPageProps) {
  // ── Candidates state ───────────────────────────────────────────────────────
  const [search,           setSearch]           = useState('')
  const [sortBy,           setSortBy]           = useState<SortOption>('Date Added')
  const [statusFilter,     setStatusFilter]     = useState('All')
  const [openFilter,       setOpenFilter]       = useState<'status' | 'recruiter' | null>(null)
  const [recruiterFilter,  setRecruiterFilter]  = useState('All')
  const [selected,         setSelected]         = useState<Set<string>>(new Set())
  const [showStats,        setShowStats]        = useState(false)
  const [actionDropdown,   setActionDropdown]   = useState<string | null>(null)
  const [dropdownPos,      setDropdownPos]      = useState<{ top: number; right: number } | null>(null)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [archiveName,      setArchiveName]      = useState('')

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState<'candidates' | 'clients'>('candidates')
  const [showArchived, setShowArchived] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // ── Contacts state ─────────────────────────────────────────────────────────
  const [contactSearch,  setContactSearch]  = useState('')
  const [contactSort,    setContactSort]    = useState<'Name (A-Z)' | 'Company' | 'Last Contact'>('Name (A-Z)')
  const [contactSelected, setContactSelected] = useState<Set<string>>(new Set())
  const [showAddContact,  setShowAddContact]  = useState(false)
  const [newContact,      setNewContact]      = useState<Partial<Contact>>({ status: 'Lead' })

  const filterRef = useRef<HTMLDivElement>(null)

  useClickOutside(filterRef, () => setOpenFilter(null), openFilter !== null)

  useEffect(() => {
    if (!actionDropdown) return
    function handler() { setActionDropdown(null); setDropdownPos(null) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [actionDropdown])

  // ── Candidates computed ────────────────────────────────────────────────────
  const displayCandidates = showArchived ? archivedCandidates : candidates

  const recruiterNames = isManager
    ? ['All', ...Array.from(new Set(candidates.map(c => c.ownerName ?? 'Unknown'))).sort()]
    : []

  const filtered = sortCandidates(
    displayCandidates.filter(c => {
      const q = search.toLowerCase()
      const matchSearch    = !q || c.name.toLowerCase().includes(q) || c.specialty.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)
      const matchStatus    = showArchived || statusFilter === 'All' || c.stage === (statusFilter as CandidateStage)
      const matchRecruiter = showArchived || !isManager || recruiterFilter === 'All' || (c.ownerName ?? 'Unknown') === recruiterFilter
      return matchSearch && matchStatus && matchRecruiter
    }),
    sortBy,
  )

  const allSelected = filtered.length > 0 && selected.size === filtered.length

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
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

  // ── Contacts computed ──────────────────────────────────────────────────────
  const filteredContacts = [...contacts]
    .filter(c => {
      const q = contactSearch.toLowerCase()
      return !q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (contactSort === 'Name (A-Z)')   return a.name.localeCompare(b.name)
      if (contactSort === 'Company')      return a.company.localeCompare(b.company)
      if (contactSort === 'Last Contact') return b.lastContact.localeCompare(a.lastContact)
      return 0
    })

  const allContactsSelected = filteredContacts.length > 0 && contactSelected.size === filteredContacts.length

  function toggleContactSelect(id: string) {
    setContactSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function handleSaveContact() {
    if (!newContact.name?.trim() || !newContact.email?.trim()) return
    const c: Contact = {
      id:          crypto.randomUUID(),
      name:        newContact.name?.trim() ?? '',
      title:       newContact.title?.trim() ?? '',
      company:     newContact.company?.trim() ?? '',
      phone:       newContact.phone?.trim() ?? '',
      email:       newContact.email?.trim() ?? '',
      status:      newContact.status ?? 'Lead',
      lastContact: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
    }
    onAddContact(c)
    setNewContact({ status: 'Lead' })
    setShowAddContact(false)
  }

  const isEmpty = displayCandidates.length === 0

  // ── Shared tab button style ────────────────────────────────────────────────
  function tabCls(tab: 'candidates' | 'clients') {
    return `px-4 py-2.5 text-[13px] border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-[#2563EB] text-[#2563EB] font-medium'
        : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
    }`
  }

  const INP = 'w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white placeholder:text-[#94A3B8]'
  const INP_ST = { border: '0.5px solid #E2E8F0', padding: '7px 10px' }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <h1 className="text-[24px] font-semibold text-[#1E293B] mb-4">People</h1>

      {/* Manager tabs */}
      {isManager && (
        <div className="flex border-b border-[#E2E8F0] mb-4">
          <button type="button" onClick={() => setActiveTab('candidates')} className={tabCls('candidates')}>
            Candidates
          </button>
          <button type="button" onClick={() => setActiveTab('clients')} className={tabCls('clients')}>
            Clients
          </button>
        </div>
      )}

      {/* ── CANDIDATES TAB ─────────────────────────────────────────────────── */}
      {(!isManager || activeTab === 'candidates') && (
        <>
          {/* Toolbar */}
          {selected.size > 0 ? (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-[#1E293B]">
                  {selected.size} candidate{selected.size !== 1 ? 's' : ''} selected
                </span>
                <button type="button" className="flex items-center gap-1.5 border-subtle bg-white rounded-[7px] px-3 py-1.5 text-[12px] text-[#475569] hover:bg-[#F8FAFC] transition-colors">
                  Email
                </button>
                <button type="button" className="flex items-center gap-1.5 border-subtle bg-white rounded-[7px] px-3 py-1.5 text-[12px] text-[#475569] hover:bg-[#F8FAFC] transition-colors">
                  Export
                </button>
                <button type="button" onClick={() => setSelected(new Set())} className="text-[12px] text-[#64748B] hover:text-[#1E293B] transition-colors">
                  Clear
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  const ids = [...selected]
                  setSelected(new Set())
                  onNavigateToMultipleCandidates(ids)
                }}
                className="flex items-center gap-1.5 bg-[#2563EB] text-white rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-blue-700 transition-colors"
              >
                View Profiles ({selected.size})
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button type="button" className="flex items-center gap-1.5 border-subtle bg-white rounded-[7px] px-3 py-1.5 text-[12px] text-[#475569] hover:bg-[#F8FAFC] transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Export
                </button>
                <button
                  type="button"
                  onClick={() => setShowStats(v => !v)}
                  className={`flex items-center gap-1.5 border rounded-[7px] px-3 py-1.5 text-[12px] transition-colors ${
                    showStats ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]' : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  Stats Overview
                </button>
                <button
                  type="button"
                  onClick={() => { setShowArchived(v => !v); setSearch('') }}
                  className={`flex items-center gap-1.5 border rounded-[7px] px-3 py-1.5 text-[12px] transition-colors ${
                    showArchived
                      ? 'border-[#F59E0B] bg-[#FEF3C7] text-[#92400E]'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  {showArchived ? `Archived (${archivedCandidates.length})` : 'Archived'}
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
                <button
                  type="button"
                  onClick={onAddCandidate}
                  className="flex items-center gap-1.5 bg-[#2563EB] text-white rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Candidate
                </button>
              </div>
            </div>
          )}

          {/* Archived banner */}
          {showArchived && (
            <div className="flex items-center px-3 py-2 mb-3 rounded-[8px] text-[12px] text-[#92400E]" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
              <Archive className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              Showing archived candidates
              <button type="button" onClick={() => setShowArchived(false)} className="ml-auto text-[#2563EB] hover:underline font-medium">
                Back to active
              </button>
            </div>
          )}

          {/* Search + filter row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search candidates by name, title, location..."
                className="w-full pl-9 pr-3 text-[12px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none bg-white rounded-[7px]"
                style={{ border: '0.5px solid #E2E8F0', paddingTop: 6, paddingBottom: 6 }}
              />
            </div>
            <div ref={filterRef} className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenFilter(openFilter === 'status' ? null : 'status')}
                  className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                    statusFilter !== 'All' ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]' : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
                  }`}
                >
                  Status: {statusFilter}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {openFilter === 'status' && (
                  <div className="absolute top-full left-0 mt-1 bg-white border-subtle rounded-[7px] shadow-md z-20 min-w-[140px] py-1">
                    {STATUS_OPTIONS.map(o => (
                      <button key={o} type="button" onClick={() => { setStatusFilter(o); setOpenFilter(null) }}
                        className={`flex w-full px-3 py-1.5 text-[12px] hover:bg-slate-50 text-left ${statusFilter === o ? 'text-[#2563EB] font-medium' : 'text-[#1E293B]'}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {isManager && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenFilter(openFilter === 'recruiter' ? null : 'recruiter')}
                    className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                      recruiterFilter !== 'All' ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]' : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    Recruiter: {recruiterFilter}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {openFilter === 'recruiter' && (
                    <div className="absolute top-full left-0 mt-1 bg-white border-subtle rounded-[7px] shadow-md z-20 min-w-[160px] py-1">
                      {recruiterNames.map(o => (
                        <button key={o} type="button" onClick={() => { setRecruiterFilter(o); setOpenFilter(null) }}
                          className={`flex w-full px-3 py-1.5 text-[12px] hover:bg-slate-50 text-left ${recruiterFilter === o ? 'text-[#2563EB] font-medium' : 'text-[#1E293B]'}`}>
                          {o}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border-subtle rounded-[10px] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th style={{ width: 40 }} className="px-4 py-2.5 text-left">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-3.5 h-3.5 accent-[#2563EB]" aria-label="Select all" />
                  </th>
                  <th style={{ width: 200 }} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Name</th>
                  <th style={{ width: 160 }} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Job Title</th>
                  <th style={{ width: 140 }} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Location</th>
                  <th style={{ width: 80 }}  className="px-4 py-2.5 text-center text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Jobs</th>
                  <th style={{ width: 100 }} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Work Type</th>
                  <th style={{ width: 130 }} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Status</th>
                  <th style={{ width: 120 }} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Last Contact</th>
                  {isManager && (
                    <th style={{ width: 130 }} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Recruiter</th>
                  )}
                  <th style={{ width: 36 }}  className="px-2 py-2.5" />
                  <th style={{ width: 48 }}  className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {isEmpty ? (
                  <tr>
                    <td colSpan={isManager ? 11 : 10}>
                      <div className="flex flex-col items-center py-16">
                        <Users className="w-12 h-12 text-[#E2E8F0] mb-3" />
                        <p className="text-[15px] font-medium text-[#1E293B] mb-1">No candidates yet</p>
                        <p className="text-[13px] text-[#94A3B8] mb-4">Add your first candidate to start building your pipeline</p>
                        <button type="button" onClick={onAddCandidate} className="bg-[#2563EB] text-white rounded-[7px] px-4 py-2 text-[12px] font-medium hover:bg-blue-700 transition-colors">
                          + Add Candidate
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(c => {
                  const { bg, clr } = getAvatarColor(c.id)
                  return (
                    <tr key={c.id} onClick={() => onNavigateToCandidate(c.id)}
                      className="group border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] cursor-pointer transition-colors">
                      <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="w-3.5 h-3.5 accent-[#2563EB]" />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold" style={{ backgroundColor: bg, color: clr }}>
                            {getInitials(c.name)}
                          </div>
                          <span onClick={e => { e.stopPropagation(); onNavigateToCandidate(c.id) }}
                            className="text-[13px] font-medium text-[#1E293B] hover:text-[#2563EB] cursor-pointer transition-colors truncate">
                            {c.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-[13px] text-[#475569]">{c.specialty}</td>
                      <td className="px-4 py-2.5 text-[13px] text-[#475569]">{c.location || '—'}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-[13px] text-[#94A3B8]">0</span>
                      </td>
                      <td className="px-4 py-2.5">
                        {c.workType ? (
                          <div className="flex flex-wrap gap-1">
                            {c.workType.split(',').map(s => s.trim()).filter(Boolean).map(t => (
                              <span key={t} className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md ${
                                t === 'Full-Time'        ? 'bg-[#DBEAFE] text-[#1D4ED8]' :
                                t === 'Contract'         ? 'bg-[#FFEDD5] text-[#9A3412]' :
                                t === 'Part-Time'        ? 'bg-[#F1F5F9] text-[#475569]' :
                                t === 'Contract to Hire' ? 'bg-[#F3E8FF] text-[#6D28D9]' :
                                'bg-[#F1F5F9] text-[#475569]'
                              }`}>{t}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[13px] text-[#94A3B8]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[c.stage]}`}>
                          {c.stage}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#64748B]">{c.addedDate}</td>
                      {isManager && (
                        <td className="px-4 py-2.5 text-[12px] text-[#64748B]">{c.ownerName ?? '—'}</td>
                      )}
                      <td className="px-2 py-2.5 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onToggleStar(c.id)}
                          aria-label={c.starred ? 'Remove from favorites' : 'Add to favorites'}
                          className="p-1 rounded hover:bg-slate-100 transition-colors"
                        >
                          <Star
                            className="w-3.5 h-3.5 transition-colors"
                            style={c.starred
                              ? { color: '#F59E0B', fill: '#F59E0B' }
                              : { color: '#CBD5E1', fill: 'none' }
                            }
                          />
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                        <button type="button" onClick={e => handleActionClick(e, c.id)}
                          className="p-1 rounded hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="More actions">
                          <MoreHorizontal className="w-4 h-4 text-[#94A3B8]" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isEmpty && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-[12px] text-[#64748B]">
                Showing 1–{filtered.length} of {candidates.length} candidates
              </span>
              <div className="flex items-center gap-1">
                <button type="button" disabled className="flex items-center gap-1 border-subtle rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#475569] bg-white disabled:opacity-40">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button type="button" className="w-8 h-8 rounded-[6px] text-[12px] font-medium bg-[#2563EB] text-white">1</button>
                <button type="button" className="flex items-center gap-1 border-subtle rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#475569] bg-white hover:bg-[#F8FAFC]">
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Stats panel */}
          {showStats && (
            <>
              <div className="fixed inset-0 bg-black/10 z-30" onClick={() => setShowStats(false)} />
              <div className="fixed top-0 right-0 h-full w-72 bg-white border-l border-[#E2E8F0] shadow-lg z-40 flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] shrink-0">
                  <h3 className="text-[14px] font-medium text-[#1E293B]">Stats Overview</h3>
                  <button type="button" onClick={() => setShowStats(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100">
                    <Archive className="w-4 h-4 text-[#64748B]" />
                  </button>
                </div>
                <div className="flex flex-col gap-3 p-4 overflow-y-auto">
                  {[
                    { label: 'Total Candidates', value: candidates.length },
                    { label: 'New',      value: candidates.filter(c => c.stage === 'New').length },
                    { label: 'Placed',   value: candidates.filter(c => c.stage === 'Placed').length },
                    { label: 'Submitted', value: candidates.filter(c => c.stage === 'Submitted').length },
                    { label: 'Archived', value: archivedCandidates.length },
                  ].map(s => (
                    <div key={s.label} className="bg-[#F8FAFC] border-subtle rounded-[8px] p-3">
                      <p className="text-[11px] text-[#64748B] mb-1">{s.label}</p>
                      <p className="text-[20px] font-medium text-[#1E293B] leading-none mb-1">{s.value}</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action dropdown */}
          {actionDropdown && dropdownPos && (
            <div className="fixed z-50 bg-white border-subtle rounded-[8px] shadow-md py-1 w-48"
              style={{ top: dropdownPos.top, right: dropdownPos.right }}
              onClick={e => e.stopPropagation()}>
              {showArchived ? (
                <>
                  <button type="button"
                    onClick={() => { onRestoreCandidate(actionDropdown!); setActionDropdown(null) }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#2563EB] hover:bg-blue-50">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore candidate
                  </button>
                  <div className="mx-3 my-1 h-px bg-[#F1F5F9]" />
                  <button type="button"
                    onClick={() => { setDeleteConfirmId(actionDropdown!); setActionDropdown(null) }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#DC2626] hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete permanently
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => { onNavigateToCandidate(actionDropdown!); setActionDropdown(null) }} className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#1E293B] hover:bg-slate-50">
                    <User className="w-3.5 h-3.5 text-[#64748B]" />
                    View profile
                  </button>
                  <button type="button" className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#1E293B] hover:bg-slate-50">
                    <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                    Send email
                  </button>
                  <button type="button" className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#1E293B] hover:bg-slate-50">
                    <Briefcase className="w-3.5 h-3.5 text-[#64748B]" />
                    Add to job
                  </button>
                  <div className="mx-3 my-1 h-px bg-[#F1F5F9]" />
                  <button type="button"
                    onClick={() => { const c = candidates.find(x => x.id === actionDropdown); setArchiveName(c?.name ?? ''); setShowArchiveModal(true); setActionDropdown(null) }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#DC2626] hover:bg-red-50">
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </button>
                </>
              )}
            </div>
          )}

          {/* Archive modal */}
          {showArchiveModal && (
            <div className="fixed inset-0 bg-black/20 z-50 flex items-start justify-center pt-20">
              <div className="bg-white rounded-[10px] shadow-lg p-6 w-[380px]" style={{ border: '0.5px solid #E2E8F0' }}>
                <h3 className="text-[15px] font-semibold text-[#1E293B] mb-2">Archive candidate?</h3>
                <p className="text-[12px] text-[#64748B] mb-5" style={{ lineHeight: 1.5 }}>
                  {archiveName} will be moved to your archive. You can restore them from the People page at any time.
                </p>
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={() => setShowArchiveModal(false)} className="px-4 py-1.5 text-[12px] text-[#475569] bg-white rounded-[7px] hover:bg-[#F8FAFC]" style={{ border: '0.5px solid #E2E8F0' }}>Cancel</button>
                  <button
                    onClick={() => {
                      const c = candidates.find(x => x.name === archiveName)
                      if (c) onArchiveCandidate(c.id)
                      setShowArchiveModal(false)
                    }}
                    className="px-4 py-1.5 text-[12px] font-medium text-white bg-[#DC2626] rounded-[7px] hover:bg-[#B91C1C]">
                    Archive
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete permanently modal */}
          {deleteConfirmId && (
            <div className="fixed inset-0 bg-black/20 z-50 flex items-start justify-center pt-20">
              <div className="bg-white rounded-[10px] shadow-lg p-6 w-[380px]" style={{ border: '0.5px solid #E2E8F0' }}>
                <h3 className="text-[15px] font-semibold text-[#1E293B] mb-2">Delete permanently?</h3>
                <p className="text-[12px] text-[#64748B] mb-5" style={{ lineHeight: 1.5 }}>
                  This will permanently delete this candidate and cannot be undone.
                </p>
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-1.5 text-[12px] text-[#475569] bg-white rounded-[7px] hover:bg-[#F8FAFC]" style={{ border: '0.5px solid #E2E8F0' }}>Cancel</button>
                  <button
                    onClick={() => { onDeleteCandidate(deleteConfirmId); setDeleteConfirmId(null) }}
                    className="px-4 py-1.5 text-[12px] font-medium text-white bg-[#DC2626] rounded-[7px] hover:bg-[#B91C1C]">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── CLIENTS TAB ────────────────────────────────────────────────────── */}
      {isManager && activeTab === 'clients' && (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button type="button" className="flex items-center gap-1.5 border-subtle bg-white rounded-[7px] px-3 py-1.5 text-[12px] text-[#475569] hover:bg-[#F8FAFC] transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#64748B]">Sort by:</span>
                <select
                  value={contactSort}
                  onChange={e => setContactSort(e.target.value as typeof contactSort)}
                  className="text-[12px] text-[#1E293B] bg-white rounded-[7px] outline-none cursor-pointer hover:bg-[#F8FAFC]"
                  style={{ border: '0.5px solid #E2E8F0', padding: '6px 28px 6px 10px' }}
                >
                  {(['Name (A-Z)', 'Company', 'Last Contact'] as const).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowAddContact(v => !v)}
                className="flex items-center gap-1.5 bg-[#2563EB] text-white rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Client
              </button>
            </div>
          </div>

          {/* Inline add-contact form */}
          {showAddContact && (
            <div className="bg-[#F8FAFC] border-subtle rounded-[10px] p-4 mb-4">
              <p className="text-[13px] font-medium text-[#1E293B] mb-3">New client</p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] text-[#475569] mb-1">Full name *</label>
                  <input value={newContact.name ?? ''} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} placeholder="Jane Doe" className={INP} style={INP_ST} />
                </div>
                <div>
                  <label className="block text-[11px] text-[#475569] mb-1">Email *</label>
                  <input type="email" value={newContact.email ?? ''} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} placeholder="jane@company.com" className={INP} style={INP_ST} />
                </div>
                <div>
                  <label className="block text-[11px] text-[#475569] mb-1">Phone</label>
                  <input value={newContact.phone ?? ''} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 000-0000" className={INP} style={INP_ST} />
                </div>
                <div>
                  <label className="block text-[11px] text-[#475569] mb-1">Title</label>
                  <input value={newContact.title ?? ''} onChange={e => setNewContact(p => ({ ...p, title: e.target.value }))} placeholder="HR Director" className={INP} style={INP_ST} />
                </div>
                <div>
                  <label className="block text-[11px] text-[#475569] mb-1">Company</label>
                  <input value={newContact.company ?? ''} onChange={e => setNewContact(p => ({ ...p, company: e.target.value }))} placeholder="Acme Corp" className={INP} style={INP_ST} />
                </div>
                <div>
                  <label className="block text-[11px] text-[#475569] mb-1">Status</label>
                  <select value={newContact.status} onChange={e => setNewContact(p => ({ ...p, status: e.target.value as ContactStatus }))}
                    className="w-full text-[12px] text-[#1E293B] bg-white rounded-[7px] focus:outline-none cursor-pointer" style={INP_ST}>
                    <option value="Lead">Lead</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button type="button" onClick={() => { setShowAddContact(false); setNewContact({ status: 'Lead' }) }}
                  className="px-4 py-1.5 text-[12px] text-[#475569] bg-white rounded-[7px] hover:bg-[#F8FAFC]" style={{ border: '0.5px solid #E2E8F0' }}>
                  Cancel
                </button>
                <button type="button" onClick={handleSaveContact}
                  disabled={!newContact.name?.trim() || !newContact.email?.trim()}
                  className="px-4 py-1.5 text-[12px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
                  Save client
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
              <input
                type="text"
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                placeholder="Search contacts by name, company, email..."
                className="w-full pl-9 pr-3 text-[12px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none bg-white rounded-[7px]"
                style={{ border: '0.5px solid #E2E8F0', paddingTop: 6, paddingBottom: 6 }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border-subtle rounded-[10px] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th style={{ width: 40 }} className="px-4 py-2.5 text-left">
                    <input type="checkbox" checked={allContactsSelected}
                      onChange={() => setContactSelected(allContactsSelected ? new Set() : new Set(filteredContacts.map(c => c.id)))}
                      className="w-3.5 h-3.5 accent-[#2563EB]" />
                  </th>
                  <th style={{ width: 180 }} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Name</th>
                  <th style={{ width: 150 }} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Title</th>
                  <th style={{ width: 150 }} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Company</th>
                  <th style={{ width: 130 }} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Phone</th>
                  <th style={{ width: 180 }} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Email</th>
                  <th style={{ width: 100 }} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Status</th>
                  <th style={{ width: 120 }} className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase tracking-wide">Last Contact</th>
                  <th style={{ width: 48 }}  className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="flex flex-col items-center py-16">
                        <Users className="w-12 h-12 text-[#E2E8F0] mb-3" />
                        <p className="text-[15px] font-medium text-[#1E293B] mb-1">No clients yet</p>
                        <p className="text-[13px] text-[#94A3B8] mb-4">Add clients from company pages or directly here</p>
                        <button type="button" onClick={() => setShowAddContact(true)} className="bg-[#2563EB] text-white rounded-[7px] px-4 py-2 text-[12px] font-medium hover:bg-blue-700 transition-colors">
                          + Add Client
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredContacts.map(c => {
                  const { bg, clr } = getAvatarColor(c.id)
                  return (
                    <tr key={c.id} className="group border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={contactSelected.has(c.id)} onChange={() => toggleContactSelect(c.id)} className="w-3.5 h-3.5 accent-[#2563EB]" />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold" style={{ backgroundColor: bg, color: clr }}>
                            {getInitials(c.name)}
                          </div>
                          <span className="text-[13px] font-medium text-[#1E293B] truncate">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-[13px] text-[#475569]">{c.title || '—'}</td>
                      <td className="px-4 py-2.5 text-[13px] text-[#475569]">{c.company || '—'}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#475569]">{c.phone || '—'}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#475569]">{c.email}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${CONTACT_STATUS_STYLE[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#64748B]">{c.lastContact}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button type="button"
                          onClick={() => onDeleteContact(c.id)}
                          className="p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity text-[#94A3B8] hover:text-[#DC2626]"
                          aria-label="Remove contact">
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Contacts pagination hint */}
          {filteredContacts.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-[12px] text-[#64748B]">
                Showing {filteredContacts.length} of {contacts.length} clients
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
