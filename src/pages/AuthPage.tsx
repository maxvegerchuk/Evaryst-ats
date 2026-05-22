import { useState } from 'react'
import { Eye, EyeOff, Check, Briefcase, Users } from 'lucide-react'
import type { User } from '../types/auth'
import { DEMO_USER, DEMO_MANAGER } from '../types/auth'
import everestImg from '../assets/everest.webp'

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  return (parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2)
  ).toUpperCase()
}

function calculateStrength(p: string): 0|1|2|3|4 {
  if (!p) return 0
  if (p.length < 6) return 1
  const hasNum  = /\d/.test(p)
  const hasSpc  = /[^a-zA-Z0-9]/.test(p)
  if (p.length >= 8 && hasNum && hasSpc) return 4
  if (p.length >= 6 && (hasNum || hasSpc))  return 3
  return 2
}

interface AuthPageProps { onLogin: (user: User) => void }

export function AuthPage({ onLogin }: AuthPageProps) {
  const [view, setView] = useState<'login'|'register'>('login')

  // login
  const [loginEmail,    setLoginEmail]    = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError,    setLoginError]    = useState<string|null>(null)
  const [showPwd,       setShowPwd]       = useState(false)

  // register
  const [regName,     setRegName]     = useState('')
  const [regEmail,    setRegEmail]    = useState('')
  const [regPwd,      setRegPwd]      = useState('')
  const [regConfirm,  setRegConfirm]  = useState('')
  const [regCompany,  setRegCompany]  = useState('')
  const [regRole,     setRegRole]     = useState<'recruiter'|'talent_acquisition_manager'>('recruiter')
  const [regTerms,    setRegTerms]    = useState(false)
  const [pwdStrength, setPwdStrength] = useState<0|1|2|3|4>(0)
  const [regError,    setRegError]    = useState<string|null>(null)

  function resolveTeamMemberId(email: string, fallbackId: string): string {
    try {
      const members = JSON.parse(localStorage.getItem('evaryst_team_members') || '[]') as { id: string; email: string }[]
      const match = members.find(m => m.email === email)
      return match ? match.id : fallbackId
    } catch { return fallbackId }
  }

  function activateTeamMember(email: string, name: string) {
    try {
      const members = JSON.parse(localStorage.getItem('evaryst_team_members') || '[]') as { id: string; email: string; name?: string; status: string }[]
      const updated = members.map(m => m.email === email ? { ...m, name, status: 'active' } : m)
      localStorage.setItem('evaryst_team_members', JSON.stringify(updated))
    } catch { /* ignore */ }
  }

  function handleLogin() {
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter your email and password')
      return
    }
    if (loginEmail === DEMO_USER.email && loginPassword === 'recruiter123') {
      onLogin(DEMO_USER)
      return
    }
    if (loginEmail === DEMO_MANAGER.email && loginPassword === 'manager123') {
      onLogin(DEMO_MANAGER)
      return
    }
    try {
      const list = JSON.parse(localStorage.getItem('evaryst_registered_users') || '[]') as (User & { password: string })[]
      const found = list.find(u => u.email === loginEmail && u.password === loginPassword)
      if (found) {
        const { password: _p, ...user } = found
        // Sync ID with team member record in case they registered after being invited
        const syncedId = resolveTeamMemberId(user.email, user.id)
        onLogin({ ...(user as User), id: syncedId })
        return
      }
    } catch { /* ignore */ }
    setLoginError('Invalid email or password')
  }

  function handleRegister() {
    if (regPwd !== regConfirm) { setRegError('Passwords do not match'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) { setRegError('Please enter a valid email address'); return }
    // Reuse team member ID if this email was already invited, so job assignments stay linked
    const id = resolveTeamMemberId(regEmail, 'user-' + Date.now())
    const newUser: User = {
      id,
      email: regEmail,
      name: regName,
      role: regRole,
      company: regCompany,
      initials: getInitials(regName),
    }
    activateTeamMember(regEmail, regName)
    try {
      const existing = JSON.parse(localStorage.getItem('evaryst_registered_users') || '[]')
      localStorage.setItem('evaryst_registered_users', JSON.stringify([...existing, { ...newUser, password: regPwd }]))
    } catch { /* ignore */ }
    onLogin(newUser)
  }

  const regDisabled = !regName || !regEmail || !regPwd || !regConfirm || !regCompany || !regTerms || regPwd !== regConfirm

  const inputCls = 'w-full border-subtle rounded-[8px] px-3 py-2.5 text-[13px] text-[#1E293B] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF]'

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Left panel ─────────────────────────────────────────── */}
      <div
        className="w-[45%] min-h-screen hidden lg:flex flex-col relative"
        style={{ backgroundImage: `url(${everestImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Blue overlay */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(37, 99, 235, 0.78)' }} />

        {/* Content sits above overlay */}
        <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 p-8">
          <div className="w-9 h-9 rounded-[9px] bg-white/20 flex items-center justify-center">
            <span className="text-[18px] font-bold text-white">E</span>
          </div>
          <span className="text-[18px] font-semibold text-white">Evaryst</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-12">
          <div className="mb-10 w-full">
            <p className="text-[42px] font-bold text-white leading-tight">Hire smarter.</p>
            <p className="text-[42px] font-bold text-white/80 leading-tight">Track better.</p>
            <p className="text-[42px] font-bold text-white/60 leading-tight">Place faster.</p>
          </div>
          <div className="space-y-3 w-full">
            {['Full candidate pipeline management','Smart outreach & scheduling tools','Real-time recruiting analytics'].map(t => (
              <div key={t} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-[14px] text-white/90">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-12 pb-8">
          <p className="text-[12px] text-white/40">© 2026 Evaryst. All rights reserved.</p>
        </div>
        </div>{/* /relative z-10 */}
      </div>

      {/* ── Right panel ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 overflow-y-auto">
        <div className="max-w-[400px] w-full mx-auto py-8">

          {view === 'login' ? (
            <>
              <h1 className="text-[26px] font-semibold text-[#1E293B] mb-1">Welcome back</h1>
              <p className="text-[14px] text-[#64748B] mb-8">Sign in to your account</p>

              <div className="flex flex-col gap-1 mb-4">
                <label className="text-[12px] font-medium text-[#475569]">Email address</label>
                <input type="email" value={loginEmail} onChange={e => { setLoginEmail(e.target.value); setLoginError(null) }} placeholder="you@company.com" className={inputCls} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-[#475569]">Password</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={loginPassword} onChange={e => { setLoginPassword(e.target.value); setLoginError(null) }} placeholder="••••••••" className={inputCls + ' pr-10'} />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="accent-[#2563EB]" />
                  <span className="text-[12px] text-[#475569]">Remember me</span>
                </label>
                <button type="button" className="text-[12px] text-[#2563EB] hover:underline">Forgot password?</button>
              </div>

              {loginError && (
                <div className="mt-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] px-3 py-2 text-[#DC2626] text-[12px]">{loginError}</div>
              )}

              <button type="button" onClick={handleLogin} className="mt-6 w-full bg-[#2563EB] text-white rounded-[8px] py-2.5 text-[13px] font-medium hover:bg-[#1D4ED8] transition-colors">
                Sign in
              </button>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-[#E2E8F0]" />
                <span className="text-[12px] text-[#94A3B8]">or</span>
                <div className="flex-1 h-px bg-[#E2E8F0]" />
              </div>

              <button type="button" className="w-full border-subtle rounded-[8px] py-2.5 flex items-center justify-center gap-2 hover:bg-[#F8FAFC] transition-colors">
                <span className="text-[16px] font-bold leading-none">
                  <span style={{color:'#4285F4'}}>G</span><span style={{color:'#EA4335'}}>o</span><span style={{color:'#FBBC05'}}>o</span><span style={{color:'#4285F4'}}>g</span><span style={{color:'#34A853'}}>l</span><span style={{color:'#EA4335'}}>e</span>
                </span>
                <span className="text-[13px] text-[#475569]">Continue with Google</span>
              </button>

              <p className="mt-6 text-center">
                <span className="text-[12px] text-[#64748B]">Don't have an account? </span>
                <button type="button" onClick={() => setView('register')} className="text-[12px] text-[#2563EB] font-medium hover:underline">Sign up free</button>
              </p>

              <div className="mt-6 bg-[#F8FAFC] border-subtle rounded-[8px] p-3">
                <p className="text-[11px] font-medium text-[#475569] mb-1.5">Demo credentials</p>
                <p className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wide mb-0.5">Recruiter</p>
                <p className="text-[11px] text-[#64748B]">recruiter@evaryst.com / recruiter123</p>
                <p className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wide mt-2 mb-0.5">Manager</p>
                <p className="text-[11px] text-[#64748B]">manager@evaryst.com / manager123</p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-[26px] font-semibold text-[#1E293B] mb-1">Create your account</h1>
              <p className="text-[14px] text-[#64748B] mb-6">Start your free trial</p>

              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-medium text-[#475569]">Full name</label>
                  <input type="text" value={regName} onChange={e => { setRegName(e.target.value); setRegError(null) }} placeholder="John Smith" className={inputCls} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-medium text-[#475569]">Work email</label>
                  <input type="email" value={regEmail} onChange={e => { setRegEmail(e.target.value); setRegError(null) }} placeholder="you@company.com" className={inputCls} />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-medium text-[#475569]">Password</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} value={regPwd} onChange={e => { setRegPwd(e.target.value); setPwdStrength(calculateStrength(e.target.value)); setRegError(null) }} placeholder="••••••••" className={inputCls + ' pr-10'} />
                    <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {regPwd && (
                    <>
                      <div className="flex gap-1 mt-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${pwdStrength >= i ? i<=1?'bg-red-400':i<=2?'bg-amber-400':i<=3?'bg-blue-400':'bg-green-400' : 'bg-[#E2E8F0]'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-[#94A3B8] mt-0.5">{['','Weak','Fair','Good','Strong'][pwdStrength]}</span>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-medium text-[#475569]">Confirm password</label>
                  <input type="password" value={regConfirm} onChange={e => { setRegConfirm(e.target.value); setRegError(null) }} placeholder="••••••••" className={inputCls} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[#475569]">Your role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['recruiter','talent_acquisition_manager'] as const).map(r => (
                      <button key={r} type="button" onClick={() => setRegRole(r)}
                        className={`border rounded-[8px] p-3 text-left transition-colors ${regRole===r?'border-[#2563EB] bg-[#EFF6FF]':'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'}`}>
                        {r==='recruiter' ? <Briefcase size={18} className="text-[#2563EB] mb-1" /> : <Users size={18} className="text-[#2563EB] mb-1" />}
                        <div className="text-[13px] font-medium text-[#1E293B]">{r==='recruiter'?'Recruiter':'Manager'}</div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">{r==='recruiter'?'Manage candidates':'Oversee your team'}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-medium text-[#475569]">Company name</label>
                  <input type="text" value={regCompany} onChange={e => { setRegCompany(e.target.value); setRegError(null) }} placeholder="Acme Staffing Inc." className={inputCls} />
                </div>

                <div className="flex items-start gap-2">
                  <input type="checkbox" checked={regTerms} onChange={e => setRegTerms(e.target.checked)} className="mt-0.5 accent-[#2563EB]" />
                  <span className="text-[12px] text-[#475569]">
                    I agree to the <span className="text-[#2563EB] cursor-pointer hover:underline">Terms of Service</span> and <span className="text-[#2563EB] cursor-pointer hover:underline">Privacy Policy</span>
                  </span>
                </div>
              </div>

              {regError && (
                <div className="mt-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] px-3 py-2 text-[#DC2626] text-[12px]">{regError}</div>
              )}

              <button type="button" onClick={handleRegister} disabled={regDisabled}
                className={`mt-6 w-full rounded-[8px] py-2.5 text-[13px] font-medium text-white transition-colors bg-[#2563EB] ${regDisabled?'opacity-50 cursor-not-allowed':'hover:bg-[#1D4ED8]'}`}>
                Create account
              </button>

              <p className="mt-6 text-center">
                <span className="text-[12px] text-[#64748B]">Already have an account? </span>
                <button type="button" onClick={() => setView('login')} className="text-[12px] text-[#2563EB] font-medium hover:underline">Sign in</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
