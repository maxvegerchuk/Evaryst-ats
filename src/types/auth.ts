export interface User {
  id:       string
  email:    string
  name:     string
  role:     'recruiter' | 'talent_acquisition_manager'
  company:  string
  initials: string
  teamId:   string
}

// ── Team Alpha ────────────────────────────────────────────────────────────────

export const BETA_MANAGER: User = {
  id:       'beta-manager',
  email:    'admin@evaryst.com',
  name:     'Max Vegerchuk',
  role:     'talent_acquisition_manager',
  company:  'Evaryst Demo',
  initials: 'MV',
  teamId:   'team-alpha',
}

export const BETA_RECRUITER: User = {
  id:       'beta-recruiter',
  email:    'max.recruiter@evaryst.com',
  name:     'Max Recruiter',
  role:     'recruiter',
  company:  'Evaryst Demo',
  initials: 'MR',
  teamId:   'team-alpha',
}

// ── Team Beta ─────────────────────────────────────────────────────────────────

export const DEMO_MANAGER: User = {
  id:       'demo-manager',
  email:    'manager@evaryst.com',
  name:     'Thane Hayhurst',
  role:     'talent_acquisition_manager',
  company:  'Evaryst Demo',
  initials: 'TH',
  teamId:   'team-beta',
}

export const DEMO_USER: User = {
  id:       'tm-recruiter-demo',
  email:    'recruiter@evaryst.com',
  name:     'Alex Johnson',
  role:     'recruiter',
  company:  'Evaryst Demo',
  initials: 'AJ',
  teamId:   'team-beta',
}

// ── Credentials table (email → { user, password }) ───────────────────────────

export const CREDENTIALS: Record<string, { user: User; password: string }> = {
  [DEMO_USER.email]:      { user: DEMO_USER,      password: 'recruiter123' },
  [DEMO_MANAGER.email]:   { user: DEMO_MANAGER,   password: 'manager123'  },
  [BETA_RECRUITER.email]: { user: BETA_RECRUITER,  password: 'recruiter456' },
  [BETA_MANAGER.email]:   { user: BETA_MANAGER,    password: 'manager456'  },
}
