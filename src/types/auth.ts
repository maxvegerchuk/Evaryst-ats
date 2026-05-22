export interface User {
  id: string
  email: string
  name: string
  role: 'recruiter' | 'talent_acquisition_manager'
  company: string
  initials: string
}

export const DEMO_USER: User = {
  id: 'tm-recruiter-demo',
  email: 'recruiter@evaryst.com',
  name: 'Alex Johnson',
  role: 'recruiter',
  company: 'Evaryst Demo',
  initials: 'AJ',
}

export const DEMO_MANAGER: User = {
  id: 'demo-manager',
  email: 'manager@evaryst.com',
  name: 'Sarah Mitchell',
  role: 'talent_acquisition_manager',
  company: 'Evaryst Demo',
  initials: 'SM',
}
