export type CompanyStatus = 'Active' | 'Paused' | 'Prospect'

export interface Company {
  id:         string
  name:       string
  industry:   string
  location:   string
  city:       string
  state:      string
  zip:        string
  phone:      string
  website:    string
  status:     CompanyStatus
  activeJobs: number
  dateAdded:  string
  notes:      string
  ownerId:    string
  ownerName:  string
}
