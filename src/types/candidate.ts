export type CandidateStage = 'New' | 'Phone Screen' | 'Interview' | 'References' | 'Submitted' | 'Placed'

export interface Candidate {
  id:              string
  name:            string
  email:           string
  phone:           string
  specialty:       string
  resumeFileName?: string
  stage:           CandidateStage
  rating:          string
  location:        string
  addedDate:       string
  notes:           string
  starred?:        boolean
  ownerId?:        string
  ownerEmail?:     string
  ownerName?:      string
  isArchived?:     boolean
  attachedJobIds?:        string[]
  source?:               string
  followUpDate?:         string
  followUpTime?:         string
  followUpType?:         string
  workType?:             string
  ptoDays?:              string
  healthInsurance?:      string
  retirementMatch?:      string
  annualBonus?:          string
  qualificationAnswers?: Record<string, boolean | string>
  resumeData?: {
    summary:    string
    experience: string
    education:  string
    skills:     string
  }
}

// ── Avatar helpers ─────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  { bg: '#DBEAFE', clr: '#1D4ED8' },
  { bg: '#F3E8FF', clr: '#6D28D9' },
  { bg: '#DCFCE7', clr: '#15803D' },
  { bg: '#FFFBEB', clr: '#B45309' },
  { bg: '#FFEDD5', clr: '#9A3412' },
  { bg: '#EEF2FF', clr: '#3730A3' },
  { bg: '#FCE7F3', clr: '#9D174D' },
  { bg: '#F0FDF4', clr: '#166534' },
  { bg: '#FFF7ED', clr: '#C2410C' },
  { bg: '#F0F9FF', clr: '#0369A1' },
]

export function getAvatarColor(id: string): { bg: string; clr: string } {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[hash]
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}
