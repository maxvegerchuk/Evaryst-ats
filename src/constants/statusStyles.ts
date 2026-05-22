export type StyleToken = { bg: string; text: string; border?: string }

export const STAGE_STYLES: Record<string, StyleToken> = {
  'New':          { bg: '#F1F5F9', text: '#475569' },
  'Phone Screen': { bg: '#DBEAFE', text: '#1D4ED8' },
  'Interview':    { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  'References':   { bg: '#F3E8FF', text: '#6D28D9' },
  'Submitted':    { bg: '#FFEDD5', text: '#9A3412' },
  'Placed':       { bg: '#DCFCE7', text: '#15803D' },
}

export const JOB_STATUS_STYLES: Record<string, StyleToken> = {
  'Open':    { bg: '#DCFCE7', text: '#15803D' },
  'Closed':  { bg: '#F1F5F9', text: '#475569' },
  'On Hold': { bg: '#FEF3C7', text: '#92400E' },
}

export const RATING_STYLES: Record<string, StyleToken> = {
  'Paper A': { bg: '#DBEAFE', text: '#1D4ED8' },
  'Paper B': { bg: '#F3E8FF', text: '#6D28D9' },
  'A':       { bg: '#DCFCE7', text: '#15803D' },
  'B':       { bg: '#FFFBEB', text: '#B45309' },
  'X':       { bg: '#FEE2E2', text: '#B91C1C' },
}

export const COMPANY_STATUS_STYLES: Record<string, StyleToken> = {
  'Active':  { bg: '#DCFCE7', text: '#15803D' },
  'Paused':  { bg: '#FEF3C7', text: '#92400E' },
  'Prospect':{ bg: '#DBEAFE', text: '#1D4ED8' },
}
