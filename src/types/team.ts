export interface TeamMember {
  id:        string
  email:     string
  name?:     string
  role:      'recruiter' | 'talent_acquisition_manager'
  status:    'pending' | 'active'
  invitedAt: string
}
