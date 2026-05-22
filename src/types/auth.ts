export interface User {
  id: string
  email: string
  name: string
  role: 'recruiter' | 'talent_acquisition_manager'
  company: string
  initials: string
}

export const DEMO_USER: User = {
  id: 'demo-1',
  email: 'recruiter@evaryst.com',
  name: 'Recruiter',
  role: 'recruiter',
  company: 'Evaryst Demo',
  initials: 'R',
}

export const DEMO_MANAGER: User = {
  id: 'demo-2',
  email: 'manager@evaryst.com',
  name: 'Thane Hayhurst',
  role: 'talent_acquisition_manager',
  company: 'Evaryst Demo',
  initials: 'TH',
}
