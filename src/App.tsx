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

type Page = 'dashboard' | 'people' | 'candidates' | 'jobs' | 'job' | 'companies' | 'company' | 'reports' | 'candidate' | 'search' | 'administration'

// Clear stale data on version bump — runs before useState initializers read localStorage
if (localStorage.getItem('evaryst_version') !== '1.0.1') {
  ;['evaryst_candidates','evaryst_contacts','evaryst_companies','evaryst_jobs',
    'evaryst_schedule','evaryst_team_members','evaryst_tasks','evaryst_calls','evaryst_meetings'].forEach(k => localStorage.removeItem(k))
  localStorage.setItem('evaryst_version', '1.0.1')
}

// Ensure demo recruiter exists in team — runs synchronously so useState reads it immediately
;(function seedDemoRecruiter() {
  try {
    const raw  = localStorage.getItem('evaryst_team_members')
    const team: { email: string; [k: string]: unknown }[] = raw ? JSON.parse(raw) : []
    if (!team.some(m => m.email === DEMO_USER.email)) {
      team.push({
        id:        DEMO_USER.id,
        email:     DEMO_USER.email,
        name:      DEMO_USER.name,
        role:      'recruiter',
        status:    'active',
        invitedAt: new Date().toISOString(),
      })
      localStorage.setItem('evaryst_team_members', JSON.stringify(team))
    }
  } catch { /* ignore */ }
})()

function ls<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch { return fallback }
}

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
  const [scheduleEvents,        setScheduleEvents]        = useState<PanelEvent[]>(() => ls('evaryst_schedule', []))

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem('evaryst_candidates')
      const parsed: Candidate[] = saved ? JSON.parse(saved) : []
      return parsed.map(c => ({ ...c, isArchived: c.isArchived ?? false }))
    } catch { return [] }
  })

  const [contacts,   setContacts]   = useState<Contact[]>(()   => ls('evaryst_contacts',  []))
  const [companies,  setCompanies]  = useState<Company[]>(()   => ls('evaryst_companies', []))
  const [jobs,       setJobs]       = useState<Job[]>(() => {
    const loaded   = ls('evaryst_jobs', []) as Job[]
    // Build id→email map from team members so old jobs (stored only IDs) can be backfilled
    const members  = ls('evaryst_team_members', []) as { id: string; email: string }[]
    const idToEmail: Record<string, string> = {}
    members.forEach(m => { idToEmail[m.id] = m.email })
    // Also map demo user by canonical id regardless of what's in localStorage
    idToEmail[DEMO_USER.id] = DEMO_USER.email

    return loaded.map(j => {
      const recruiterIds    = Array.isArray(j.recruiterIds)    ? j.recruiterIds    : []
      const storedEmails    = Array.isArray(j.recruiterEmails) ? j.recruiterEmails : []
      // Backfill any email not already stored by looking up each recruiter id
      const backfilled      = recruiterIds.map(id => idToEmail[id]).filter(Boolean) as string[]
      const recruiterEmails = [...new Set([...storedEmails, ...backfilled])]
      const assignedEmail   = j.assignedRecruiterEmail || idToEmail[j.assignedRecruiterId] || ''
      return { ...j, recruiterIds, recruiterEmails, assignedRecruiterEmail: assignedEmail }
    })
  })
  const [teamMembers]               = useState<TeamMember[]>(() => ls('evaryst_team_members', []))

  const [searchKeyword,         setSearchKeyword]         = useState('')
  const [addCandidateOpen,      setAddCandidateOpen]      = useState(false)
  const [selectedCandidateIds,  setSelectedCandidateIds]  = useState<string[]>([])
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0)
  const [selectedCompanyId,     setSelectedCompanyId]     = useState<string | null>(null)
  const [selectedJobId,         setSelectedJobId]         = useState<string | null>(null)

  useEffect(() => { localStorage.setItem('evaryst_candidates', JSON.stringify(candidates)) }, [candidates])
  useEffect(() => { localStorage.setItem('evaryst_contacts',   JSON.stringify(contacts))   }, [contacts])
  useEffect(() => { localStorage.setItem('evaryst_companies',  JSON.stringify(companies))  }, [companies])
  useEffect(() => { localStorage.setItem('evaryst_jobs',       JSON.stringify(jobs))       }, [jobs])
  useEffect(() => { localStorage.setItem('evaryst_schedule',   JSON.stringify(scheduleEvents)) }, [scheduleEvents])

  function addScheduleEvent(ev: PanelEvent) { setScheduleEvents(prev => [...prev, ev]) }
  function toggleCandidateStar(id: string)  { setCandidates(prev => prev.map(c => c.id === id ? { ...c, starred: !c.starred } : c)) }
  function archiveCandidate(id: string)     { setCandidates(prev => prev.map(c => c.id === id ? { ...c, isArchived: true  } : c)) }
  function restoreCandidate(id: string)     { setCandidates(prev => prev.map(c => c.id === id ? { ...c, isArchived: false } : c)) }
  function deleteCandidate(id: string)      { setCandidates(prev => prev.filter(c => c.id !== id)) }

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
          j.recruiterIds.includes(uid)        ||
          j.recruiterEmails.includes(email)   ||
          j.assignedRecruiterId    === uid    ||
          j.assignedRecruiterEmail === email
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
                setContacts={setContacts}
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
                setCandidates={setCandidates}
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
                onAddCompany={c => setCompanies(prev => [c, ...prev])}
                onDeleteCompany={id => setCompanies(prev => prev.filter(c => c.id !== id))}
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
                onAddJob={j => setJobs(prev => [j, ...prev])}
                onNavigateToJob={navigateToJob}
                contacts={contacts}
                onAddContact={c => setContacts(prev => [...prev, c])}
                onDeleteContact={id => setContacts(prev => prev.filter(c => c.id !== id))}
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
                onAddJob={j => setJobs(prev => [j, ...prev])}
                onDeleteJob={id => setJobs(prev => prev.filter(j => j.id !== id))}
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
                onUpdateJob={updated => setJobs(prev => prev.map(j => j.id === updated.id ? updated : j))}
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
        onSave={c => setCandidates(prev => [...prev, c])}
        currentUser={currentUser}
      />
    </div>
  )
}

export default App
