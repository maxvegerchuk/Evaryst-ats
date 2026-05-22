import { useState, useEffect } from 'react'
import { Sidebar }        from './components/layout/Sidebar'
import { Topbar }         from './components/layout/Topbar'
import { Dashboard }      from './pages/Dashboard'
import { CandidatesPage } from './pages/CandidatesPage'
import { CandidatePage }  from './pages/CandidatePage'
import { CompaniesPage }  from './pages/CompaniesPage'
import { CompanyPage }    from './pages/CompanyPage'
import { JobsPage }       from './pages/JobsPage'
import { JobPage }        from './pages/JobPage'
import { ReportsPage }          from './pages/ReportsPage'
import { SearchPage }           from './pages/SearchPage'
import { AdministrationPage }   from './pages/AdministrationPage'
import { SchedulePanel } from './components/layout/SchedulePanel'
import type { EventStatus, PanelEvent } from './components/layout/SchedulePanel'
import { AuthPage } from './pages/AuthPage'
import type { User } from './types/auth'
import { DEMO_USER } from './types/auth'
import type { Candidate } from './types/candidate'
import type { Contact } from './types/contact'
import type { Company } from './types/company'
import type { Job } from './types/job'
import type { TeamMember } from './types/team'
import { AddCandidateModal } from './components/ui/AddCandidateModal'
import { supabase } from './lib/supabase'

type Page = 'dashboard' | 'people' | 'candidates' | 'jobs' | 'job' | 'companies' | 'company' | 'reports' | 'candidate' | 'search' | 'administration'

