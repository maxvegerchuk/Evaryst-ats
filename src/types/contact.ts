export type ContactStatus = 'Active' | 'Inactive' | 'Lead'

export interface Contact {
  id:          string
  name:        string
  title:       string
  company:     string
  companyId?:  string
  phone:       string
  email:       string
  status:      ContactStatus
  lastContact: string
}
