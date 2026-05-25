import { useState } from 'react'
import { Eye, EyeOff, ChevronLeft } from 'lucide-react'
import type { User } from '../types/auth'
import { DEMO_USER, DEMO_MANAGER } from '../types/auth'
import everestImg from '../assets/everest.webp'

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
        className="hidden lg:flex"
        style={{
          width: '45%',
          minHeight: '100vh',
          position: 'relative',
          flexDirection: 'column',
          background: '#0F172A',
          backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Mountain image at low opacity */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${everestImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          opacity: 0.15,
          zIndex: 0,
        }} />

        {/* All content above the image */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Logo */}
        <div style={{ padding: '32px 40px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            backgroundColor: '#2a6fdb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '15px', fontWeight: '600',
          }}>E</div>
          <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>Evaryst</span>
        </div>

        {/* Center content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 48px' }}>
          <p style={{ fontSize: '44px', fontWeight: 300, fontFamily: '"Fraunces", serif', color: '#ffffff',              lineHeight: 1.2, margin: '0 0 8px' }}>Hire smarter.</p>
          <p style={{ fontSize: '44px', fontWeight: 300, fontFamily: '"Fraunces", serif', color: 'rgba(255,255,255,0.7)', lineHeight: 1.2, margin: '0 0 8px' }}>Track better.</p>
          <p style={{ fontSize: '44px', fontWeight: 300, fontFamily: '"Fraunces", serif', fontStyle: 'italic', color: '#2a6fdb', lineHeight: 1.2, margin: '0 0 40px' }}>Place faster.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Full candidate pipeline management', 'Smart outreach & scheduling tools', 'Real-time recruiting analytics'].map(text => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: '1px solid rgba(42, 111, 219, 0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#2a6fdb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div style={{ padding: '24px 48px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>© 2026 Evaryst. All rights reserved.</p>
        </div>

        </div>{/* end content wrapper */}
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