// ── Supabase row → TypeScript type mappers ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCandidate(r: any): Candidate {
  return {
    id:             r.id,
    name:           r.name,
    email:          r.email,
    phone:          r.phone,
    specialty:      r.specialty,
    stage:          r.stage,
    rating:         r.rating,
    location:       r.location,
    addedDate:      r.added_date,
    notes:          r.notes,
    starred:        r.starred ?? false,
    ownerId:        r.owner_id,
    ownerEmail:     r.owner_email,
    ownerName:      r.owner_name,
    isArchived:     r.is_archived ?? false,
    attachedJobIds: r.attached_job_ids ?? [],
    source:         r.source,
    resumeFileName: r.resume_file_name,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDbCandidate(c: Partial<Candidate>): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = {}
  if ('id'             in c) row.id               = c.id
  if ('name'           in c) row.name             = c.name
  if ('email'          in c) row.email            = c.email
  if ('phone'          in c) row.phone            = c.phone
  if ('specialty'      in c) row.specialty        = c.specialty
  if ('stage'          in c) row.stage            = c.stage
  if ('rating'         in c) row.rating           = c.rating
  if ('location'       in c) row.location         = c.location
  if ('addedDate'      in c) row.added_date       = c.addedDate
  if ('notes'          in c) row.notes            = c.notes
  if ('starred'        in c) row.starred          = c.starred
  if ('ownerId'        in c) row.owner_id         = c.ownerId
  if ('ownerEmail'     in c) row.owner_email      = c.ownerEmail
  if ('ownerName'      in c) row.owner_name       = c.ownerName
  if ('isArchived'     in c) row.is_archived      = c.isArchived
  if ('attachedJobIds' in c) row.attached_job_ids = c.attachedJobIds
  if ('source'         in c) row.source           = c.source
  if ('resumeFileName' in c) row.resume_file_name = c.resumeFileName
  return row
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCompany(r: any): Company {
  return {
    id:         r.id,
    name:       r.name,
    industry:   r.industry,
    location:   r.location,
    city:       r.city,
    state:      r.state,
    zip:        r.zip,
    phone:      r.phone,
    website:    r.website,
    status:     r.status,
    activeJobs: r.active_jobs ?? 0,
    dateAdded:  r.date_added,
    notes:      r.notes,
    ownerId:    r.owner_id,
    ownerName:  r.owner_name,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDbCompany(c: Partial<Company>): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = {}
  if ('id'         in c) row.id          = c.id
  if ('name'       in c) row.name        = c.name
  if ('industry'   in c) row.industry    = c.industry
  if ('location'   in c) row.location    = c.location
  if ('city'       in c) row.city        = c.city
  if ('state'      in c) row.state       = c.state
  if ('zip'        in c) row.zip         = c.zip
  if ('phone'      in c) row.phone       = c.phone
  if ('website'    in c) row.website     = c.website
  if ('status'     in c) row.status      = c.status
  if ('activeJobs' in c) row.active_jobs = c.activeJobs
  if ('dateAdded'  in c) row.date_added  = c.dateAdded
  if ('notes'      in c) row.notes       = c.notes
  if ('ownerId'    in c) row.owner_id    = c.ownerId
  if ('ownerName'  in c) row.owner_name  = c.ownerName
  return row
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapJob(r: any): Job {
  return {
    id:                     r.id,
    title:                  r.title,
    companyId:              r.company_id,
    companyName:            r.company_name,
    jobType:                r.job_type,
    salaryMin:              r.salary_min,
    salaryMax:              r.salary_max,
    salaryType:             r.salary_type,
    location:               r.location,
    status:                 r.status,
    assignedRecruiterId:    r.assigned_recruiter_id,
    assignedRecruiterEmail: r.assigned_recruiter_email,
    assignedRecruiterName:  r.assigned_recruiter_name,
    recruiterIds:           r.recruiter_ids ?? [],
    recruiterEmails:        r.recruiter_emails ?? [],
    description:            r.description,
    dateAdded:              r.date_added,
    candidates:             r.candidates ?? 0,
    internalId:             r.internal_id,
    clientReqNumber:        r.client_req_number,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDbJob(j: Partial<Job>): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = {}
  if ('id'                     in j) row.id                       = j.id
  if ('title'                  in j) row.title                    = j.title
  if ('companyId'              in j) row.company_id               = j.companyId
  if ('companyName'            in j) row.company_name             = j.companyName
  if ('jobType'                in j) row.job_type                 = j.jobType
  if ('salaryMin'              in j) row.salary_min               = j.salaryMin
  if ('salaryMax'              in j) row.salary_max               = j.salaryMax
  if ('salaryType'             in j) row.salary_type              = j.salaryType
  if ('location'               in j) row.location                 = j.location
  if ('status'                 in j) row.status                   = j.status
  if ('assignedRecruiterId'    in j) row.assigned_recruiter_id    = j.assignedRecruiterId
  if ('assignedRecruiterEmail' in j) row.assigned_recruiter_email = j.assignedRecruiterEmail
  if ('assignedRecruiterName'  in j) row.assigned_recruiter_name  = j.assignedRecruiterName
  if ('recruiterIds'           in j) row.recruiter_ids            = j.recruiterIds
  if ('recruiterEmails'        in j) row.recruiter_emails         = j.recruiterEmails
  if ('description'            in j) row.description              = j.description
  if ('dateAdded'              in j) row.date_added               = j.dateAdded
  if ('candidates'             in j) row.candidates               = j.candidates
  if ('internalId'             in j) row.internal_id              = j.internalId
  if ('clientReqNumber'        in j) row.client_req_number        = j.clientReqNumber
  return row
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapContact(r: any): Contact {
  return {
    id:          r.id,
    name:        r.name,
    title:       r.title,
    company:     r.company,
    companyId:   r.company_id,
    phone:       r.phone,
    email:       r.email,
    status:      r.status,
    lastContact: r.last_contact,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDbContact(c: Partial<Contact>): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = {}
  if ('id'          in c) row.id           = c.id
  if ('name'        in c) row.name         = c.name
  if ('title'       in c) row.title        = c.title
  if ('company'     in c) row.company      = c.company
  if ('companyId'   in c) row.company_id   = c.companyId
  if ('phone'       in c) row.phone        = c.phone
  if ('email'       in c) row.email        = c.email
  if ('status'      in c) row.status       = c.status
  if ('lastContact' in c) row.last_contact = c.lastContact
  return row
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTeamMember(r: any): TeamMember {
  return {
    id:        r.id,
    email:     r.email,
    name:      r.name,
    role:      r.role,
    status:    r.status,
    invitedAt: r.invited_at,
  }
}

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  const [scheduleOpen, setScheduleOpen] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!sessionStorage.getItem('evaryst_user'))
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('evaryst_user')
    return saved ? JSON.parse(saved) as User : null
  })

  const handleLogin = (user: User) => {
    sessionStorage.setItem('evaryst_user', JSON.stringify(user))
    setCurrentUser(user)
    setIsAuthenticated(true)
    setCurrentPage('dashboard')
  }
  const handleLogout = () => {
    sessionStorage.removeItem('evaryst_user')
    setCurrentUser(null)
    setIsAuthenticated(false)
    setCurrentPage('dashboard')
  }

  const [currentPage,           setCurrentPage]           = useState<Page>('dashboard')
  const [jobInitialTab,         setJobInitialTab]         = useState<'candidates' | 'details' | 'documents'>('candidates')
  const [eventStatuses,         setEventStatuses]         = useState<Record<string, EventStatus>>({})
  const [scheduleEvents,        setScheduleEvents]        = useState<PanelEvent[]>([])
  const [candidates,            setCandidates]            = useState<Candidate[]>([])
  const [contacts,              setContacts]              = useState<Contact[]>([])
  const [companies,             setCompanies]             = useState<Company[]>([])
  const [jobs,                  setJobs]                  = useState<Job[]>([])
  const [teamMembers,           setTeamMembers]           = useState<TeamMember[]>([])

  const [searchKeyword,         setSearchKeyword]         = useState('')
  const [addCandidateOpen,      setAddCandidateOpen]      = useState(false)
  const [selectedCandidateIds,  setSelectedCandidateIds]  = useState<string[]>([])
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0)
  const [selectedCompanyId,     setSelectedCompanyId]     = useState<string | null>(null)
  const [selectedJobId,         setSelectedJobId]         = useState<string | null>(null)

  // Load all data from Supabase on mount + real-time subscriptions
  useEffect(() => {
    async function loadAll() {
      const [candRes, compRes, jobRes, contRes, teamRes] = await Promise.all([
        supabase.from('candidates').select('*'),
        supabase.from('companies').select('*'),
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('*'),
        supabase.from('team_members').select('*'),
      ])
      if (candRes.data)  setCandidates(candRes.data.map(mapCandidate))
      if (compRes.data)  setCompanies(compRes.data.map(mapCompany))
      if (jobRes.data)   setJobs(jobRes.data.map(mapJob))
      if (contRes.data)  setContacts(contRes.data.map(mapContact))
      if (teamRes.data)  setTeamMembers(teamRes.data.map(mapTeamMember))
    }
    void loadAll()

    // Real-time subscriptions so recruiter sees manager changes immediately
    const jobsSub = supabase
      .channel('jobs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, payload => {
        if (payload.eventType === 'INSERT') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setJobs(prev => [mapJob(payload.new as any), ...prev])
        } else if (payload.eventType === 'UPDATE') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setJobs(prev => prev.map(j => j.id === (payload.new as any).id ? mapJob(payload.new as any) : j))
        } else if (payload.eventType === 'DELETE') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setJobs(prev => prev.filter(j => j.id !== (payload.old as any).id))
        }
      })
      .subscribe()

    const candidatesSub = supabase
      .channel('candidates-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, payload => {
        if (payload.eventType === 'INSERT') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCandidates(prev => [mapCandidate(payload.new as any), ...prev])
        } else if (payload.eventType === 'UPDATE') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCandidates(prev => prev.map(c => c.id === (payload.new as any).id ? mapCandidate(payload.new as any) : c))
        } else if (payload.eventType === 'DELETE') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCandidates(prev => prev.filter(c => c.id !== (payload.old as any).id))
        }
      })
      .subscribe()

    const companiesSub = supabase
      .channel('companies-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, payload => {
        if (payload.eventType === 'INSERT') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCompanies(prev => [mapCompany(payload.new as any), ...prev])
        } else if (payload.eventType === 'UPDATE') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCompanies(prev => prev.map(c => c.id === (payload.new as any).id ? mapCompany(payload.new as any) : c))
        } else if (payload.eventType === 'DELETE') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setCompanies(prev => prev.filter(c => c.id !== (payload.old as any).id))
        }
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(jobsSub)
      void supabase.removeChannel(candidatesSub)
      void supabase.removeChannel(companiesSub)
    }
  }, [])

  // ── Candidate handlers ──────────────────────────────────────────────────────

  async function handleAddCandidate(c: Candidate) {
    setCandidates(prev => [c, ...prev])
    const { error } = await supabase.from('candidates').insert(toDbCandidate(c))
    if (error) console.error('handleAddCandidate:', error)
  }

  async function handleUpdateCandidate(id: string, updates: Partial<Candidate>) {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    const { error } = await supabase.from('candidates').update(toDbCandidate(updates)).eq('id', id)
    if (error) console.error('handleUpdateCandidate:', error)
  }

  async function handleDeleteCandidate(id: string) {
    setCandidates(prev => prev.filter(c => c.id !== id))
    const { error } = await supabase.from('candidates').delete().eq('id', id)
    if (error) console.error('handleDeleteCandidate:', error)
  }

  function toggleCandidateStar(id: string) {
    const c = candidates.find(x => x.id === id)
    if (c) void handleUpdateCandidate(id, { starred: !c.starred })
  }

  function archiveCandidate(id: string)  { void handleUpdateCandidate(id, { isArchived: true  }) }
  function restoreCandidate(id: string)  { void handleUpdateCandidate(id, { isArchived: false }) }
  function deleteCandidate(id: string)   { void handleDeleteCandidate(id) }

  // ── Company handlers ────────────────────────────────────────────────────────

  async function handleAddCompany(c: Company) {
    setCompanies(prev => [c, ...prev])
    const { error } = await supabase.from('companies').insert(toDbCompany(c))
    if (error) console.error('handleAddCompany:', error)
  }

  async function handleDeleteCompany(id: string) {
    setCompanies(prev => prev.filter(c => c.id !== id))
    const { error } = await supabase.from('companies').delete().eq('id', id)
    if (error) console.error('handleDeleteCompany:', error)
  }

  // ── Job handlers ────────────────────────────────────────────────────────────

  async function handleAddJob(j: Job) {
    setJobs(prev => [j, ...prev])
    const { error } = await supabase.from('jobs').insert(toDbJob(j))
    if (error) console.error('handleAddJob:', error)
  }

  async function handleUpdateJob(updated: Job) {
    setJobs(prev => prev.map(j => j.id === updated.id ? updated : j))
    const { error } = await supabase.from('jobs').update(toDbJob(updated)).eq('id', updated.id)
    if (error) console.error('handleUpdateJob:', error)
  }

  async function handleDeleteJob(id: string) {
    setJobs(prev => prev.filter(j => j.id !== id))
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (error) console.error('handleDeleteJob:', error)
  }

  // ── Contact handlers ────────────────────────────────────────────────────────

  async function handleAddContact(c: Contact) {
    setContacts(prev => [...prev, c])
    const { error } = await supabase.from('contacts').insert(toDbContact(c))
    if (error) console.error('handleAddContact:', error)
  }

  async function handleDeleteContact(id: string) {
    setContacts(prev => prev.filter(c => c.id !== id))
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) console.error('handleDeleteContact:', error)
  }

  // ── Schedule (no Supabase table — session-only) ─────────────────────────────

  function addScheduleEvent(ev: PanelEvent) { setScheduleEvents(prev => [...prev, ev]) }

  // ── Derived state ───────────────────────────────────────────────────────────

  const isManager = currentUser?.role === 'talent_acquisition_manager'
  const isNewUser = currentUser !== null && currentUser.id !== DEMO_USER.id

  const ownedCandidates    = isManager
    ? candidates
    : candidates.filter(c =>
        !c.ownerId ||
        c.ownerId    === currentUser?.id    ||
        c.ownerEmail === currentUser?.email
      )
  const visibleCandidates  = ownedCandidates.filter(c => !c.isArchived)
  const archivedCandidates = ownedCandidates.filter(c => !!c.isArchived)

  const visibleJobs = isManager
    ? jobs
    : jobs.filter(j => {
        const uid   = currentUser?.id    ?? ''
        const email = currentUser?.email ?? ''
        return (
          j.assignedRecruiterEmail === email  ||
          j.assignedRecruiterId    === uid    ||
          j.recruiterIds.includes(uid)        ||
          j.recruiterEmails.includes(email)
        )
      })

  const toggle   = () => setScheduleOpen(v => !v)
  const navigate = (page: string) => {
    if (page === 'job') setJobInitialTab('candidates')
    setCurrentPage(page as Page)
  }
  const navigateToJobDetails = () => { setJobInitialTab('details'); setCurrentPage('job') }
  const navigateToCandidate  = (id: string) => { setSelectedCandidateIds([id]); setCurrentCandidateIndex(0); setCurrentPage('candidate') }
  const navigateToMultipleCandidates = (ids: string[]) => { setSelectedCandidateIds(ids); setCurrentCandidateIndex(0); setCurrentPage('candidate') }
  const navigateToCompany    = (id: string) => { setSelectedCompanyId(id); setCurrentPage('company') }
  const navigateToJob        = (id: string) => { setSelectedJobId(id); setJobInitialTab('candidates'); setCurrentPage('job') }

  const closeCard = () => {
    const next = selectedCandidateIds.filter((_, i) => i !== currentCandidateIndex)
    if (next.length === 0) { setCurrentPage('people'); setSelectedCandidateIds([]); setCurrentCandidateIndex(0) }
    else { setSelectedCandidateIds(next); setCurrentCandidateIndex(Math.min(currentCandidateIndex, next.length - 1)) }
  }

  const navigateCard = (direction: 'prev' | 'next') => {
    setCurrentCandidateIndex(prev => {
      if (direction === 'next') return Math.min(prev + 1, selectedCandidateIds.length - 1)
      return Math.max(prev - 1, 0)
    })
  }

  const setEventStatus = (id: string, status: EventStatus) =>
    setEventStatuses(prev => ({ ...prev, [id]: status }))
  const needsUpdateCount = Object.values(eventStatuses).filter(s => s === 'needs-update').length

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateIds[currentCandidateIndex]) ?? null
  const selectedCompany   = companies.find(c => c.id === selectedCompanyId) ?? null
  const selectedJob       = jobs.find(j => j.id === selectedJobId) ?? null

  const recruiterMembers = teamMembers.filter(m => m.role === 'recruiter')

  if (!isAuthenticated || !currentUser) return <AuthPage onLogin={handleLogin} />

  return (
    <div className="flex flex-col h-screen">
      <Topbar
        currentPage={currentPage}
        setCurrentPage={navigate}
        needsUpdateCount={needsUpdateCount}
        eventStatuses={eventStatuses}
        onSetStatus={setEventStatus}
        currentUser={currentUser}
        onLogout={handleLogout}
        onAddCandidate={() => setAddCandidateOpen(true)}
        onSearch={q => { setSearchKeyword(q); navigate('search') }}
        isManager={isManager}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={navigate}
          isNewUser={isNewUser}
          candidates={visibleCandidates}
          onNavigateToCandidate={navigateToCandidate}
          isManager={isManager}
          recruiterCount={recruiterMembers.length}
          openJobsCount={visibleJobs.filter(j => j.status === 'Open').length}
        />
        <main className="flex-1 overflow-hidden bg-[#F8FAFC] flex flex-col">

          {currentPage === 'dashboard' && (
            <div className="flex-1 overflow-y-auto">
              <Dashboard
                isScheduleOpen={scheduleOpen}
                onToggleSchedule={toggle}
                needsUpdateCount={needsUpdateCount}
                onAddScheduleEvent={addScheduleEvent}
                isNewUser={isNewUser}
                candidates={candidates}
                jobs={jobs}
                onNavigateToCandidates={navigateToMultipleCandidates}
                isManager={isManager}
                currentUser={currentUser}
              />
            </div>
          )}

          {(currentPage === 'people' || currentPage === 'candidates') && (
            <div className="flex-1 overflow-y-auto p-6">
              <CandidatesPage
                onNavigateToCandidate={navigateToCandidate}
                onNavigateToMultipleCandidates={navigateToMultipleCandidates}
                candidates={visibleCandidates}
                onAddCandidate={() => setAddCandidateOpen(true)}
                onToggleStar={toggleCandidateStar}
                isManager={isManager}
                contacts={contacts}
                onAddContact={handleAddContact}
                onDeleteContact={handleDeleteContact}
                archivedCandidates={archivedCandidates}
                onArchiveCandidate={archiveCandidate}
                onRestoreCandidate={restoreCandidate}
                onDeleteCandidate={deleteCandidate}
                currentUser={currentUser}
              />
            </div>
          )}

          {currentPage === 'candidate' && (
            <div className="flex-1 overflow-hidden">
              <CandidatePage
                key={selectedCandidateIds[currentCandidateIndex] ?? 'none'}
                setCurrentPage={navigate}
                onNavigateToJobDetails={navigateToJobDetails}
                candidate={selectedCandidate}
                onToggleStar={toggleCandidateStar}
                selectedCandidateIds={selectedCandidateIds}
                currentCandidateIndex={currentCandidateIndex}
                onCloseCard={closeCard}
                onNavigateCard={navigateCard}
                onArchive={(id) => { archiveCandidate(id); navigate('people') }}
                onRestore={restoreCandidate}
                openJobs={visibleJobs.filter(j => j.status === 'Open')}
                allJobs={visibleJobs}
                onUpdateCandidate={handleUpdateCandidate}
              />
            </div>
          )}

          {currentPage === 'companies' && (
            <div className="flex-1 overflow-y-auto p-6">
              <CompaniesPage
                onNavigate={navigate}
                onNavigateToCompany={navigateToCompany}
                isManager={isManager}
                companies={companies}
                onAddCompany={handleAddCompany}
                onDeleteCompany={handleDeleteCompany}
                currentUser={currentUser}
                jobs={jobs}
              />
            </div>
          )}

          {currentPage === 'company' && (
            <div className="flex-1 overflow-hidden">
              <CompanyPage
                setCurrentPage={navigate}
                isManager={isManager}
                company={selectedCompany}
                jobs={jobs.filter(j => j.companyId === selectedCompanyId)}
                allCompanies={companies}
                recruiters={recruiterMembers}
                onAddJob={handleAddJob}
                onNavigateToJob={navigateToJob}
                contacts={contacts}
                onAddContact={handleAddContact}
                onDeleteContact={handleDeleteContact}
              />
            </div>
          )}

          {currentPage === 'jobs' && (
            <div className="flex-1 overflow-y-auto p-6">
              <JobsPage
                onNavigate={navigate}
                onNavigateToJob={navigateToJob}
                isManager={isManager}
                jobs={visibleJobs}
                companies={companies}
                onAddJob={handleAddJob}
                onDeleteJob={handleDeleteJob}
                recruiters={recruiterMembers}
                currentUser={currentUser}
                candidates={candidates}
              />
            </div>
          )}

          {currentPage === 'job' && (
            <div className="flex-1 overflow-hidden">
              <JobPage
                setCurrentPage={navigate}
                initialTab={jobInitialTab}
                isManager={isManager}
                job={selectedJob}
                recruiters={recruiterMembers}
                onUpdateJob={handleUpdateJob}
                candidates={candidates}
              />
            </div>
          )}

          {currentPage === 'reports' && (
            <div className="flex-1 overflow-y-auto p-6">
              <ReportsPage setCurrentPage={navigate} candidates={candidates} jobs={visibleJobs} isManager={isManager} currentUser={currentUser} />
            </div>
          )}

          {currentPage === 'search' && (
            <div className="flex-1 overflow-y-auto">
              <SearchPage
                candidates={visibleCandidates}
                initialKeyword={searchKeyword}
                setSelectedCandidateIds={ids => { setSelectedCandidateIds(ids); setCurrentCandidateIndex(0) }}
                setCurrentCandidateIndex={setCurrentCandidateIndex}
                setCurrentPage={navigate}
              />
            </div>
          )}

          {currentPage === 'administration' && (
            <div className="flex-1 overflow-y-auto">
              {isManager
                ? <AdministrationPage currentUser={currentUser} />
                : <>{navigate('dashboard')}</>
              }
            </div>
          )}

        </main>
        {currentPage === 'dashboard' && (
          <SchedulePanel
            isOpen={scheduleOpen}
            onToggle={toggle}
            eventStatuses={eventStatuses}
            onSetStatus={setEventStatus}
            events={scheduleEvents}
            onAddEvent={addScheduleEvent}
          />
        )}
      </div>

      <AddCandidateModal
        isOpen={addCandidateOpen}
        onClose={() => setAddCandidateOpen(false)}
        onSave={handleAddCandidate}
        currentUser={currentUser}
      />
    </div>
  )
}

export default App
