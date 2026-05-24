import { useState, useEffect } from 'react'
import { Agentation } from 'agentation'
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
import { LandingPage } from './pages/LandingPage'
import { LoginPage }   from './pages/LoginPage'
import type { User } from './types/auth'
import { DEMO_USER } from './types/auth'
import type { Candidate } from './types/candidate'
import type { Contact } from './types/contact'
import type { Company } from './types/company'
import type { Job } from './types/job'
import type { TeamMember } from './types/team'
import { AddCandidateModal } from './components/ui/AddCandidateModal'
import { supabase } from './lib/supabase'
import { logActivity } from './lib/activity'
import { safeStorage } from './utils/storage'

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
    isArchived:            r.is_archived ?? false,
    attachedJobIds:        r.attached_job_ids ?? [],
    source:                r.source,
    resumeFileName:        r.resume_file_name,
    followUpDate:          r.followup_date  ?? '',
    followUpTime:          r.followup_time  ?? '',
    followUpType:          r.followup_type  ?? 'Call',
    workType:              r.work_type ?? '',
    ptoDays:               r.pto_days          ?? '',
    healthInsurance:       r.health_insurance  ?? '',
    retirementMatch:       r.retirement_match  ?? '',
    annualBonus:           r.annual_bonus      ?? '',
    qualificationAnswers:  r.qualification_answers ?? {},
    resumeData:            r.resume_data ?? { summary: '', experience: '', education: '', skills: '' },
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
  if ('attachedJobIds'        in c) row.attached_job_ids       = c.attachedJobIds
  if ('source'                in c) row.source                 = c.source
  if ('resumeFileName'        in c) row.resume_file_name       = c.resumeFileName
  if ('followUpDate'          in c) row.followup_date          = c.followUpDate
  if ('followUpTime'          in c) row.followup_time          = c.followUpTime
  if ('followUpType'          in c) row.followup_type          = c.followUpType
  if ('workType'              in c) row.work_type              = c.workType
  if ('ptoDays'               in c) row.pto_days               = c.ptoDays
  if ('healthInsurance'       in c) row.health_insurance       = c.healthInsurance
  if ('retirementMatch'       in c) row.retirement_match       = c.retirementMatch
  if ('annualBonus'           in c) row.annual_bonus           = c.annualBonus
  if ('qualificationAnswers'  in c) row.qualification_answers  = c.qualificationAnswers
  if ('resumeData'            in c) row.resume_data            = c.resumeData
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
    address:    r.address ?? '',
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
  if ('address'    in c) row.address     = c.address
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
    companyId:              r.company_id   || '',
    companyName:            r.company_name || '',
    jobType:                r.job_type,
    salaryMin:              r.salary_min,
    salaryMax:              r.salary_max,
    salaryType:             r.salary_type,
    location:               r.location,
    city:                   r.city              || '',
    state:                  r.state             || '',
    zip:                    r.zip               || '',
    address:                r.address           ?? '',
    ownerName:              r.owner_name        ?? '',
    ownerId:                r.owner_id          ?? '',
    hiringManager:          r.hiring_manager    || '',
    talentAcquisition:      r.talent_acquisition || '',
    otherContact1:          r.other_contact_1   || '',
    otherContact2:          r.other_contact_2   || '',
    daysOnSite:             r.days_on_site      || '',
    travelPct:              r.travel_pct        || '',
    workTypes:              r.work_types        || [],
    status:                 r.status,
    assignedRecruiterId:    r.assigned_recruiter_id,
    assignedRecruiterEmail: r.assigned_recruiter_email,
    assignedRecruiterName:  r.assigned_recruiter_name,
    recruiterIds:           r.assigned_recruiter_id    ? [r.assigned_recruiter_id]    : [],
    recruiterEmails:        r.assigned_recruiter_email ? [r.assigned_recruiter_email] : [],
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
  if ('companyId'              in j) row.company_id               = j.companyId               || ''
  if ('companyName'            in j) row.company_name             = j.companyName             || ''
  if ('jobType'                in j) row.job_type                 = j.jobType                 || 'Full Time'
  if ('salaryMin'              in j) row.salary_min               = j.salaryMin               || ''
  if ('salaryMax'              in j) row.salary_max               = j.salaryMax               || ''
  if ('salaryType'             in j) row.salary_type              = j.salaryType              || 'year'
  if ('location'               in j) row.location                 = j.location                || ''
  if ('status'                 in j) row.status                   = j.status                  || 'Open'
  if ('assignedRecruiterId'    in j) row.assigned_recruiter_id    = j.assignedRecruiterId    || ''
  if ('assignedRecruiterEmail' in j) row.assigned_recruiter_email = j.assignedRecruiterEmail || ''
  if ('assignedRecruiterName'  in j) row.assigned_recruiter_name  = j.assignedRecruiterName  || ''
  // recruiter_ids / recruiter_emails — колонок нет в Supabase, пропускаем
  if ('description'            in j) row.description              = j.description             || ''
  if ('dateAdded'              in j) row.date_added               = j.dateAdded               || ''
  if ('candidates'             in j) row.candidates               = j.candidates              ?? 0
  if ('internalId'             in j) row.internal_id              = j.internalId              || ''
  if ('clientReqNumber'        in j) row.client_req_number        = j.clientReqNumber         || null
  if ('ownerName'              in j) row.owner_name               = j.ownerName               || ''
  if ('ownerId'                in j) row.owner_id                 = j.ownerId                 || ''
  if ('city'                   in j) row.city                     = j.city                    || ''
  if ('state'                  in j) row.state                    = j.state                   || ''
  if ('zip'                    in j) row.zip                      = j.zip                     || ''
  if ('hiringManager'          in j) row.hiring_manager           = j.hiringManager           || ''
  if ('talentAcquisition'      in j) row.talent_acquisition       = j.talentAcquisition       || ''
  if ('otherContact1'          in j) row.other_contact_1          = j.otherContact1           || ''
  if ('otherContact2'          in j) row.other_contact_2          = j.otherContact2           || ''
  if ('daysOnSite'             in j) row.days_on_site             = j.daysOnSite              || ''
  if ('travelPct'              in j) row.travel_pct               = j.travelPct               || ''
  if ('workTypes'              in j) row.work_types               = j.workTypes               || []
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
  const [isAuthenticated] = useState(() => !!safeStorage.getItem('evaryst_user'))
  const [currentUser] = useState<User | null>(() => {
    const saved = safeStorage.getItem('evaryst_user')
    return saved ? JSON.parse(saved) as User : null
  })

  const handleLogin = (user: User) => {
    safeStorage.setItem('evaryst_user', JSON.stringify(user))
    window.location.href = '/app'
  }
  const handleLogout = () => {
    safeStorage.removeItem('evaryst_user')
    safeStorage.removeItem('evaryst_page')
    safeStorage.removeItem('evaryst_company_id')
    safeStorage.removeItem('evaryst_job_id')
    safeStorage.removeItem('evaryst_candidate_ids')
    safeStorage.removeItem('evaryst_candidate_idx')
    window.location.href = '/'
  }

  const [currentPage,           setCurrentPage]           = useState<Page>(() => (safeStorage.getItem('evaryst_page') as Page) || 'dashboard')
  const [jobInitialTab,         setJobInitialTab]         = useState<'candidates' | 'details' | 'documents'>('details')
  const [eventStatuses,         setEventStatuses]         = useState<Record<string, EventStatus>>({})
  const [scheduleEvents,        setScheduleEvents]        = useState<PanelEvent[]>([])
  const [candidates,            setCandidates]            = useState<Candidate[]>([])
  const [contacts,              setContacts]              = useState<Contact[]>([])
  const [companies,             setCompanies]             = useState<Company[]>([])
  const [jobs,                  setJobs]                  = useState<Job[]>([])
  const [teamMembers,           setTeamMembers]           = useState<TeamMember[]>([])

  const [searchKeyword,         setSearchKeyword]         = useState('')
  const [addCandidateOpen,      setAddCandidateOpen]      = useState(false)
  const [selectedCandidateIds,  setSelectedCandidateIds]  = useState<string[]>(() => {
    const saved = safeStorage.getItem('evaryst_candidate_ids')
    return saved ? (JSON.parse(saved) as string[]) : []
  })
  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(() => {
    const saved = safeStorage.getItem('evaryst_candidate_idx')
    return saved ? parseInt(saved, 10) : 0
  })
  const [selectedCompanyId,     setSelectedCompanyId]     = useState<string | null>(() => safeStorage.getItem('evaryst_company_id'))
  const [selectedJobId,         setSelectedJobId]         = useState<string | null>(() => safeStorage.getItem('evaryst_job_id'))

  // Persist navigation state across refreshes
  useEffect(() => { safeStorage.setItem('evaryst_page', currentPage) }, [currentPage])
  useEffect(() => {
    if (selectedCompanyId) safeStorage.setItem('evaryst_company_id', selectedCompanyId)
    else safeStorage.removeItem('evaryst_company_id')
  }, [selectedCompanyId])
  useEffect(() => {
    if (selectedJobId) safeStorage.setItem('evaryst_job_id', selectedJobId)
    else safeStorage.removeItem('evaryst_job_id')
  }, [selectedJobId])
  useEffect(() => {
    safeStorage.setItem('evaryst_candidate_ids', JSON.stringify(selectedCandidateIds))
  }, [selectedCandidateIds])
  useEffect(() => {
    safeStorage.setItem('evaryst_candidate_idx', String(currentCandidateIndex))
  }, [currentCandidateIndex])

  // Load all data from Supabase — polling every 30s (Safari blocks WebSockets)
  async function loadAllData() {
    try {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs').select('*').order('created_at', { ascending: false })
      if (jobError) { console.error('Error loading jobs:', jobError) }
      else if (jobData) {
        const mapped = jobData.map(mapJob)
        setJobs(mapped)
        console.log('Loaded jobs:', mapped.length, mapped.map(j => ({ title: j.title, email: j.assignedRecruiterEmail })))
      }
    } catch (err) { console.error('Jobs load failed:', err) }

    const [candRes, compRes, contRes, teamRes] = await Promise.all([
      supabase.from('candidates').select('*'),
      supabase.from('companies').select('*'),
      supabase.from('contacts').select('*'),
      supabase.from('team_members').select('*'),
    ])
    if (candRes.data)  setCandidates(candRes.data.map(mapCandidate))
    if (compRes.data)  setCompanies(compRes.data.map(mapCompany))
    if (contRes.data)  setContacts(contRes.data.map(mapContact))
    if (teamRes.data)  setTeamMembers(teamRes.data.map(mapTeamMember))
  }

  useEffect(() => {
    void loadAllData()
    const interval = setInterval(() => { void loadAllData() }, 30000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  // ── Candidate handlers ──────────────────────────────────────────────────────

  async function handleAddCandidate(c: Candidate) {
    setCandidates(prev => [c, ...prev])
    const { error } = await supabase.from('candidates').insert(toDbCandidate(c))
    if (error) { console.error('handleAddCandidate error:', JSON.stringify(error, null, 2)); setCandidates(prev => prev.filter(x => x.id !== c.id)); return }
    void logActivity('candidate_added', `New candidate added: ${c.name}`, c.id, 'candidate', currentUser?.id)
  }

  async function handleUpdateCandidate(id: string, updates: Partial<Candidate>) {
    const existing = candidates.find(c => c.id === id)
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    const { error } = await supabase.from('candidates').update(toDbCandidate(updates)).eq('id', id)
    if (error) { console.error('handleUpdateCandidate:', error); return }
    if (existing) {
      const uid = currentUser?.id
      if (updates.stage) {
        void logActivity('stage_changed',  `${existing.name} moved to ${updates.stage}`,           id, 'candidate', uid)
        void logActivity('status_changed', `${existing.name} status changed to ${updates.stage}`,  id, 'candidate', uid)
      } else if (updates.attachedJobIds) {
        const oldIds   = existing.attachedJobIds ?? []
        const addedIds = updates.attachedJobIds.filter(jid => !oldIds.includes(jid))
        for (const jobId of addedIds) {
          const jobTitle = jobs.find(j => j.id === jobId)?.title ?? 'a job'
          void logActivity('candidate_added', `${existing.name} added to ${jobTitle}`, id, 'candidate', uid)
        }
      } else if ('notes' in updates && updates.notes !== undefined) {
        void logActivity('note_added', `Note added for ${existing.name}`, id, 'candidate', uid)
      }
    }
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
    if (error) { console.error('handleAddCompany error:', JSON.stringify(error, null, 2)); setCompanies(prev => prev.filter(x => x.id !== c.id)); return }
    void logActivity('company_added', `New company added: ${c.name}`, c.id, 'company', currentUser?.id)
  }

  async function handleUpdateCompany(id: string, updates: Partial<Company>) {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    const { error } = await supabase.from('companies').update(toDbCompany(updates)).eq('id', id)
    if (error) console.error('handleUpdateCompany:', error)
  }

  async function handleDeleteCompany(id: string) {
    setCompanies(prev => prev.filter(c => c.id !== id))
    const { error } = await supabase.from('companies').delete().eq('id', id)
    if (error) console.error('handleDeleteCompany:', error)
  }

  // ── Job handlers ────────────────────────────────────────────────────────────

  async function handleAddJob(j: Job) {
    if (!j.companyId) {
      alert('Please select a company')
      return
    }
    console.log('Creating job for company:', { id: j.companyId, name: j.companyName })
    setJobs(prev => [j, ...prev])

    const jobInsert = {
      id:                       j.id,
      title:                    j.title,
      company_id:               j.companyId               || '',
      company_name:             j.companyName             || '',
      job_type:                 j.jobType                 || 'Full Time',
      salary_min:               j.salaryMin               || '',
      salary_max:               j.salaryMax               || '',
      salary_type:              j.salaryType              || 'year',
      location:                 j.location                || '',
      status:                   j.status                  || 'Open',
      assigned_recruiter_id:    j.assignedRecruiterId    || '',
      assigned_recruiter_email: j.assignedRecruiterEmail || '',
      assigned_recruiter_name:  j.assignedRecruiterName  || '',
      description:              j.description             || '',
      internal_id:              j.internalId              || '',
      client_req_number:        j.clientReqNumber?.trim() || null,
      owner_name:               j.ownerName               || '',
      owner_id:                 j.ownerId                 || '',
      city:                     j.city                    || '',
      state:                    j.state                   || '',
      zip:                      j.zip                     || '',
      hiring_manager:           j.hiringManager           || '',
      talent_acquisition:       j.talentAcquisition       || '',
      other_contact_1:          j.otherContact1           || '',
      other_contact_2:          j.otherContact2           || '',
      days_on_site:             j.daysOnSite              || '',
      travel_pct:               j.travelPct               || '',
      work_types:               j.workTypes               || [],
      candidates:               0,
      days_open:                0,
      date_added:               j.dateAdded,
    }

    console.log('=== JOB INSERT DEBUG ===')
    console.log('Insert object:', JSON.stringify(jobInsert, null, 2))
    console.log('Object keys:', Object.keys(jobInsert))

    try {
      const { data, error } = await supabase.from('jobs').insert(jobInsert).select()

      console.log('Supabase response data:', data)
      console.log('Supabase response error:', error)

      if (error) {
        console.error('=== SUPABASE ERROR ===')
        console.error('Message:', error.message)
        console.error('Details:', error.details)
        console.error('Hint:', error.hint)
        console.error('Code:', error.code)
        console.error('Full error:', JSON.stringify(error, null, 2))
        alert('Error: ' + error.message + '\nDetails: ' + error.details + '\nHint: ' + error.hint)
        setJobs(prev => prev.filter(x => x.id !== j.id))
        return
      }

      console.log('Job created successfully:', data)
      void logActivity('job_created', `New job posted: ${j.title}`, j.id, 'job', currentUser?.id)
    } catch (err: unknown) {
      const e = err as { message?: string }
      console.error('=== CATCH ERROR ===', err)
      alert('Caught error: ' + (e?.message ?? String(err)))
      setJobs(prev => prev.filter(x => x.id !== j.id))
    }

    void loadAllData()
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
    if (error) { console.error('handleAddContact:', error); setContacts(prev => prev.filter(x => x.id !== c.id)) }
  }

  async function handleDeleteContact(id: string) {
    setContacts(prev => prev.filter(c => c.id !== id))
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) console.error('handleDeleteContact:', error)
  }

  // ── Schedule (no Supabase table — session-only) ─────────────────────────────

  function addScheduleEvent(ev: PanelEvent) {
    setScheduleEvents(prev => [...prev, ev])
    const isCall = ev.type === 'phone'
    void logActivity(
      isCall ? 'call_logged' : 'meeting_scheduled',
      `${isCall ? 'Call logged' : 'Meeting scheduled'} with ${ev.name}`,
      ev.id,
      'schedule',
      currentUser?.id,
    )
  }

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
        const email = (currentUser?.email ?? '').toLowerCase()
        const emailMatch = j.assignedRecruiterEmail?.toLowerCase() === email
        const idMatch    = j.assignedRecruiterId === uid
        const inIds      = j.recruiterIds.includes(uid)
        const inEmails   = j.recruiterEmails.some(e => e.toLowerCase() === email)
        return emailMatch || idMatch || inIds || inEmails
      })

  const toggle   = () => setScheduleOpen(v => !v)
  const navigate = (page: string) => {
    if (page === 'job') setJobInitialTab('details')
    setCurrentPage(page as Page)
  }
  const navigateToJobDetails = () => { setJobInitialTab('details'); setCurrentPage('job') }
  const navigateToCandidate  = (id: string) => { setSelectedCandidateIds([id]); setCurrentCandidateIndex(0); setCurrentPage('candidate') }
  const navigateToMultipleCandidates = (ids: string[]) => { setSelectedCandidateIds(ids); setCurrentCandidateIndex(0); setCurrentPage('candidate') }
  const navigateToCompany    = (id: string) => {
    setSelectedCompanyId(id)
    setCurrentPage('company')
    console.log('navigateToCompany id:', id)
    console.log('all jobs:', jobs.map(j => ({ title: j.title, companyId: j.companyId, companyName: j.companyName })))
  }
  const navigateToJob        = (id: string) => { setSelectedJobId(id); setJobInitialTab('details'); setCurrentPage('job') }

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

  // ── Path-based routing ──────────────────────────────────────────────────────
  const path = window.location.pathname

  if (path === '/' || path === '') {
    return <LandingPage isAuthenticated={isAuthenticated} onGoToApp={() => { window.location.href = '/app' }} />
  }

  if (path === '/login') {
    if (isAuthenticated) { window.location.href = '/'; return null }
    return <LoginPage onLogin={handleLogin} />
  }

  if (!isAuthenticated || !currentUser) {
    window.location.href = '/login'
    return null
  }

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
                key={selectedCompanyId ?? ''}
                setCurrentPage={navigate}
                isManager={isManager}
                company={selectedCompany}
                jobs={jobs}
                allCompanies={companies}
                recruiters={recruiterMembers}
                onAddJob={handleAddJob}
                onNavigateToJob={navigateToJob}
                contacts={contacts}
                onAddContact={handleAddContact}
                onDeleteContact={handleDeleteContact}
                currentUser={currentUser}
                onUpdateCompany={handleUpdateCompany}
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
                onUpdateCandidate={handleUpdateCandidate}
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
            candidates={candidates}
          />
        )}
      </div>

      <AddCandidateModal
        isOpen={addCandidateOpen}
        onClose={() => setAddCandidateOpen(false)}
        onSave={handleAddCandidate}
        currentUser={currentUser}
      />
      {import.meta.env.DEV && <Agentation />}
    </div>
  )
}

export default App
