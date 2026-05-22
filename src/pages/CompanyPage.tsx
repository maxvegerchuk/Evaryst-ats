import { useState } from 'react'
import {
  ChevronLeft, ChevronRight, MoreHorizontal,
  Mail, Phone, Globe, Settings, Plus, Briefcase,
  Download, X, FilePlus, FileText, Send, Users,
} from 'lucide-react'
import { formatPhone } from '../utils/formatPhone'
import type { Company } from '../types/company'
import type { Job } from '../types/job'
import type { Contact } from '../types/contact'
import { AddJobModal } from '../components/ui/AddJobModal'

// ── Constants ──────────────────────────────────────────────────────────────────

const ICON_BTN   = 'w-[30px] h-[30px] flex items-center justify-center border-subtle rounded-[7px] bg-white hover:bg-[#F8FAFC] transition-colors flex-shrink-0'
const INFO_LABEL = 'text-[10px] uppercase text-[#94A3B8] font-medium tracking-[0.05em] mb-2'

type CompanyTab = 'jobs' | 'clients' | 'documents'

const JOB_STATUS_STYLE: Record<string, { bg: string; clr: string }> = {
  'Open':    { bg: '#DCFCE7', clr: '#15803D' },
  'On Hold': { bg: '#FEF3C7', clr: '#92400E' },
  'Closed':  { bg: '#F1F5F9', clr: '#475569' },
}

// ── Component ──────────────────────────────────────────────────────────────────

interface Recruiter { id: string; email: string; role: string }

interface CompanyPageProps {
  setCurrentPage:  (page: string) => void
  onNavigateToJob: (id: string) => void
  isManager?:      boolean
  company:         Company | null
  jobs:            Job[]
  allCompanies:    Company[]
  recruiters:      Recruiter[]
  onAddJob:        (job: Job) => void
  contacts:        Contact[]
  onAddContact:    (c: Contact) => void
  onDeleteContact: (id: string) => void
}

