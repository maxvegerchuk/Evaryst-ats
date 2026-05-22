export type JobStatus  = 'Open' | 'On Hold' | 'Closed'
export type JobType    = 'Full Time' | 'Part Time' | 'Contract' | 'Contract to Hire'
export type SalaryType = 'year' | 'hour'

export interface Job {
  id:                     string
  title:                  string
  companyId:              string
  companyName:            string
  jobType:                JobType
  salaryMin:              string
  salaryMax:              string
  salaryType:             SalaryType
  location:               string
  address?:               string
  ownerName?:             string
  ownerId?:               string
  status:                 JobStatus
  assignedRecruiterId:    string
  assignedRecruiterEmail: string
  assignedRecruiterName:  string
  recruiterIds:           string[]
  recruiterEmails:        string[]
  description:            string
  dateAdded:              string
  candidates:             number
  internalId:             string
  clientReqNumber:        string
}

export function daysOpen(dateAdded: string): number {
  const added = new Date(dateAdded)
  const now   = new Date()
  return Math.floor((now.getTime() - added.getTime()) / 86_400_000)
}
