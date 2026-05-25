import { useState, useRef, useEffect } from 'react'
import { formatPhone } from '../utils/formatPhone'
import {
  ChevronLeft, ChevronDown, ChevronRight, X,
  Link2, Star, FileText, Edit, Trash2,
  CircleDot, MoreHorizontal,
  Phone, Mail, Search, Plus, Trash, Download, Archive,
} from 'lucide-react'
import { JOB_DESC_INTERNAL } from './JobPage'
import type { Candidate } from '../types/candidate'
import { EditPanel } from '../components/ui/EditPanel'
import { CityAutocomplete } from '../components/ui/CityAutocomplete'

// ── Types & constants ──────────────────────────────────────────────────────────

const STAGES = ['New', 'Phone Screen', 'Interview', 'References', 'Submitted', 'Placed'] as const
type Stage = (typeof STAGES)[number]

const STAGE_STYLE: Record<Stage, { wrap: string; text: string; dot: string; border?: string }> = {
  'New':          { wrap: 'bg-[#F1F5F9]',  text: 'text-[#475569]',  dot: 'text-[#64748B]'  },
  'Phone Screen': { wrap: 'bg-[#DBEAFE]',  text: 'text-[#1D4ED8]',  dot: 'text-[#3B82F6]'  },
  'Interview':    { wrap: 'bg-[#FEF3C7] hover:bg-[#FDE68A]', text: 'text-[#92400E]', dot: 'text-[#92400E]', border: '1px solid #F59E0B' },
  'References':   { wrap: 'bg-[#F3E8FF]',  text: 'text-[#6D28D9]',  dot: 'text-[#8B5CF6]'  },
  'Submitted':    { wrap: 'bg-[#FFEDD5]',  text: 'text-[#9A3412]',  dot: 'text-[#F97316]'  },
  'Placed':       { wrap: 'bg-[#DCFCE7]',  text: 'text-[#15803D]',  dot: 'text-[#22C55E]'  },
}

const FOLLOW_UP_TYPES = ['Call', 'Meeting', 'Email'] as const
type FollowUpType = (typeof FOLLOW_UP_TYPES)[number]

type MainTab = 'interview' | 'employment' | 'communication' | 'documents'

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: 'interview',     label: 'Interview Form'     },
  { id: 'employment',    label: 'Employment Details' },
  { id: 'communication', label: 'Communication'      },
  { id: 'documents',     label: 'Documents'          },
]




const CONTACT_HISTORY = [
  { date: '05/15/2026', details: 'Called candidate, discussed current role and interest in new opportunities', creator: 'T. Hayhurst' },
  { date: '05/12/2026', details: 'Submitted resume to Glazers for Helpdesk position',                         creator: 'T. Hayhurst' },
  { date: '05/10/2026', details: 'Email sent with job description for .Net Developer at ABC Company',          creator: 'T. Hayhurst' },
  { date: '05/07/2026', details: 'Initial phone screen completed — strong candidate',                          creator: 'T. Hayhurst' },
  { date: '05/01/2026', details: 'Candidate added to system from LinkedIn referral',                           creator: 'T. Hayhurst' },
]

interface NoteItem { id: number; text: string; time: string }

type ResumeKey = 'summary' | 'experience' | 'education' | 'skills'

// Shared style tokens
const ICON_BTN  = 'w-[30px] h-[30px] flex items-center justify-center border-subtle rounded-[7px] bg-white hover:bg-[#F8FAFC] transition-colors flex-shrink-0'
const INFO_LABEL = 'text-[10px] uppercase text-[#64748B] font-medium tracking-[0.05em] mb-1.5'
const CARD_CLS  = 'bg-white rounded-[10px] overflow-hidden'
const CARD_ST   = { border: '0.5px solid #E2E8F0' } as const
const CARD_TTL  = 'text-[13px] font-medium text-[#1E293B]'
const CARD_HDR  = 'flex items-center px-4 py-3'
const CARD_HDR_ST = { borderBottom: '0.5px solid #E2E8F0' } as const
const FLD_INPUT = 'text-[12px] text-[#1E293B] rounded-[7px] bg-white w-full'
const FLD_ST    = { border: '0.5px solid #E2E8F0', padding: '6px 10px' } as const

function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }
function highlightText(text: string, q: string) {
  if (!q.trim()) return text
  return text.replace(new RegExp(`(${escapeRe(q)})`, 'gi'), '<mark style="background:#FEF9C3;border-radius:2px;padding:0 1px">$1</mark>')
}