export function CompanyPage({ setCurrentPage, onNavigateToJob, isManager, company, jobs, allCompanies, recruiters, onAddJob, contacts, onAddContact, onDeleteContact }: CompanyPageProps) {
  const [activeTab,      setActiveTab]      = useState<CompanyTab>('jobs')
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [showAddJob,     setShowAddJob]     = useState(false)
  const [docs, setDocs] = useState<{ name: string; type: string; date: string }[]>([])
  const [showAddContact, setShowAddContact] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', title: '', email: '', phone: '' })

  const companyClients = contacts.filter(c => c.companyId === company?.id)

  const companyName = company?.name ?? 'Unknown Company'

  // ── Jobs tab ─────────────────────────────────────────────────────────────────

  const jobsTab = (
    <div className="p-4">
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Briefcase className="w-12 h-12 text-[#E2E8F0] mb-3" />
          <p className="text-[15px] font-medium text-[#1E293B] mb-1">No jobs yet</p>
          <p className="text-[13px] text-[#94A3B8] mb-4">Add the first job opening for this company</p>
          {isManager && (
            <button type="button" onClick={() => setShowAddJob(true)}
              className="bg-[#2563EB] text-white rounded-[7px] px-4 py-2 text-[13px] font-medium hover:bg-[#1D4ED8] transition-colors">
              + Add Job
            </button>
          )}
        </div>
      ) : (
        <>
          {isManager && (
            <div className="flex justify-end mb-3">
              <button type="button" onClick={() => setShowAddJob(true)}
                className="flex items-center gap-1.5 bg-[#2563EB] text-white rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#1D4ED8] transition-colors">
                <Plus size={13} /> Add Job
              </button>
            </div>
          )}
          <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
                {['Client Req No.', 'Job Title', 'Status', 'Recruiter'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase text-[#64748B] font-medium" style={{ padding: '8px 16px', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((j, i) => {
                const st = JOB_STATUS_STYLE[j.status] ?? { bg: '#F1F5F9', clr: '#475569' }
                return (
                  <tr
                    key={j.id}
                    onClick={() => onNavigateToJob(j.id)}
                    className="group hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                    style={{ borderBottom: i < jobs.length - 1 ? '0.5px solid #F1F5F9' : undefined }}
                  >
                    <td style={{ padding: '10px 16px' }}>
                      <span className="text-[12px] text-[#2563EB] hover:underline">{j.clientReqNumber || '—'}</span>
                    </td>
                    <td className="text-[12px] font-medium text-[#1E293B] hover:text-[#2563EB] transition-colors" style={{ padding: '10px 16px' }}>{j.title}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.clr }}>{j.status}</span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span className="text-[12px] text-[#475569]">{j.assignedRecruiterName || '—'}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  )

  // ── Clients tab ───────────────────────────────────────────────────────────────

  function saveClient() {
    if (!newContact.name.trim()) return
    const c: Contact = {
      id:          'cnt-' + Date.now(),
      name:        newContact.name.trim(),
      title:       newContact.title.trim(),
      company:     company?.name ?? '',
      companyId:   company?.id,
      phone:       newContact.phone.trim(),
      email:       newContact.email.trim(),
      status:      'Active',
      lastContact: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
    }
    onAddContact(c)
    setNewContact({ name: '', title: '', email: '', phone: '' })
    setShowAddContact(false)
  }

  const INP = 'w-full text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white placeholder:text-[#94A3B8]'
  const INP_ST: React.CSSProperties = { border: '0.5px solid #E2E8F0', padding: '7px 10px' }

  const clientsTab = (
    <div className="p-4">
      {companyClients.length === 0 && !showAddContact ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Users className="w-12 h-12 text-[#E2E8F0] mb-3" />
          <p className="text-[15px] font-medium text-[#1E293B] mb-1">No clients yet</p>
          <p className="text-[13px] text-[#94A3B8] mb-4">Add the hiring managers and client contacts for this company</p>
          <button type="button" onClick={() => setShowAddContact(true)}
            className="bg-[#2563EB] text-white rounded-[7px] px-4 py-2 text-[13px] font-medium hover:bg-[#1D4ED8] transition-colors">
            + Add Client
          </button>
        </div>
      ) : (
        <>
          {companyClients.length > 0 && (
            <>
              <div className="flex justify-end mb-3">
                <button type="button" onClick={() => setShowAddContact(true)}
                  className="flex items-center gap-1.5 bg-[#2563EB] text-white rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#1D4ED8] transition-colors">
                  <Plus size={13} /> Add Client
                </button>
              </div>
              <div className="bg-white rounded-[10px] overflow-hidden mb-3" style={{ border: '0.5px solid #E2E8F0' }}>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
                      {['Name', 'Title', 'Email', 'Phone', ''].map(h => (
                        <th key={h} className="text-left text-[10px] uppercase text-[#64748B] font-medium" style={{ padding: '8px 16px', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {companyClients.map((c, i) => (
                      <tr key={c.id} className="group hover:bg-[#F8FAFC] transition-colors" style={{ borderBottom: i < companyClients.length - 1 ? '0.5px solid #F1F5F9' : undefined }}>
                        <td className="text-[12px] font-medium text-[#1E293B]" style={{ padding: '10px 16px' }}>{c.name}</td>
                        <td className="text-[12px] text-[#475569]" style={{ padding: '10px 16px' }}>{c.title || '—'}</td>
                        <td style={{ padding: '10px 16px' }}>
                          {c.email ? <a href={`mailto:${c.email}`} className="text-[12px] text-[#2563EB] hover:underline">{c.email}</a> : <span className="text-[12px] text-[#94A3B8]">—</span>}
                        </td>
                        <td className="text-[12px] text-[#475569]" style={{ padding: '10px 16px' }}>{c.phone || '—'}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <button type="button" onClick={() => onDeleteContact(c.id)}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove">
                            <X className="w-3.5 h-3.5 text-[#64748B]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {showAddContact && (
            <div className="bg-white rounded-[10px] p-4" style={{ border: '0.5px solid #E2E8F0' }}>
              <p className="text-[13px] font-medium text-[#1E293B] mb-3">New client</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#475569] mb-1">Name *</label>
                  <input value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} placeholder="Jane Smith" className={INP} style={INP_ST} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#475569] mb-1">Title</label>
                  <input value={newContact.title} onChange={e => setNewContact(p => ({ ...p, title: e.target.value }))} placeholder="HR Manager" className={INP} style={INP_ST} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#475569] mb-1">Email</label>
                  <input value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} placeholder="jane@company.com" className={INP} style={INP_ST} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#475569] mb-1">Phone</label>
                  <input value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: formatPhone(e.target.value) }))} placeholder="(555) 000-0000" className={INP} style={INP_ST} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowAddContact(false); setNewContact({ name: '', title: '', email: '', phone: '' }) }}
                  className="px-3 py-1.5 text-[12px] font-medium text-[#475569] bg-white rounded-[7px] hover:bg-[#F8FAFC]" style={{ border: '0.5px solid #E2E8F0' }}>
                  Cancel
                </button>
                <button type="button" onClick={saveClient} disabled={!newContact.name.trim()}
                  className="px-3 py-1.5 text-[12px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Add
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )

  // ── Documents tab ─────────────────────────────────────────────────────────────

  const documentsTab = (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        {([
          ['Add From File',       FilePlus],
          ['Add Active Word Doc', FileText],
          ['Email Document',      Send    ],
        ] as [string, React.ElementType][]).map(([label, Icon]) => (
          <button key={label} type="button" className="flex items-center gap-1.5 border-subtle bg-white rounded-[7px] px-3 py-1.5 text-[12px] text-[#475569] hover:bg-[#F8FAFC] transition-colors">
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
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
            {docs.map((d, i) => (
              <tr key={i} className="group hover:bg-[#F8FAFC] transition-colors" style={{ borderBottom: i < docs.length - 1 ? '0.5px solid #F1F5F9' : undefined }}>
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
                    <button type="button" onClick={() => setDocs(prev => prev.filter(x => x.name !== d.name))} className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove">
                      <X className="w-3.5 h-3.5 text-[#64748B]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F8FAFC]">

      {/* ROW 1: Breadcrumbs */}
      <div
        className="h-[34px] bg-white flex items-center px-4 flex-shrink-0"
        style={{ borderBottom: '0.5px solid #E2E8F0' }}
      >
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage('companies')}
            className="flex items-center gap-0.5 text-[12px] text-[#2563EB] hover:underline"
          >
            <ChevronLeft size={13} />
            Companies
          </button>
          <span className="text-[12px] text-[#94A3B8]">›</span>
          <span className="text-[12px] text-[#64748B]">{companyName}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setCurrentPage('companies')} className="flex items-center gap-0.5 px-2 py-1 text-[11px] text-[#64748B] rounded-md hover:bg-[#F8FAFC]" style={{ border: '0.5px solid #E2E8F0' }}>
            <ChevronLeft size={11} /> Prev
          </button>
          <button onClick={() => setCurrentPage('companies')} className="flex items-center gap-0.5 px-2 py-1 text-[11px] text-[#64748B] rounded-md hover:bg-[#F8FAFC]" style={{ border: '0.5px solid #E2E8F0' }}>
            Next <ChevronRight size={11} />
          </button>
        </div>
      </div>

      {/* Everything below breadcrumbs scrolls together */}
      <div className="flex-1 overflow-y-auto">

      {/* ROW 2: Name + Actions */}
      <div className="bg-white flex items-center px-4 gap-2" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <span className="text-[18px] font-medium text-[#1E293B] flex-1">{companyName}</span>
        {isManager ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusMenuOpen(v => !v)}
              className="flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-full cursor-pointer"
              style={{ background: company?.status === 'Active' ? '#DCFCE7' : company?.status === 'Paused' ? '#FEF3C7' : '#DBEAFE', color: company?.status === 'Active' ? '#15803D' : company?.status === 'Paused' ? '#92400E' : '#1D4ED8', border: '1px solid #BBF7D0' }}
            >
              {company?.status ?? 'Active'}
              <ChevronRight size={10} className="rotate-90" />
            </button>
            {statusMenuOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-[8px] shadow-md z-50 py-1 min-w-[140px]" style={{ border: '0.5px solid #E2E8F0' }}>
                {(['Active', 'Paused', 'Prospect'] as const).map(s => (
                  <button key={s} type="button" onClick={() => setStatusMenuOpen(false)}
                    className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#F8FAFC] ${company?.status === s ? 'font-medium text-[#2563EB]' : 'text-[#1E293B]'}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span
            className="text-[10px] font-medium px-3 py-1.5 rounded-full"
            style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }}
          >
            {company?.status ?? 'Active'}
          </span>
        )}
        <div className="w-px h-4 bg-[#E2E8F0] mx-1 flex-shrink-0" />
        <button className="px-3 py-1.5 text-[12px] text-[#1E293B] bg-white rounded-[7px] hover:bg-[#F8FAFC]" style={{ border: '0.5px solid #E2E8F0' }}>
          <Mail size={13} className="inline mr-1.5 text-[#64748B]" />
          Email
        </button>
        <button className={ICON_BTN}>
          <MoreHorizontal size={15} className="text-[#64748B]" />
        </button>
      </div>

      {/* INFO BLOCK */}
      <div className="bg-white px-4 pb-3" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
        <div className="grid grid-cols-3 gap-0">

          {/* Col 1: Company Info */}
          <div className="pr-6">
            <p className={INFO_LABEL}>Company</p>
            <div className="flex flex-col gap-[3px]">
              {([
                ['Location', company?.location || '—'],
                ['Industry', company?.industry  || '—'],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex items-baseline gap-[5px]">
                  <span className="text-[10px] text-[#94A3B8] min-w-[56px] flex-shrink-0">{label}</span>
                  <span className="text-[12px] text-[#1E293B]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: Contact Details */}
          <div className="px-6">
            <p className={INFO_LABEL}>Contact</p>
            <div className="flex flex-col gap-[5px]">
              {company?.phone && (
                <div className="flex items-center gap-[7px]">
                  <Phone size={12} className="text-[#2563EB] flex-shrink-0" />
                  <span className="text-[12px] text-[#1E293B]">{company.phone}</span>
                </div>
              )}
              {company?.website && (
                <div className="flex items-center gap-[7px]">
                  <Globe size={12} className="text-[#2563EB] flex-shrink-0" />
                  <span className="text-[12px] text-[#2563EB]">{company.website}</span>
                </div>
              )}
              {!company?.phone && !company?.website && (
                <span className="text-[12px] text-[#94A3B8]">No contact info</span>
              )}
            </div>
          </div>

          {/* Col 3: Notes */}
          <div className="px-6 flex flex-col">
            <p className={INFO_LABEL}>Notes</p>
            <textarea
              className="flex-1 w-full min-h-[60px] text-[12px] text-[#1E293B] leading-[1.5] resize-none focus:outline-none placeholder-[#94A3B8] bg-transparent"
              style={{ fontFamily: 'inherit', border: 'none' }}
              placeholder="Quick notes about this company..."
              defaultValue={company?.notes ?? ''}
            />
          </div>
        </div>
      </div>

      {/* TABS BAR */}
      <div
        className="bg-white h-[40px] flex items-center px-4 flex-shrink-0 sticky top-0 z-10"
        style={{ borderBottom: '0.5px solid #E2E8F0' }}
      >
        {(['jobs', 'clients', 'documents'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-full px-4 text-[13px] flex items-center transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-[#2563EB] text-[#2563EB] font-medium'
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            {tab === 'jobs' ? `Jobs (${jobs.length})` : tab === 'clients' ? `Clients (${companyClients.length})` : 'Documents'}
          </button>
        ))}
        <Settings size={16} className="text-[#94A3B8] ml-auto cursor-pointer hover:text-[#64748B]" />
      </div>

      {/* TAB CONTENT */}
      <div className="bg-[#F8FAFC]">
        {activeTab === 'jobs'      && jobsTab}
        {activeTab === 'clients'   && clientsTab}
        {activeTab === 'documents' && documentsTab}
      </div>

      </div>{/* end scrollable body */}

      <AddJobModal
        isOpen={showAddJob}
        onClose={() => setShowAddJob(false)}
        onSave={j => { onAddJob(j); setShowAddJob(false) }}
        companies={allCompanies}
        recruiters={recruiters}
        defaultCompanyId={company?.id}
      />

    </div>
  )
}
