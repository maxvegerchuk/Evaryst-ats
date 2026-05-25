import { useState } from 'react'
import { Eye, EyeOff, Check, ChevronLeft } from 'lucide-react'
import type { User } from '../types/auth'
import { DEMO_USER, DEMO_MANAGER } from '../types/auth'

interface LoginPageProps { onLogin: (user: User) => void }

export function LoginPage({ onLogin }: LoginPageProps) {
  const [loginEmail,    setLoginEmail]    = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError,    setLoginError]    = useState<string | null>(null)
  const [showPwd,       setShowPwd]       = useState(false)

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
    setLoginError('Invalid email or password')
  }

  const inputCls = 'w-full border-subtle rounded-[8px] px-3 py-2.5 text-[13px] text-[#1E293B] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF]'

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Left panel ─────────────────────────────────────────── */}
      <div
        className="w-[45%] min-h-screen hidden lg:flex flex-col relative"
        style={{ backgroundColor: '#0d1b2e' }}
      >
        {/* Dot pattern — matches hero section */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.4,
          pointerEvents: 'none',
        }} />

        <div className="relative flex flex-col h-full" style={{ zIndex: 1 }}>
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
              {['Full candidate pipeline management', 'Smart outreach & scheduling tools', 'Real-time recruiting analytics'].map(t => (
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
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="max-w-[400px] w-full mx-auto">

          <button
            onClick={() => { window.location.href = '/' }}
            className="flex items-center gap-1 mb-8 text-[12px] text-[#64748B] hover:text-[#1E293B] transition-colors"
          >
            <ChevronLeft size={14} />
            Back to home
          </button>

          <h1 className="text-[26px] font-semibold text-[#1E293B] mb-1">Welcome back</h1>
          <p className="text-[14px] text-[#64748B] mb-8">Sign in to your account</p>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-[12px] font-medium text-[#475569]">Email address</label>
            <input
              type="email"
              value={loginEmail}
              onChange={e => { setLoginEmail(e.target.value); setLoginError(null) }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="you@company.com"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#475569]">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={loginPassword}
                onChange={e => { setLoginPassword(e.target.value); setLoginError(null) }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className={inputCls + ' pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {loginError && (
            <div className="mt-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] px-3 py-2 text-[#DC2626] text-[12px]">
              {loginError}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            className="mt-6 w-full bg-[#2563EB] text-white rounded-[8px] py-2.5 text-[13px] font-medium hover:bg-[#1D4ED8] transition-colors"
          >
            Sign in
          </button>

        </div>
      </div>
    </div>
  )
}