function LinkedinIcon({ size = 12, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

interface AttachableJob { id: string; title: string; companyName: string }

interface CandidatePageProps {
  setCurrentPage:         (page: string) => void
  onNavigateToJobDetails: () => void
  candidate:              Candidate | null
  onToggleStar:           (id: string) => void
  selectedCandidateIds:   string[]
  currentCandidateIndex:  number
  onCloseCard:            () => void
  onNavigateCard:         (direction: 'prev' | 'next') => void
  onArchive:              (id: string) => void
  onRestore:              (id: string) => void
  openJobs?:              AttachableJob[]
  allJobs?:               AttachableJob[]
  onUpdateCandidate?:     (id: string, updates: Partial<Candidate>) => void
}

export function CandidatePage({ setCurrentPage, onNavigateToJobDetails, candidate, onToggleStar, selectedCandidateIds, currentCandidateIndex, onCloseCard, onNavigateCard, onArchive, onRestore, openJobs = [], allJobs = [], onUpdateCandidate }: CandidatePageProps) {
  const [stage,         setStage]         = useState<Stage>((candidate?.stage as Stage) ?? 'New')
  const [stageOpen,     setStageOpen]     = useState(false)
  const [activeType,    setActiveType]    = useState<FollowUpType>('Call')
  const [activeTab,     setActiveTab]     = useState<MainTab>('interview')
  const [showCandPanel, setShowCandPanel] = useState(false)
  const [isSavingCand,  setIsSavingCand]  = useState(false)
  const [editCandName,  setEditCandName]  = useState('')
  const [editSpecialty, setEditSpecialty] = useState('')
  const [editClassif,   setEditClassif]   = useState('')
  const [editCandCity,  setEditCandCity]  = useState('')
  const [editCandState, setEditCandState] = useState('')
  const [editPhoneMob,  setEditPhoneMob]  = useState('')
  const [editCandEmail, setEditCandEmail] = useState('')
  const [editLinkedin,  setEditLinkedin]  = useState('')
  const [editSource,    setEditSource]    = useState('')
  const [highlight,  setHighlight]  = useState('')
  const [submittalChecked, setSubmittalChecked] = useState(false)
  const [resumeSections, setResumeSection] = useState<Record<ResumeKey, string>>({
    summary:    candidate?.resumeData?.summary    || 'Highly motivated and results-driven professional with over 5 years of experience in Marketing. Proven track record of increasing sales and optimizing processes.',
    experience: candidate?.resumeData?.experience || 'Marketing Specialist | ABC Marketing Agency | Jan 2018 – Present\nLed successful marketing campaigns resulting in 20% revenue increase. Managed cross-functional teams.',
    education:  candidate?.resumeData?.education  || 'University of Cityville | B.S. Business Administration | 2017',
    skills:     candidate?.resumeData?.skills     || 'Marketing strategy, Data analysis, Project management, CRM systems, Excel, PowerPoint',
  })
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [addingNote, setAddingNote] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')
  const [salaryPeriod,  setSalaryPeriod]  = useState<'yr' | 'hr'>((candidate?.qualificationAnswers?.salaryType as 'yr' | 'hr') ?? 'yr')
  const [interviewJob,  setInterviewJob]  = useState('net-developer')
  const stageRef  = useRef<HTMLDivElement>(null)
  const attachRef = useRef<HTMLDivElement>(null)
  const [attachOpen, setAttachOpen] = useState(false)

  // ── Auto-save state ───────────────────────────────────────────────────────────
  const [notesValue,   setNotesValue]   = useState(candidate?.notes ?? '')
  const [notesSaved,   setNotesSaved]   = useState(false)
  const notesTimeoutRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const [followUpDate, setFollowUpDate] = useState(candidate?.followUpDate ?? '')
  const [followUpTime, setFollowUpTime] = useState(candidate?.followUpTime ?? '')
  const [scheduled,    setScheduled]    = useState(false)

  const [qualAnswers,  setQualAnswers]  = useState<Record<string, boolean | string>>(candidate?.qualificationAnswers ?? {})
  const qualTimeoutRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const resumeTimeoutRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const benefitsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const [benefits, setBenefits] = useState({
    ptoDays:         candidate?.ptoDays         ?? '',
    healthInsurance: candidate?.healthInsurance ?? '',
    retirementMatch: candidate?.retirementMatch ?? '',
    annualBonus:     candidate?.annualBonus     ?? '',
  })

  const [editingNoteId,   setEditingNoteId]   = useState<number | null>(null)
  const [editingNoteText, setEditingNoteText] = useState('')

  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>(
    () => candidate?.workType ? candidate.workType.split(',').map(s => s.trim()).filter(Boolean) : []
  )

  const isMultiSelect = selectedCandidateIds.length > 1
  const peekCount = Math.min(2, selectedCandidateIds.length - 1)

  const [docs, setDocs] = useState([
    { name: 'Lindsay_Resume_2024.pdf',   type: 'Resume',       date: '05/15/2026', time: '10:32 AM' },
    { name: 'Cover_Letter_Glazers.docx', type: 'Cover Letter', date: '05/12/2026', time: '2:15 PM'  },
  ])

  const [showArchiveModal,   setShowArchiveModal]   = useState(false)
  const [showPlacementModal, setShowPlacementModal] = useState(false)
  const [placementType,      setPlacementType]      = useState<'permanent' | 'contract'>('permanent')
  const [placementSalary,    setPlacementSalary]    = useState('')
  const [placementFee,       setPlacementFee]       = useState('15')
  const [placementCompany,   setPlacementCompany]   = useState('')
  const [placementTitle,     setPlacementTitle]     = useState('')
  const [placementStartDate, setPlacementStartDate] = useState('')
  const [placementNotes,     setPlacementNotes]     = useState('')

  const [personal, setPersonal] = useState({
    preferred:      candidate?.name.split(' ')[0] ?? '',
    role:           candidate?.specialty ?? '',
    location:       candidate?.location ?? '',
    classification: '',
  })
  const [contacts, setContacts] = useState({
    phone:    candidate?.phone    ?? '',
    email:    candidate?.email    ?? '',
    linkedin: '',
  })

  useEffect(() => {
    if (!stageOpen) return
    const handler = (e: MouseEvent) => {
      if (stageRef.current && !stageRef.current.contains(e.target as Node)) setStageOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [stageOpen])

  useEffect(() => {
    if (!attachOpen) return
    const handler = (e: MouseEvent) => {
      if (attachRef.current && !attachRef.current.contains(e.target as Node)) setAttachOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [attachOpen])

  useEffect(() => {
    if (!showCandPanel || !candidate) return
    setEditCandName(candidate.name ?? '')
    setEditSpecialty(candidate.specialty ?? '')
    setEditClassif(personal.classification)
    const parts = (candidate.location ?? '').split(', ')
    setEditCandCity(parts[0] ?? '')
    setEditCandState(parts[1] ?? '')
    setEditPhoneMob(candidate.phone ?? '')
    setEditCandEmail(candidate.email ?? '')
    setEditLinkedin(contacts.linkedin)
    setEditSource(candidate.source ?? '')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCandPanel, candidate])

  async function handleSaveCandidate() {
    if (!candidate || !onUpdateCandidate) return
    setIsSavingCand(true)
    const loc = [editCandCity.trim(), editCandState.trim()].filter(Boolean).join(', ')
    await onUpdateCandidate(candidate.id, {
      name:      editCandName.trim(),
      specialty: editSpecialty.trim(),
      location:  loc,
      phone:     editPhoneMob.trim(),
      email:     editCandEmail.trim(),
      source:    editSource.trim(),
    })
    setPersonal(p => ({
      ...p,
      preferred:      editCandName.trim().split(' ')[0] ?? '',
      role:           editSpecialty.trim(),
      location:       loc,
      classification: editClassif.trim(),
    }))
    setContacts(c => ({ ...c, phone: editPhoneMob.trim(), email: editCandEmail.trim(), linkedin: editLinkedin.trim() }))
    setIsSavingCand(false)
    setShowCandPanel(false)
  }

  // ── Auto-save handlers ────────────────────────────────────────────────────────

  function handleStageChange(newStage: Stage) {
    setStageOpen(false)
    if (newStage === 'Placed') { setShowPlacementModal(true); return }
    setStage(newStage)
    if (candidate) onUpdateCandidate?.(candidate.id, { stage: newStage })
  }

  function handleNotesChange(value: string) {
    setNotesValue(value)
    clearTimeout(notesTimeoutRef.current)
    notesTimeoutRef.current = setTimeout(() => {
      if (!candidate) return
      onUpdateCandidate?.(candidate.id, { notes: value })
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    }, 1000)
  }

  function handleScheduleFollowUp() {
    if (!candidate) return
    onUpdateCandidate?.(candidate.id, { followUpDate, followUpTime, followUpType: activeType })
    setScheduled(true)
    setTimeout(() => setScheduled(false), 2000)
  }

  function handleQualChange(key: string, value: boolean | string) {
    const next = { ...qualAnswers, [key]: value }
    setQualAnswers(next)
    clearTimeout(qualTimeoutRef.current)
    qualTimeoutRef.current = setTimeout(() => {
      if (!candidate) return
      onUpdateCandidate?.(candidate.id, { qualificationAnswers: next })
    }, 500)
  }

  function handleBenefitChange(key: keyof typeof benefits, value: string) {
    const next = { ...benefits, [key]: value }
    setBenefits(next)
    clearTimeout(benefitsTimeoutRef.current)
    benefitsTimeoutRef.current = setTimeout(() => {
      if (!candidate) return
      onUpdateCandidate?.(candidate.id, next)
    }, 800)
  }

  function handleResumeChange(key: ResumeKey, value: string) {
    const next = { ...resumeSections, [key]: value }
    setResumeSection(next)
    clearTimeout(resumeTimeoutRef.current)
    resumeTimeoutRef.current = setTimeout(() => {
      if (!candidate) return
      onUpdateCandidate?.(candidate.id, { resumeData: next })
    }, 1500)
  }

  function getQ(key: string): boolean { return (qualAnswers[key] as boolean) ?? false }
  function getQStr(key: string, fallback = ''): string { return (qualAnswers[key] as string) ?? fallback }

  const s = STAGE_STYLE[stage]

  const JOB_OPTIONS = [
    { value: 'net-developer',    label: '.Net Developer — ABC Company'  },
    { value: 'helpdesk',         label: 'Helpdesk — Glazers'            },
    { value: 'business-analyst', label: 'Business Analyst — Pepsico'    },
  ] as const

  const JOB_DESCRIPTIONS: Record<string, string> = {
    'net-developer':    JOB_DESC_INTERNAL,
    'helpdesk':         `Role: Helpdesk Specialist\nCompany: Glazers\nLocation: Austin, TX\n\nRequirements:\n- 2+ years helpdesk or IT support experience\n- Strong troubleshooting and communication skills\n- Familiarity with Windows, Mac, and networking basics\n\nSalary: $45,000 – $55,000 / year\nStart date: ASAP`,
    'business-analyst': `Role: Business Analyst\nCompany: Pepsico\nLocation: Dallas, TX\n\nRequirements:\n- 3+ years business analysis experience\n- Strong documentation and process mapping skills\n- Experience with Agile/Scrum methodologies\n\nSalary: $70,000 – $90,000 / year\nStart date: June 2026`,
  }

  // ── Interview Form tab ───────────────────────────────────────────────────────
  const InterviewTab = (
    <div>
      {/* Qualification questions */}
      <div className={`${CARD_CLS} mb-4`} style={CARD_ST}>
        <div className={CARD_HDR} style={CARD_HDR_ST}>
          <span className={CARD_TTL}>Qualification Questions</span>
        </div>
        <div className="p-4 grid grid-cols-4 gap-x-6 gap-y-2.5">
          {/* Col 1 */}
          <div className="flex flex-col gap-2.5">
            {(['availableToTalk', 'openToOpportunities'] as const).map((key, i) => (
              <label key={key} className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5 accent-[#2563EB] flex-shrink-0" checked={getQ(key)} onChange={e => handleQualChange(key, e.target.checked)} />
                <span className="text-[12px] text-[#1E293B] leading-tight">{['Available to talk', 'Open to new opportunities'][i]}</span>
              </label>
            ))}
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-[#2563EB] flex-shrink-0" checked={getQ('salaryChecked')} onChange={e => handleQualChange('salaryChecked', e.target.checked)} />
                <span className="text-[12px] text-[#1E293B] leading-tight">Salary</span>
              </label>
              <div className="flex items-center gap-1">
                <input type="text" placeholder="100,000"
                  value={getQStr('salaryValue')}
                  onChange={e => handleQualChange('salaryValue', e.target.value)}
                  className="text-[12px] text-[#1E293B] rounded-[7px] bg-white w-[120px]"
                  style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }} />
                {(['yr', 'hr'] as const).map(p => (
                  <button key={p} onClick={() => { setSalaryPeriod(p); handleQualChange('salaryType', p) }}
                    className={`flex items-center justify-center text-[12px] rounded-[7px] transition-colors flex-shrink-0 ${salaryPeriod === p ? 'bg-[#EFF6FF] text-[#2563EB] font-medium' : 'text-[#64748B] bg-white'}`}
                    style={{ border: `0.5px solid ${salaryPeriod === p ? '#2563EB' : '#E2E8F0'}`, width: 30, height: 30 }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Col 2 */}
          <div className="flex flex-col gap-2.5">
            {(['targetRole', 'technicalSkills'] as const).map((key, i) => (
              <label key={key} className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5 accent-[#2563EB] flex-shrink-0" checked={getQ(key)} onChange={e => handleQualChange(key, e.target.checked)} />
                <span className="text-[12px] text-[#1E293B] leading-tight">{["Candidate's target role", 'Technical skills verified'][i]}</span>
              </label>
            ))}
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-[#2563EB] flex-shrink-0" checked={getQ('workAuth')} onChange={e => handleQualChange('workAuth', e.target.checked)} />
                <span className="text-[12px] text-[#1E293B] leading-tight">Work authorization</span>
              </label>
              <select value={getQStr('workAuthType', 'US Citizen')} onChange={e => handleQualChange('workAuthType', e.target.value)} className="text-[12px] text-[#1E293B] bg-white rounded-[7px] w-[188px]" style={{ border: '0.5px solid #E2E8F0', padding: '6px 28px 6px 10px' }}>
                <option>US Citizen</option><option>Green Card</option><option>H1B</option><option>OPT</option>
              </select>
            </div>
          </div>
          {/* Col 3 */}
          <div className="flex flex-col gap-2.5">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" className="mt-0.5 accent-[#2563EB] flex-shrink-0" checked={getQ('commSkills')} onChange={e => handleQualChange('commSkills', e.target.checked)} />
              <span className="text-[12px] text-[#1E293B] leading-tight">Communication skills assessed</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" className="mt-0.5 accent-[#2563EB] flex-shrink-0" checked={getQ('companyInterest')} onChange={e => handleQualChange('companyInterest', e.target.checked)} />
              <span className="text-[12px] text-[#1E293B] leading-tight">Company interest confirmed</span>
            </label>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-[#2563EB] flex-shrink-0" checked={getQ('empPref')} onChange={e => handleQualChange('empPref', e.target.checked)} />
                <span className="text-[12px] text-[#1E293B] leading-tight">Employment preference</span>
              </label>
              <select value={getQStr('empPrefType', 'Contractor')} onChange={e => handleQualChange('empPrefType', e.target.value)} className="text-[12px] text-[#1E293B] bg-white rounded-[7px] w-[188px]" style={{ border: '0.5px solid #E2E8F0', padding: '6px 28px 6px 10px' }}>
                <option>Contractor</option><option>Full-Time</option><option>Part-Time</option><option>Contract to Hire</option>
              </select>
            </div>
          </div>
          {/* Col 4 */}
          <div className="flex flex-col gap-2.5">
            {(['securityClearance', 'candidateQuestionsAddressed', 'locationConfirmed'] as const).map((key, i) => (
              <label key={key} className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5 accent-[#2563EB] flex-shrink-0" checked={getQ(key)} onChange={e => handleQualChange(key, e.target.checked)} />
                <span className="text-[12px] text-[#1E293B] leading-tight">{['Security clearance required', 'Candidate questions addressed', 'Location confirmed'][i]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '55% 1fr' }}>

        {/* Left: Resume + Submittal */}
        <div>
          <div className={`${CARD_CLS} mb-4`} style={CARD_ST}>
            <div className={CARD_HDR} style={CARD_HDR_ST}>
              <span className={`${CARD_TTL} flex-1`}>Candidate Resume</span>
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input value={highlight} onChange={e => setHighlight(e.target.value)} placeholder="Highlight words"
                  className="pl-6 pr-2 text-[12px] text-[#1E293B] rounded-[7px] bg-white w-[120px]"
                  style={{ border: '0.5px solid #E2E8F0', paddingTop: 6, paddingBottom: 6 }} />
              </div>
            </div>
            <div className="p-4">
            {(['summary', 'experience', 'education', 'skills'] as ResumeKey[]).map((key, i) => (
              <div key={key} className={i > 0 ? 'mt-3 pt-3' : ''} style={i > 0 ? { borderTop: '0.5px solid #F1F5F9' } : {}}>
                <p className="text-[10px] uppercase text-[#64748B] font-medium mb-2" style={{ letterSpacing: '0.05em' }}>
                  {key}
                </p>
                {editingSection === key ? (
                  <textarea
                    autoFocus
                    value={resumeSections[key]}
                    onChange={e => handleResumeChange(key, e.target.value)}
                    onBlur={() => setEditingSection(null)}
                    className="w-full text-[13px] text-[#1E293B] leading-[1.6] resize-none rounded-[7px] p-2"
                    style={{ border: '0.5px solid #E2E8F0', minHeight: 80, fontFamily: 'inherit' }}
                  />
                ) : (
                  <div
                    onClick={() => setEditingSection(key)}
                    className="text-[13px] text-[#1E293B] leading-[1.6] cursor-text rounded-[6px] hover:bg-[#F8FAFC] transition-colors whitespace-pre-line px-1 -mx-1"
                    style={{ minHeight: 40 }}
                    dangerouslySetInnerHTML={{ __html: highlightText(resumeSections[key], highlight) }}
                  />
                )}
              </div>
            ))}
            </div>
          </div>

          {/* Submittal letter */}
          <div className={CARD_CLS} style={CARD_ST}>
            <div className={CARD_HDR} style={CARD_HDR_ST}>
              <input type="checkbox" checked={submittalChecked} onChange={e => setSubmittalChecked(e.target.checked)} className="accent-[#2563EB] mr-2 flex-shrink-0" />
              <span className={CARD_TTL}>Submittal Letter</span>
            </div>
            <div className="p-4">
              <textarea placeholder="Write a submittal letter for this candidate..."
                className="w-full min-h-[80px] text-[12px] text-[#475569] leading-[1.5] resize-none placeholder-[#64748B] bg-transparent"
                style={{ fontFamily: 'inherit', border: 'none' }} />
            </div>
          </div>
        </div>

        {/* Right: Active Jobs + Job Description + Personal Notes */}
        <div>
          {/* Active Jobs */}
          {(() => {
            const activeJobs = allJobs.filter(j => candidate?.attachedJobIds?.includes(j.id))
            return (
              <div className={`${CARD_CLS} mb-3`} style={CARD_ST}>
                <div className={CARD_HDR} style={CARD_HDR_ST}>
                  <span className={`${CARD_TTL} flex-1`}>Active Jobs</span>
                  <span className="text-[11px] text-[#64748B]">{activeJobs.length}</span>
                </div>
                <div className="px-4 py-2">
                  {activeJobs.length === 0 ? (
                    <p className="text-[12px] text-[#64748B] py-2 text-center">No jobs attached yet</p>
                  ) : (
                    <div className="flex flex-col">
                      {activeJobs.map((j, i) => (
                        <div key={j.id} className="flex items-center gap-2 py-1.5" style={i < activeJobs.length - 1 ? { borderBottom: '0.5px solid #F1F5F9' } : {}}>
                          <div>
                            <p className="text-[12px] font-medium text-[#1E293B]">{j.title}</p>
                            <p className="text-[11px] text-[#64748B]">{j.companyName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          <div className={`${CARD_CLS} mb-3`} style={CARD_ST}>
            <div className={CARD_HDR} style={CARD_HDR_ST}>
              <span className={CARD_TTL}>Job Description</span>
            </div>
            <div className="p-4">
              <select
                value={interviewJob}
                onChange={e => setInterviewJob(e.target.value)}
                className="w-full text-[12px] text-[#1E293B] rounded-[7px] mb-2 bg-white appearance-none"
                style={{ border: '0.5px solid #E2E8F0', padding: '6px 28px 6px 10px', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '12px' }}
              >
                {JOB_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <textarea
                readOnly
                value={JOB_DESCRIPTIONS[interviewJob] ?? ''}
                className="w-full text-[12px] text-[#475569] leading-[1.6] resize-none rounded-[8px] p-3 bg-[#F8FAFC]"
                style={{ border: '0.5px solid #E2E8F0', minHeight: 150, fontFamily: 'inherit' }}
              />
              <button
                onClick={onNavigateToJobDetails}
                className="mt-2 text-[11px] text-[#2563EB] hover:underline cursor-pointer"
              >
                View full job details →
              </button>
            </div>
          </div>

          {/* Personal Notes feed */}
          <div className={CARD_CLS} style={CARD_ST}>
            <div className={CARD_HDR} style={CARD_HDR_ST}>
              <span className={`${CARD_TTL} flex-1`}>Personal Notes</span>
              <button onClick={() => { setAddingNote(true); setNewNoteText('') }}
                className="text-[11px] text-[#475569] px-2 py-1 rounded-[6px] hover:bg-[#F8FAFC] transition-colors"
                style={{ border: '0.5px solid #E2E8F0' }}>
                + Add note
              </button>
            </div>
            <div className="p-4">
            {addingNote && (
              <div className="mb-3">
                <textarea autoFocus value={newNoteText} onChange={e => setNewNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full min-h-[64px] text-[12px] text-[#1E293B] leading-[1.5] resize-none rounded-[8px] p-3 placeholder-[#64748B]"
                  style={{ border: '0.5px solid #E2E8F0' }} />
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => {
                    if (newNoteText.trim()) setNotes(ns => [{ id: Date.now(), text: newNoteText.trim(), time: 'Just now' }, ...ns])
                    setAddingNote(false); setNewNoteText('')
                  }} className="px-3 py-1 text-[11px] font-medium text-white bg-[#2563EB] rounded-[6px] hover:bg-[#1D4ED8] transition-colors">
                    Save
                  </button>
                  <button onClick={() => { setAddingNote(false); setNewNoteText('') }}
                    className="text-[11px] text-[#64748B] hover:text-[#1E293B]">
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {notes.map(note => (
                <div key={note.id} className="bg-[#F8FAFC] rounded-[8px] p-3" style={{ border: '0.5px solid #E2E8F0' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-[#1D4ED8] leading-none">TH</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#1E293B]">Thane Hayhurst</span>
                    <span className="text-[10px] text-[#64748B] ml-auto">{note.time}</span>
                    <button onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.text) }} className="text-[#64748B] hover:text-[#475569] transition-colors"><Edit size={12} /></button>
                    <button onClick={() => setNotes(ns => ns.filter(n => n.id !== note.id))}
                      className="text-[#64748B] hover:text-[#DC2626] transition-colors"><Trash size={12} /></button>
                  </div>
                  {editingNoteId === note.id ? (
                    <textarea
                      autoFocus
                      value={editingNoteText}
                      onChange={e => setEditingNoteText(e.target.value)}
                      onBlur={() => {
                        setNotes(ns => ns.map(n => n.id === note.id ? { ...n, text: editingNoteText } : n))
                        setEditingNoteId(null)
                      }}
                      className="w-full text-[12px] text-[#1E293B] leading-[1.5] resize-none rounded-[6px] p-1.5"
                      style={{ border: '0.5px solid #E2E8F0', minHeight: 48 }}
                    />
                  ) : (
                    <p className="text-[12px] text-[#1E293B] leading-[1.5] mt-1.5">{note.text}</p>
                  )}
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Employment Details tab ───────────────────────────────────────────────────
  const empLabel = 'text-[10px] text-[#64748B] font-medium mb-1' as const
  const empInput = 'text-[12px] text-[#1E293B] rounded-[7px] bg-white w-full normal-case' as const
  const empInputSt = { border: '0.5px solid #E2E8F0', padding: '6px 10px', textTransform: 'none' as const }
  const dropSt = {
    border: '0.5px solid #E2E8F0',
    padding: '6px 28px 6px 10px',
    textTransform: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 8px center',
    backgroundSize: '12px',
  }

  const EmploymentTab = (
    <div>
      {/* Current Employment + Desired Work Types */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '3fr 2fr' }}>
        <div className={CARD_CLS} style={CARD_ST}>
          <div className={CARD_HDR} style={CARD_HDR_ST}>
            <span className={CARD_TTL}>Current Employment</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 flex flex-col">
                <p className={empLabel}>Employer</p>
                <input type="text" defaultValue="ABC Marketing Agency" className={empInput} style={empInputSt} />
              </div>
              <div className="flex flex-col">
                <p className={empLabel}>Date Hired</p>
                <input type="date" defaultValue="2018-01-15" className={empInput} style={empInputSt} />
              </div>
              <div className="flex flex-col">
                <p className={empLabel}>Base Pay</p>
                <input defaultValue="$85,000" className={empInput} style={empInputSt} />
              </div>
              <div className="flex flex-col">
                <p className={empLabel}>PTO Days</p>
                <input
                  value={benefits.ptoDays}
                  onChange={e => handleBenefitChange('ptoDays', e.target.value)}
                  placeholder="e.g. 14"
                  className={empInput}
                  style={empInputSt}
                />
                <p className="text-[11px] text-[#64748B] mt-0.5">Days per year</p>
              </div>
              <div className="flex flex-col">
                <p className={empLabel}>Health Insurance</p>
                <input
                  value={benefits.healthInsurance}
                  onChange={e => handleBenefitChange('healthInsurance', e.target.value)}
                  placeholder="e.g. $430/mo"
                  className={empInput}
                  style={empInputSt}
                />
                <p className="text-[11px] text-[#64748B] mt-0.5">Monthly contribution</p>
              </div>
              <div className="flex flex-col">
                <p className={empLabel}>401(k) Match</p>
                <input
                  value={benefits.retirementMatch}
                  onChange={e => handleBenefitChange('retirementMatch', e.target.value)}
                  placeholder="e.g. 4%"
                  className={empInput}
                  style={empInputSt}
                />
                <p className="text-[11px] text-[#64748B] mt-0.5">Employer match</p>
              </div>
              <div className="flex flex-col">
                <p className={empLabel}>Annual Bonus</p>
                <input
                  value={benefits.annualBonus}
                  onChange={e => handleBenefitChange('annualBonus', e.target.value)}
                  placeholder="e.g. 10%"
                  className={empInput}
                  style={empInputSt}
                />
                <p className="text-[11px] text-[#64748B] mt-0.5">Target bonus</p>
              </div>
            </div>
          </div>
        </div>
        <div className={CARD_CLS} style={CARD_ST}>
          <div className={CARD_HDR} style={CARD_HDR_ST}>
            <span className={CARD_TTL}>Desired Work Types</span>
          </div>
          <div className="p-4">
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <p className={empLabel}>Days on site</p>
                <input defaultValue="3" className={empInput} style={empInputSt} />
              </div>
              <div className="flex-1">
                <p className={empLabel}>Travel %</p>
                <input defaultValue="10%" className={empInput} style={empInputSt} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {['Full-Time', 'Contract', 'Part-Time', 'Contract to Hire'].map(w => (
                <label key={w} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-[#2563EB]"
                    checked={selectedWorkTypes.includes(w)}
                    onChange={e => {
                      const next = e.target.checked
                        ? [...selectedWorkTypes, w]
                        : selectedWorkTypes.filter(t => t !== w)
                      setSelectedWorkTypes(next)
                      onUpdateCandidate?.(candidate!.id, { workType: next.join(', ') })
                    }}
                  />
                  <span className="text-[12px] text-[#1E293B]">{w}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recruiting Activity */}
      {(() => {
        const attachedJobs = allJobs.filter(j => candidate?.attachedJobIds?.includes(j.id))
        const JOB_STATUS_STYLE: Record<string, { bg: string; clr: string }> = {
          Open:    { bg: '#DCFCE7', clr: '#15803D' },
          Closed:  { bg: '#F1F5F9', clr: '#475569' },
          'On Hold': { bg: '#FEF3C7', clr: '#92400E' },
        }
        return (
          <div className="bg-white rounded-[10px] overflow-hidden mb-4" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className={CARD_HDR} style={CARD_HDR_ST}>
              <span className={CARD_TTL}>Recruiting Activity</span>
            </div>
            {attachedJobs.length === 0 ? (
              <div className="px-4 py-6 text-center text-[12px] text-[#64748B]">No jobs attached yet</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
                    {['Organization', 'Job Title', 'Status', 'Rating', 'Job Status'].map(h => (
                      <th scope="col" key={h} className="text-left text-[10px] uppercase text-[#64748B] font-medium" style={{ padding: '8px 16px', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attachedJobs.map((j, i) => {
                    const jss = JOB_STATUS_STYLE[(j as { status?: string }).status ?? ''] ?? JOB_STATUS_STYLE['Closed']
                    return (
                      <tr key={j.id} className="hover:bg-[#F8FAFC]" style={{ borderBottom: i < attachedJobs.length - 1 ? '0.5px solid #F1F5F9' : undefined }}>
                        <td style={{ padding: '8px 16px' }}>
                          <span className="text-[12px] text-[#2563EB] hover:underline cursor-pointer" onClick={() => setCurrentPage('job')}>
                            {j.companyName}
                          </span>
                        </td>
                        <td className="text-[12px] text-[#475569]" style={{ padding: '8px 16px' }}>{j.title}</td>
                        <td style={{ padding: '8px 16px' }}>
                          <select className="text-[12px] text-[#1E293B] rounded-[7px] bg-white cursor-pointer appearance-none" style={dropSt}>
                            <option>Potential Candidate</option>
                            <option>Submitted</option>
                            <option>Interview</option>
                            <option>Placed</option>
                          </select>
                        </td>
                        <td style={{ padding: '8px 16px' }}>
                          <select className="text-[12px] text-[#1E293B] rounded-[7px] bg-white cursor-pointer appearance-none" style={dropSt}>
                            <option>Paper A</option>
                            <option>Paper B</option>
                            <option>A</option>
                            <option>B</option>
                          </select>
                        </td>
                        <td style={{ padding: '8px 16px' }}>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: jss.bg, color: jss.clr }}>
                            {(j as { status?: string }).status ?? '—'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )
      })()}
    </div>
  )

  // ── Communication tab ────────────────────────────────────────────────────────
  const CommunicationTab = (
    <div className="grid gap-4" style={{ gridTemplateColumns: '35% 1fr' }}>
      {/* Left */}
      <div>
        {/* Location */}
        <div className={`${CARD_CLS} mb-4`} style={CARD_ST}>
          <div className={CARD_HDR} style={CARD_HDR_ST}>
            <span className={CARD_TTL}>Location</span>
          </div>
          <div className="p-4">
            <div>
              <p className="text-[10px] text-[#64748B] mb-1">Location</p>
              <input defaultValue="54 Road Line Ave, Dallas, TX 75022" className={FLD_INPUT} style={FLD_ST} />
            </div>
          </div>
        </div>

        {/* Emails */}
        <div className={`${CARD_CLS} mb-4`} style={CARD_ST}>
          <div className={CARD_HDR} style={CARD_HDR_ST}>
            <span className={CARD_TTL}>Emails</span>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {[
              { label: 'Primary',   val: 'lindsayarm@gmail.com'  },
              { label: 'Secondary', val: 'l.armistead@work.com'  },
            ].map(em => (
              <div key={em.label} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="accent-[#2563EB] flex-shrink-0" />
                <span className="text-[10px] text-[#64748B] w-[52px] flex-shrink-0">{em.label}</span>
                <input defaultValue={em.val} className="flex-1 text-[12px] text-[#1E293B] rounded-[7px] bg-white" style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Admin Data */}
        <div className={CARD_CLS} style={CARD_ST}>
          <div className={CARD_HDR} style={CARD_HDR_ST}>
            <span className={CARD_TTL}>Admin Data</span>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <div>
              <p className="text-[10px] text-[#64748B] mb-1">Source</p>
              <select className={`${FLD_INPUT} cursor-pointer`} style={{ ...FLD_ST, paddingRight: 28 }}>
                <option>LinkedIn</option><option>Indeed</option><option>Referral</option><option>Website</option>
              </select>
            </div>
            <div>
              <p className="text-[10px] text-[#64748B] mb-1">Referred by</p>
              <input defaultValue="" placeholder="Name" className={FLD_INPUT} style={FLD_ST} />
            </div>
          </div>
        </div>
      </div>

      {/* Right: Contact History */}
      <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
        <div className="flex items-center px-4 py-3" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
          <span className="text-[13px] font-medium text-[#1E293B] flex-1">Contact History</span>
          <button className="w-6 h-6 flex items-center justify-center rounded-[5px] hover:bg-[#F8FAFC] mr-2" style={{ border: '0.5px solid #E2E8F0' }}>
            <Plus size={12} className="text-[#64748B]" />
          </button>
          <span className="text-[12px] text-[#2563EB] hover:underline cursor-pointer">See More</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
              {['Date', 'Details', 'Creator'].map(h => (
                <th scope="col" key={h} className="text-left px-4 py-2 text-[10px] uppercase text-[#64748B] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CONTACT_HISTORY.map((r, i) => (
              <tr key={i} className="hover:bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #F1F5F9' }}>
                <td className="px-4 py-2 text-[12px] text-[#475569] whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-2 text-[12px] text-[#1E293B]">{r.details}</td>
                <td className="px-4 py-2 text-[12px] text-[#475569] whitespace-nowrap">{r.creator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── Documents tab ────────────────────────────────────────────────────────────
  const DocumentsTab = (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button className="text-[12px] text-[#1E293B] bg-white px-3 py-1.5 rounded-[7px] hover:bg-[#F8FAFC] transition-colors" style={{ border: '0.5px solid #E2E8F0' }}>
          Add From File
        </button>
        {['Add Active Word Doc', 'Add Active PDF', 'Email Document', 'Request Update'].map(lbl => (
          <button key={lbl} className="text-[12px] text-[#1E293B] bg-white px-3 py-1.5 rounded-[7px] hover:bg-[#F8FAFC] transition-colors" style={{ border: '0.5px solid #E2E8F0' }}>
            {lbl}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
              <th scope="col" className="px-4 py-2 w-8"><input type="checkbox" className="accent-[#2563EB]" /></th>
              {['Document name', 'Document type', 'Date', 'Time'].map(h => (
                <th scope="col" key={h} className="text-left px-4 py-2 text-[10px] uppercase text-[#64748B] font-medium">{h}</th>
              ))}
              <th scope="col" className="px-4 py-2 w-10" />
            </tr>
          </thead>
          <tbody>
            {docs.map((d, i) => (
              <tr key={i} className="hover:bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #F1F5F9' }}>
                <td className="px-4 py-2"><input type="checkbox" className="accent-[#2563EB]" /></td>
                <td className="px-4 py-2 text-[12px] text-[#2563EB] hover:underline cursor-pointer">{d.name}</td>
                <td className="px-4 py-2 text-[12px] text-[#475569]">{d.type}</td>
                <td className="px-4 py-2 text-[12px] text-[#475569]">{d.date}</td>
                <td className="px-4 py-2 text-[12px] text-[#475569]">{d.time}</td>
                <td className="px-4 py-2 flex items-center gap-1">
                  <button className="text-[#64748B] hover:text-[#2563EB] transition-colors">
                    <Download size={13} />
                  </button>
                  <button onClick={() => setDocs(prev => prev.filter(x => x.name !== d.name))} className="text-[#64748B] hover:text-[#DC2626] transition-colors">
                    <Trash size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const cardContent = (
    <>
      {/* ── BREADCRUMB (inside card in multi mode) ── */}
      {isMultiSelect && (
        <div className="bg-white flex items-center px-4 flex-shrink-0" style={{ height: 34, borderBottom: '0.5px solid #E2E8F0' }}>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage('people')} className="flex items-center gap-0.5 text-[12px] text-[#2563EB] hover:underline">
              <ChevronLeft size={13} />
              People
            </button>
            <span className="text-[12px] text-[#64748B]">›</span>
            <span className="text-[12px] text-[#64748B]">{candidate?.name ?? 'Candidate'}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => onNavigateCard('prev')} disabled={currentCandidateIndex === 0}
              className="flex items-center gap-0.5 px-2 py-1 text-[11px] text-[#64748B] rounded-md hover:bg-[#F8FAFC] disabled:opacity-40"
              style={{ border: '0.5px solid #E2E8F0' }}>
              <ChevronLeft size={11} /> Prev
            </button>
            <span className="text-[11px] text-[#64748B]">{currentCandidateIndex + 1} / {selectedCandidateIds.length}</span>
            <button onClick={() => onNavigateCard('next')} disabled={currentCandidateIndex === selectedCandidateIds.length - 1}
              className="flex items-center gap-0.5 px-2 py-1 text-[11px] text-[#64748B] rounded-md hover:bg-[#F8FAFC] disabled:opacity-40"
              style={{ border: '0.5px solid #E2E8F0' }}>
              Next <ChevronRight size={11} />
            </button>
            <button onClick={onCloseCard}
              className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-[#FEF2F2] text-[#64748B] hover:text-[#DC2626] transition-colors"
              style={{ border: '0.5px solid #E2E8F0' }}>
              <X size={11} />
            </button>
          </div>
        </div>
      )}

      {/* ── SCROLLABLE BODY: ROW 2 + INFO BLOCK + TABS + TAB CONTENT ── */}
      <div className="flex-1 overflow-y-auto">

      {/* ── ARCHIVED BANNER ── */}
      {candidate?.isArchived && (
        <div className="flex items-center px-5 py-2 text-[12px] text-[#92400E]" style={{ background: '#FEF3C7', borderBottom: '1px solid #FDE68A' }}>
          <Archive size={13} className="mr-2 flex-shrink-0" />
          This candidate is archived
          <button
            type="button"
            onClick={() => candidate && onRestore(candidate.id)}
            className="ml-auto px-3 py-1 rounded-[6px] text-[12px] font-medium border border-[#92400E] text-[#92400E] hover:bg-[#FDE68A] transition-colors"
          >
            Restore
          </button>
        </div>
      )}

      {/* ── ROW 2: Name + Actions ── */}
      <div className="bg-white flex items-center px-4 gap-2" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <span className="text-[18px] font-medium text-[#1E293B] flex-1">{candidate?.name ?? 'Candidate'}</span>
        <div className="flex items-center gap-[3px]">
          <div ref={attachRef} className="relative">
            <button title="Attach to job" onClick={() => setAttachOpen(o => !o)} className={ICON_BTN}><Link2 size={13} className="text-[#64748B]" /></button>
            {attachOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-[8px] shadow-md z-50 py-1 min-w-[240px] max-h-[240px] overflow-y-auto" style={{ border: '0.5px solid #E2E8F0' }}>
                {openJobs.length === 0 ? (
                  <p className="px-3 py-2 text-[12px] text-[#64748B]">No open jobs available</p>
                ) : openJobs.map(j => {
                  const isAttached = candidate?.attachedJobIds?.includes(j.id) ?? false
                  return (
                    <button
                      key={j.id}
                      type="button"
                      onClick={() => {
                        if (!candidate || !onUpdateCandidate) return
                        const ids  = candidate.attachedJobIds ?? []
                        const next = isAttached ? ids.filter(id => id !== j.id) : [...ids, j.id]
                        onUpdateCandidate(candidate.id, { attachedJobIds: next })
                        setAttachOpen(false)
                      }}
                      className="flex w-full px-3 py-2 text-[12px] text-[#1E293B] hover:bg-[#F8FAFC] text-left gap-2 items-center"
                    >
                      <span className="flex-1 truncate">{j.title} · {j.companyName}</span>
                      {isAttached && <span className="text-[#15803D] text-[11px] shrink-0">✓ Attached</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <button
            title={candidate?.starred ? 'Remove from favorites' : 'Add to favorites'}
            onClick={() => candidate && onToggleStar(candidate.id)}
            className={ICON_BTN}
          >
            <Star
              size={13}
              style={candidate?.starred ? { color: '#F59E0B', fill: '#F59E0B' } : { color: '#64748B', fill: 'none' }}
            />
          </button>
          <button title="Export resume" className={ICON_BTN}><FileText size={13} className="text-[#64748B]" /></button>
          <button
            title="Edit"
            onClick={() => setShowCandPanel(true)}
            className={ICON_BTN}
          >
            <Edit size={13} className="text-[#64748B]" />
          </button>
          <button title="Archive" onClick={() => setShowArchiveModal(true)} className={ICON_BTN}><Trash2 size={13} className="text-[#64748B]" /></button>
        </div>
        <div className="w-px h-4 bg-[#E2E8F0] mx-1 flex-shrink-0" />
        <div className="relative" ref={stageRef}>
          <button
            onClick={() => setStageOpen(o => !o)}
            className={`flex items-center gap-[5px] px-3 py-1.5 rounded-[7px] cursor-pointer ${s.wrap} ${s.text}`}
            style={{ border: s.border ?? '0.5px solid' }}
          >
            <CircleDot size={12} className={s.dot} />
            <span className="text-[12px] font-medium">{stage}</span>
            <ChevronDown size={11} />
          </button>
          {stageOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white rounded-[8px] shadow-md z-50 py-1 min-w-[150px]" style={{ border: '0.5px solid #E2E8F0' }}>
              {STAGES.map(st => (
                <button
                  key={st}
                  onClick={() => handleStageChange(st)}
                  className={`flex items-center gap-2 w-full px-3 py-1.5 text-[12px] hover:bg-[#F8FAFC] text-left ${stage === st ? 'font-medium' : ''} ${STAGE_STYLE[st].text}`}
                >
                  <CircleDot size={11} className={STAGE_STYLE[st].dot} />
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-px h-4 bg-[#E2E8F0] mx-1 flex-shrink-0" />
        <button className="px-3 py-1.5 text-[12px] text-[#1E293B] bg-white rounded-[7px] hover:bg-[#F8FAFC]" style={{ border: '0.5px solid #E2E8F0' }}>
          Email
        </button>
        <button className="px-3 py-1.5 text-[12px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-[#1D4ED8]">
          Submit
        </button>
        <button className={ICON_BTN}>
          <MoreHorizontal size={15} className="text-[#64748B]" />
        </button>
      </div>

      {/* ── INFO BLOCK ── */}
      <div className="bg-white px-4 pb-3" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
        <div className="grid gap-0" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr' }}>
          {/* Col 1 — Personal */}
          <div className="pr-6">
            <p className={INFO_LABEL}>Personal</p>
            <div className="flex flex-col">
              {([
                ['Preferred',    'preferred'     ],
                ['Current role', 'role'          ],
                ['Location',     'location'      ],
                ['Class.',       'classification'],
              ] as [string, keyof typeof personal][]).map(([label, key]) => (
                <div key={key} className="flex items-baseline gap-[5px] mb-[3px]">
                  <span className="text-[10px] text-[#64748B] min-w-[64px] flex-shrink-0">{label}</span>
                  <span className="text-[12px] text-[#1E293B]">{personal[key]}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Col 2 — Contacts */}
          <div className="px-6">
            <p className={INFO_LABEL}>Contacts</p>
            <div className="flex flex-col">
              <div className="flex items-center gap-[7px] mb-[5px]">
                <Phone size={12} className="text-[#2563EB] flex-shrink-0" />
                <span className="text-[12px] text-[#1E293B]">{contacts.phone}</span>
              </div>
              <div className="flex items-center gap-[7px] mb-[5px]">
                <Mail size={12} className="text-[#2563EB] flex-shrink-0" />
                <span className="text-[12px] text-[#2563EB] hover:underline cursor-pointer">{contacts.email}</span>
              </div>
              <div className="flex items-center gap-[7px]">
                <LinkedinIcon size={12} className="text-[#2563EB] flex-shrink-0" />
                <span className="text-[12px] text-[#2563EB] hover:underline cursor-pointer">{contacts.linkedin}</span>
              </div>
            </div>
          </div>
          {/* Col 3 — Notes */}
          <div className="px-6 flex flex-col">
            <p className={INFO_LABEL}>Notes</p>
            <textarea
              className="flex-1 w-full min-h-[60px] text-[12px] text-[#1E293B] leading-[1.5] resize-none placeholder-[#64748B] bg-transparent"
              style={{ fontFamily: 'inherit', border: 'none' }}
              placeholder="Quick notes..."
              value={notesValue}
              onChange={e => handleNotesChange(e.target.value)}
            />
            {notesSaved && <span className="text-[10px] text-[#16A34A] mt-0.5">Saved ✓</span>}
          </div>
          {/* Col 4 — Follow Up */}
          <div className="pl-6 flex flex-col">
            <p className={INFO_LABEL}>Follow Up</p>
            <div className="flex gap-[5px] mb-[5px]">
              <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="flex-1 text-[12px] text-[#1E293B] rounded-[7px] bg-white" style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }} />
              <input type="time" value={followUpTime} onChange={e => setFollowUpTime(e.target.value)} className="flex-1 text-[12px] text-[#1E293B] rounded-[7px] bg-white" style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }} />
            </div>
            <div className="flex gap-[3px] mb-1.5">
              {FOLLOW_UP_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className={`flex-1 text-[12px] text-center rounded-[7px] transition-colors ${activeType === t ? 'bg-[#EFF6FF] text-[#2563EB] font-medium' : 'bg-white text-[#64748B]'}`}
                  style={{ border: `0.5px solid ${activeType === t ? '#2563EB' : '#E2E8F0'}`, padding: '6px 10px' }}
                >
                  {t}
                </button>
              ))}
            </div>
            <button onClick={handleScheduleFollowUp} className="w-full bg-[#2563EB] text-white text-[12px] font-medium rounded-[7px] hover:bg-[#1D4ED8] transition-colors" style={{ padding: '6px 10px' }}>
              {scheduled ? 'Scheduled ✓' : 'Schedule Follow Up'}
            </button>
          </div>
        </div>
      </div>

      {/* ── TABS BAR ── */}
      <div
        className="bg-white h-[40px] flex items-center px-4 sticky top-0 z-10"
        style={{ borderBottom: '0.5px solid #E2E8F0' }}
      >
        {MAIN_TABS.map(tab => (
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

      {/* ── MAIN BODY ── */}
      <div className="bg-[#F8FAFC] p-4">
        {activeTab === 'interview'     && InterviewTab}
        {activeTab === 'employment'    && EmploymentTab}
        {activeTab === 'communication' && CommunicationTab}
        {activeTab === 'documents'     && DocumentsTab}
      </div>

      </div>{/* end scrollable body */}
    </>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F8FAFC]">

      {/* ── ROW 1: Breadcrumbs (single mode only — in multi mode it lives inside the card) ── */}
      {!isMultiSelect && (
        <div
          className="h-[34px] bg-white flex items-center px-4 flex-shrink-0"
          style={{ borderBottom: '0.5px solid #E2E8F0' }}
        >
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage('people')}
              className="flex items-center gap-0.5 text-[12px] text-[#2563EB] hover:underline"
            >
              <ChevronLeft size={13} />
              People
            </button>
            <span className="text-[12px] text-[#64748B]">›</span>
            <span className="text-[12px] text-[#64748B]">{candidate?.name ?? 'Candidate'}</span>
          </div>
        </div>
      )}

      {isMultiSelect ? (
        <div className="flex-1 overflow-hidden relative">
          {/* Peek cards: narrower than main card (left/right > 24) so they don't spill out sideways */}
          {peekCount >= 2 && (
            <div
              className="absolute bg-white rounded-t-[12px] pointer-events-none"
              style={{ top: 10, left: 40, right: 40, height: 28, zIndex: 1, border: '0.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            />
          )}
          {peekCount >= 1 && (
            <div
              className="absolute bg-white rounded-t-[12px] pointer-events-none"
              style={{ top: 20, left: 32, right: 32, height: 28, zIndex: 2, border: '0.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            />
          )}
          {/* Main card: higher z-index so it covers the lower portions of peek cards */}
          <div className="h-full flex flex-col" style={{ paddingTop: 32, paddingLeft: 24, paddingRight: 24, paddingBottom: 24, position: 'relative', zIndex: 3 }}>
            <div className="flex-1 flex flex-col overflow-hidden" style={{ borderRadius: '12px 12px 0 0', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '0.5px solid #E2E8F0' }}>
              {cardContent}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {cardContent}
        </div>
      )}

      {/* ── ARCHIVE MODAL ───────────────────────────────────────────────────── */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-[10px] shadow-lg p-6 w-[380px]" style={{ border: '0.5px solid #E2E8F0' }}>
            <h3 className="text-[15px] font-semibold text-[#1E293B] mb-2">Archive candidate?</h3>
            <p className="text-[12px] text-[#64748B] mb-5" style={{ lineHeight: 1.5 }}>
              {candidate?.name ?? 'This candidate'} will be moved to your archive. You can restore them from the People page at any time.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setShowArchiveModal(false)} className="px-4 py-1.5 text-[12px] text-[#475569] bg-white rounded-[7px] hover:bg-[#F8FAFC]" style={{ border: '0.5px solid #E2E8F0' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  if (candidate) { onArchive(candidate.id); setCurrentPage('people') }
                  setShowArchiveModal(false)
                }}
                className="px-4 py-1.5 text-[12px] font-medium text-white bg-[#DC2626] rounded-[7px] hover:bg-[#B91C1C]">
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CANDIDATE EDIT PANEL ─────────────────────────────────────────────── */}
      <EditPanel isOpen={showCandPanel} onClose={() => setShowCandPanel(false)} title="Edit candidate" onSave={handleSaveCandidate} isSaving={isSavingCand}>
        <p className="text-[10px] uppercase text-[#64748B] font-medium tracking-[0.06em] mb-3">Personal Info</p>
        <div className="flex flex-col gap-3 mb-5">
          <div>
            <label className="block text-[11px] font-medium text-[#475569] mb-1">Full name</label>
            <input value={editCandName} onChange={e => setEditCandName(e.target.value)}
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] bg-white"
              style={{ border: '0.5px solid #E2E8F0', padding: '7px 10px' }} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#475569] mb-1">Specialty / Title</label>
            <input value={editSpecialty} onChange={e => setEditSpecialty(e.target.value)}
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] bg-white"
              style={{ border: '0.5px solid #E2E8F0', padding: '7px 10px' }} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#475569] mb-1">Classification</label>
            <input value={editClassif} onChange={e => setEditClassif(e.target.value)}
              placeholder="e.g. Senior, Mid-level"
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] bg-white placeholder:text-[#64748B]"
              style={{ border: '0.5px solid #E2E8F0', padding: '7px 10px' }} />
          </div>
        </div>

        <p className="text-[10px] uppercase text-[#64748B] font-medium tracking-[0.06em] mb-3">Location</p>
        <div className="mb-5">
          <CityAutocomplete cityValue={editCandCity} stateValue={editCandState} onCityChange={setEditCandCity} onStateChange={setEditCandState} />
        </div>

        <p className="text-[10px] uppercase text-[#64748B] font-medium tracking-[0.06em] mb-3">Contact</p>
        <div className="flex flex-col gap-3 mb-5">
          <div>
            <label className="block text-[11px] font-medium text-[#475569] mb-1">Phone (mobile)</label>
            <input value={editPhoneMob} onChange={e => setEditPhoneMob(formatPhone(e.target.value))}
              placeholder="(555) 000-0000"
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] bg-white placeholder:text-[#64748B]"
              style={{ border: '0.5px solid #E2E8F0', padding: '7px 10px' }} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#475569] mb-1">Email</label>
            <input type="email" value={editCandEmail} onChange={e => setEditCandEmail(e.target.value)}
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] bg-white"
              style={{ border: '0.5px solid #E2E8F0', padding: '7px 10px' }} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#475569] mb-1">LinkedIn URL</label>
            <input value={editLinkedin} onChange={e => setEditLinkedin(e.target.value)}
              placeholder="linkedin.com/in/username"
              className="w-full text-[12px] text-[#1E293B] rounded-[7px] bg-white placeholder:text-[#64748B]"
              style={{ border: '0.5px solid #E2E8F0', padding: '7px 10px' }} />
          </div>
        </div>

        <p className="text-[10px] uppercase text-[#64748B] font-medium tracking-[0.06em] mb-3">Job Spec</p>
        <div>
          <label className="block text-[11px] font-medium text-[#475569] mb-1">Source</label>
          <select value={editSource} onChange={e => setEditSource(e.target.value)}
            className="w-full text-[12px] text-[#1E293B] rounded-[7px] bg-white"
            style={{ border: '0.5px solid #E2E8F0', padding: '7px 10px' }}>
            <option value="">Select source...</option>
            <option>LinkedIn</option>
            <option>Indeed</option>
            <option>Referral</option>
            <option>Website</option>
            <option>Cold Outreach</option>
          </select>
        </div>
      </EditPanel>

      {/* ── PLACEMENT RECORD MODAL ──────────────────────────────────────────── */}
      {showPlacementModal && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-[10px] shadow-lg p-6 w-[460px]" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#1E293B]">Placement Record</h3>
              <button onClick={() => setShowPlacementModal(false)} className="text-[#64748B] hover:text-[#475569]"><X size={16} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-[#64748B] mb-1">Company</p>
                  <select value={placementCompany} onChange={e => setPlacementCompany(e.target.value)} className="w-full text-[12px] text-[#1E293B] rounded-[7px] bg-white" style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }}>
                    <option value="">Select company...</option>
                    <option>ABC Company</option>
                    <option>Glazers</option>
                    <option>Pepsico</option>
                  </select>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B] mb-1">Job Title</p>
                  <input value={placementTitle} onChange={e => setPlacementTitle(e.target.value)} placeholder=".Net Developer" className="w-full text-[12px] text-[#1E293B] rounded-[7px] bg-white" style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-[#64748B] mb-1">Start date</p>
                  <input type="date" value={placementStartDate} onChange={e => setPlacementStartDate(e.target.value)} className="w-full text-[12px] text-[#1E293B] rounded-[7px] bg-white" style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }} />
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B] mb-2">Type</p>
                  <div className="flex gap-2">
                    {(['permanent', 'contract'] as const).map(t => (
                      <button key={t} onClick={() => setPlacementType(t)}
                        className={`flex-1 py-1.5 text-[12px] font-medium rounded-[7px] transition-colors ${placementType === t ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-white text-[#64748B]'}`}
                        style={{ border: `0.5px solid ${placementType === t ? '#2563EB' : '#E2E8F0'}` }}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-[#64748B] mb-1">{placementType === 'permanent' ? 'Final salary' : 'Bill rate'}</p>
                  <input value={placementSalary} onChange={e => setPlacementSalary(e.target.value)} placeholder={placementType === 'permanent' ? '$85,000' : '$65/hr'} className="w-full text-[12px] text-[#1E293B] rounded-[7px] bg-white" style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }} />
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B] mb-1">Placement fee %</p>
                  <div className="flex items-center gap-2">
                    <input value={placementFee} onChange={e => setPlacementFee(e.target.value)} className="w-16 text-[12px] text-[#1E293B] rounded-[7px] bg-white" style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }} />
                    <span className="text-[12px] text-[#64748B]">%</span>
                    {placementSalary && !isNaN(parseFloat(placementSalary.replace(/[$,]/g, ''))) && (
                      <span className="text-[12px] text-[#1E293B]">= ${(parseFloat(placementSalary.replace(/[$,]/g, '')) * parseFloat(placementFee || '0') / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-[#64748B] mb-1">Notes</p>
                <textarea value={placementNotes} onChange={e => setPlacementNotes(e.target.value)} placeholder="Any notes about this placement..." className="w-full text-[12px] text-[#1E293B] rounded-[7px] bg-white resize-none" style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px', minHeight: 60 }} />
              </div>
              <div className="flex items-center gap-2 justify-end mt-1">
                <button onClick={() => setShowPlacementModal(false)} className="px-4 py-1.5 text-[12px] text-[#475569] bg-white rounded-[7px] hover:bg-[#F8FAFC]" style={{ border: '0.5px solid #E2E8F0' }}>Cancel</button>
                <button onClick={() => {
                  setStage('Placed')
                  setShowPlacementModal(false)
                }} className="px-4 py-1.5 text-[12px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-[#1D4ED8]">
                  Save Placement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
