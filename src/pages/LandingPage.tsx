import { useState, useEffect } from 'react'
import { Rocket, Users, Phone, BarChart2, Briefcase, Search, Building2, Check } from 'lucide-react'
import heroRecruiter        from '../assets/hero-recruiter.jpg'
import pipelineIllustration from '../assets/pipeline-illustration.jpg'
import sarahAvatar          from '../assets/sarah-avatar.jpg'

interface LandingPageProps {
  isAuthenticated: boolean
  onGoToApp: () => void
}

const FEATURES = [
  { icon: Users,     accentColor: '#2563EB', iconBg: '#EFF6FF', iconClr: '#2563EB', title: 'Candidate pipeline',  desc: 'Track every candidate from New to Placed. Full profile with resume, qualification, and contact history.' },
  { icon: Phone,     accentColor: '#16A34A', iconBg: '#F0FDF4', iconClr: '#15803D', title: 'Outreach tracking',   desc: 'Log calls and meetings, track status updates, and never lose a follow-up.' },
  { icon: BarChart2, accentColor: '#9333EA', iconBg: '#FAF5FF', iconClr: '#6D28D9', title: 'Team analytics',      desc: 'Managers see pipeline health, recruiter performance, and placement metrics in real time.' },
  { icon: Briefcase, accentColor: '#EA580C', iconBg: '#FFF7ED', iconClr: '#C2410C', title: 'Job management',      desc: 'Create jobs, assign recruiters, and track every position across your client companies.' },
  { icon: Search,    accentColor: '#2563EB', iconBg: '#EFF6FF', iconClr: '#2563EB', title: 'Advanced search',     desc: 'Find the right candidate fast with keyword and boolean search across your talent database.' },
  { icon: Building2, accentColor: '#16A34A', iconBg: '#F0FDF4', iconClr: '#15803D', title: 'Client management',   desc: 'Manage client companies, contacts, and job orders. All client intel in one profile.' },
]


const PREVIEW_ROWS = [
  { initials: 'MW', name: 'Marcus Webb',  stage: 'Phone Screen', stageBg: 'rgba(37,99,235,0.25)',  stageClr: '#93C5FD', rating: 'Paper A', ratingBg: 'rgba(37,99,235,0.2)',   ratingClr: '#93C5FD', job: '.NET Dev'    },
  { initials: 'AF', name: 'Ava Foster',   stage: 'Interview',    stageBg: 'rgba(245,158,11,0.25)', stageClr: '#FCD34D', rating: 'Paper A', ratingBg: 'rgba(37,99,235,0.2)',   ratingClr: '#93C5FD', job: 'UX Designer' },
  { initials: 'MH', name: 'Mason Harper', stage: 'Submitted',    stageBg: 'rgba(234,88,12,0.25)',  stageClr: '#FCA5A5', rating: 'A',       ratingBg: 'rgba(147,51,234,0.2)', ratingClr: '#C4B5FD', job: 'DevOps'      },
]

export function LandingPage({ isAuthenticated, onGoToApp }: LandingPageProps) {
  const [isScrolled,     setIsScrolled]     = useState(false)
  const [billingPeriod,  setBillingPeriod]  = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const starterPrice = billingPeriod === 'monthly' ? 29 : 23
  const teamPrice    = billingPeriod === 'monthly' ? 59 : 47

  const restFeatures = FEATURES.slice(1)

  // ── shared style helpers ────────────────────────────────────────────────────

  const hoverCard = (el: HTMLDivElement, enter: boolean) => {
    el.style.transform   = enter ? 'translateY(-3px)' : 'translateY(0)'
    el.style.boxShadow   = enter ? '0 8px 24px rgba(0,0,0,0.08)' : 'none'
  }

  const hoverPriceCard = (el: HTMLDivElement, enter: boolean, isPopular = false) => {
    el.style.transform = enter ? 'scale(1.01)' : 'scale(1)'
    if (!isPopular) el.style.boxShadow = enter ? '0 4px 16px rgba(0,0,0,0.06)' : 'none'
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── NAV ──────────────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center px-10 transition-all duration-300"
        style={{
          height: 56,
          background:   isScrolled ? 'white'                    : 'transparent',
          borderBottom: isScrolled ? '0.5px solid #E2E8F0'      : 'none',
          boxShadow:    isScrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <div
            className="flex items-center justify-center rounded-[7px]"
            style={{ width: 30, height: 30, background: '#2563EB' }}
          >
            <span className="font-semibold text-white" style={{ fontSize: 13 }}>E</span>
          </div>
          <span
            className="ml-2 font-medium transition-colors duration-300"
            style={{ fontSize: 15, color: isScrolled ? '#1E293B' : 'white' }}
          >
            Evaryst
          </span>
        </div>

        {/* Center links */}
        <div className="flex-1 flex justify-center gap-8">
          {([['Features', 'features'], ['How it works', 'how-it-works'], ['Pricing', 'pricing']] as [string, string][]).map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="bg-transparent border-none cursor-pointer transition-colors duration-200"
              style={{ fontSize: 13, color: isScrolled ? '#475569' : '#94A3B8' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = isScrolled ? '#1E293B' : 'white' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = isScrolled ? '#475569' : '#94A3B8' }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              onClick={onGoToApp}
              className="font-medium text-white rounded-[7px] transition-opacity hover:opacity-90"
              style={{ fontSize: 13, padding: '8px 16px', background: '#2563EB' }}
            >
              Go to app →
            </button>
          ) : (
            <>
              <button
                onClick={() => { window.location.href = '/login' }}
                className="rounded-[7px] transition-colors"
                style={{
                  fontSize: 13,
                  padding: '8px 16px',
                  color:      isScrolled ? '#1E293B' : 'white',
                  background: 'transparent',
                  border:     isScrolled ? '0.5px solid #E2E8F0' : '1px solid rgba(255,255,255,0.2)',
                }}
              >
                Sign in
              </button>
              <button
                onClick={() => scrollTo('pricing')}
                className="font-medium text-white rounded-[7px] transition-opacity hover:opacity-90"
                style={{ fontSize: 13, padding: '8px 16px', background: '#2563EB' }}
              >
                Request access
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        style={{ background: '#0F172A', position: 'relative', overflow: 'hidden', paddingTop: 100, paddingBottom: 80 }}
      >
        {/* Dot pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.4,
          pointerEvents: 'none',
        }} />

        {/* Blue glow — right side */}
        <div style={{
          position: 'absolute',
          right: -60, top: '50%',
          transform: 'translateY(-50%)',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div
          className="relative grid grid-cols-2 gap-12 items-center mx-auto"
          style={{ maxWidth: 1200, padding: '0 40px' }}
        >
          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-5"
              style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(96,165,250,0.4)' }}
            >
              <Rocket size={12} style={{ color: '#60A5FA' }} />
              <span className="font-medium" style={{ fontSize: 11, color: '#60A5FA' }}>Built for staffing agencies</span>
            </div>

            <h1 className="font-semibold leading-tight mb-4" style={{ fontSize: 42, color: 'white' }}>
              The ATS that helps you<br />
              <span style={{ color: '#60A5FA' }}>place candidates faster</span>
            </h1>

            <p className="leading-relaxed mb-8" style={{ fontSize: 16, color: '#94A3B8', maxWidth: 460 }}>
              Evaryst gives recruiting teams a modern pipeline, smart outreach tracking,
              and real-time analytics — without the complexity of legacy systems.
            </p>

            <div className="flex gap-3 items-center">
              <button
                onClick={() => scrollTo('pricing')}
                className="font-medium text-white rounded-[8px] transition-colors"
                style={{ fontSize: 14, padding: '11px 22px', background: '#2563EB' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1D4ED8' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563EB' }}
              >
                Request access
              </button>
              <button
                onClick={() => scrollTo('features')}
                className="rounded-[8px] transition-colors"
                style={{
                  fontSize: 14, padding: '11px 22px',
                  color: 'white',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)' }}
              >
                See it in action
              </button>
            </div>

            <p className="mt-3" style={{ fontSize: 11, color: '#475569' }}>
              No credit card required · Setup in minutes
            </p>
          </div>

          {/* Right — recruiter image */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', maxHeight: '480px' }}>
            <img
              src={heroRecruiter}
              alt="Recruiter using Evaryst"
              style={{
                width: 'auto',
                height: '100%',
                maxHeight: '480px',
                maxWidth: '100%',
                borderRadius: '16px',
                objectFit: 'cover',
                objectPosition: 'top center',
                display: 'block',
                position: 'relative',
                zIndex: 1,
              }}
            />
            <div style={{
              position: 'absolute',
              width: 400, height: 400,
              background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              zIndex: 0,
            }} />
          </div>
        </div>
      </section>


      {/* ── SEE IT IN ACTION ─────────────────────────────────────────────────────── */}
      <div style={{ background: '#0F172A', padding: '0 40px 80px' }}>
        <p className="text-center mb-2 font-medium" style={{ fontSize: 22, color: 'white', paddingTop: 0 }}>
          See your pipeline in action
        </p>
        <p className="text-center mb-10" style={{ fontSize: 14, color: '#94A3B8' }}>
          Real-time overview of your team's recruiting activity
        </p>

        <div
          className="rounded-[14px] mx-auto"
          style={{
            maxWidth: 800,
            padding: 20,
            background: 'rgba(255,255,255,0.05)',
            border: '0.5px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Placements',        value: 12, trend: '+3 vs last month',  trendClr: '#4ADE80' },
              { label: 'Active candidates', value: 84, trend: '+12 this week',     trendClr: '#4ADE80' },
              { label: 'Open jobs',         value: 17, trend: 'Across 8 clients',  trendClr: '#94A3B8' },
              { label: 'Interviews',        value: 31, trend: '+8 vs last month',  trendClr: '#4ADE80' },
            ].map(kpi => (
              <div
                key={kpi.label}
                className="rounded-[8px] p-3"
                style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.1)' }}
              >
                <p style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>{kpi.label}</p>
                <p className="font-medium" style={{ fontSize: 20, color: 'white', marginBottom: 2 }}>{kpi.value}</p>
                <p style={{ fontSize: 10, color: kpi.trendClr }}>{kpi.trend}</p>
              </div>
            ))}
          </div>

          {/* Candidate table */}
          <div className="overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
            <div
              className="grid px-4 py-2.5"
              style={{
                gridTemplateColumns: '2fr 1.4fr 0.8fr 1fr',
                background: 'rgba(255,255,255,0.06)',
              }}
            >
              {['NAME', 'STAGE', 'RATING', 'JOB'].map(h => (
                <span key={h} className="font-medium" style={{ fontSize: 10, color: '#64748B' }}>{h}</span>
              ))}
            </div>
            {PREVIEW_ROWS.map((row) => (
              <div
                key={row.name}
                className="grid items-center px-4 py-2.5"
                style={{
                  gridTemplateColumns: '2fr 1.4fr 0.8fr 1fr',
                  borderTop: '0.5px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ width: 22, height: 22, background: 'rgba(37,99,235,0.3)' }}
                  >
                    <span style={{ fontSize: 8, fontWeight: 600, color: '#93C5FD' }}>{row.initials}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'white' }}>{row.name}</span>
                </div>
                <span
                  className="rounded-full"
                  style={{ fontSize: 9, background: row.stageBg, color: row.stageClr, padding: '2px 7px', whiteSpace: 'nowrap', justifySelf: 'start' }}
                >
                  {row.stage}
                </span>
                <span
                  className="rounded-full"
                  style={{ fontSize: 9, background: row.ratingBg, color: row.ratingClr, padding: '2px 7px', whiteSpace: 'nowrap', justifySelf: 'start' }}
                >
                  {row.rating}
                </span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>{row.job}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────────────────────── */}
      <section id="features" style={{ background: 'white', padding: '72px 40px', scrollMarginTop: 56 }}>
        <div className="mx-auto" style={{ maxWidth: 1100 }}>
          <p className="text-center mb-2 font-medium uppercase" style={{ fontSize: 11, color: '#2563EB', letterSpacing: '0.08em' }}>Features</p>
          <h2 className="text-center font-semibold mb-3" style={{ fontSize: 26, color: '#1E293B' }}>Everything your team needs to close deals</h2>
          <p className="text-center mb-10" style={{ fontSize: 14, color: '#64748B' }}>From first call to placement — Evaryst covers the full recruiting workflow.</p>

          {/* Highlight feature */}
          <div
            className="grid grid-cols-2 gap-12 items-center rounded-[16px] p-8 mb-6"
            style={{ background: '#F8FAFC', border: '0.5px solid #E2E8F0' }}
          >
            <div>
              <p className="font-medium uppercase mb-2" style={{ fontSize: 11, color: '#2563EB', letterSpacing: '0.08em' }}>Core feature</p>
              <p className="mb-3" style={{ fontSize: 22, fontWeight: 500, color: '#1E293B' }}>
                Track every candidate from call to placement
              </p>
              <p className="leading-relaxed mb-5" style={{ fontSize: 14, color: '#64748B' }}>
                Evaryst gives you a complete view of your pipeline. Move candidates through stages,
                log every interaction, and never lose track of a placement opportunity.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  'New → Phone Screen → Interview → References → Placed',
                  'Full profile with resume and qualification questions',
                  'Real-time pipeline health analytics',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <Check size={14} style={{ color: '#2563EB', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#475569' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <img
                src={pipelineIllustration}
                alt="Candidate pipeline illustration"
                style={{ width: '100%', maxWidth: 420, height: 'auto', borderRadius: 12, objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Remaining feature cards */}
          <div className="grid grid-cols-3 gap-4">
            {restFeatures.map(({ icon: Icon, iconBg, iconClr, title, desc }) => (
              <div
                key={title}
                className="rounded-[12px] p-5 bg-white cursor-default"
                style={{ border: '0.5px solid #E2E8F0', transition: 'transform 200ms, box-shadow 200ms' }}
                onMouseEnter={e => hoverCard(e.currentTarget as HTMLDivElement, true)}
                onMouseLeave={e => hoverCard(e.currentTarget as HTMLDivElement, false)}
              >
                <div
                  className="flex items-center justify-center rounded-[8px] mb-3"
                  style={{ width: 36, height: 36, background: iconBg }}
                >
                  <Icon size={18} style={{ color: iconClr }} />
                </div>
                <p className="font-medium mb-2" style={{ fontSize: 14, color: '#1E293B' }}>{title}</p>
                <p className="leading-relaxed" style={{ fontSize: 12, color: '#64748B' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: '#0F172A', padding: '72px 40px', scrollMarginTop: 56 }}>
        <div className="mx-auto" style={{ maxWidth: 1100 }}>
          <p className="text-center mb-2 font-medium uppercase" style={{ fontSize: 11, color: '#60A5FA', letterSpacing: '0.08em' }}>How it works</p>
          <h2 className="text-center font-semibold mb-10" style={{ fontSize: 26, color: 'white' }}>
            From sourcing to placement in three steps
          </h2>

          <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
            {/* Connecting dashed line */}
            <div style={{
              position: 'absolute',
              top: 16,
              left: 'calc(100% / 6)',
              right: 'calc(100% / 6)',
              borderTop: '1px dashed rgba(37,99,235,0.35)',
              zIndex: 0,
            }} />
            <div className="grid grid-cols-3 gap-6" style={{ position: 'relative', zIndex: 1 }}>
              {[
                { n: 1, title: 'Add candidates',    desc: 'Import or manually add candidates to your pipeline. Attach resumes, notes, and qualification data.' },
                { n: 2, title: 'Work the pipeline', desc: 'Track every call, schedule follow-ups, and move candidates through stages. Your whole team stays in sync.' },
                { n: 3, title: 'Place and report',  desc: 'Record placements, track fees, and review team performance. Close more deals with data.' },
              ].map(step => (
                <div key={step.n} className="text-center p-6">
                  <div
                    className="flex items-center justify-center rounded-full mx-auto mb-4 font-medium"
                    style={{
                      width: 32, height: 32,
                      background: 'rgba(37,99,235,0.2)',
                      border: '1px solid rgba(37,99,235,0.45)',
                      fontSize: 13, color: '#60A5FA',
                    }}
                  >
                    {step.n}
                  </div>
                  <p className="font-medium mb-2" style={{ fontSize: 14, color: 'white' }}>{step.title}</p>
                  <p className="leading-relaxed" style={{ fontSize: 12, color: '#94A3B8' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ── TESTIMONIAL ──────────────────────────────────────────────────────────── */}
      <section style={{ background: '#F8FAFC', padding: '72px 40px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div
            className="bg-white rounded-[16px] p-8"
            style={{ border: '0.5px solid #E2E8F0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
          >
            <div style={{ fontSize: 80, color: '#E2E8F0', lineHeight: 1, marginBottom: 8, fontFamily: 'Georgia, serif' }}>"</div>
            <div className="flex gap-0.5 mb-5">
              {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 16, color: '#F59E0B' }}>★</span>)}
            </div>
            <p className="font-medium leading-relaxed" style={{ fontSize: 18, color: '#1E293B' }}>
              Evaryst completely changed how our team tracks candidates. We went from spreadsheets to a
              proper pipeline in one day. Our placement rate is up 40%.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <img
                src={sarahAvatar}
                alt="Sarah Reynolds"
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0', flexShrink: 0 }}
              />
              <div>
                <p className="font-medium" style={{ fontSize: 14, color: '#1E293B' }}>Sarah Reynolds</p>
                <p style={{ fontSize: 12, color: '#64748B' }}>Head of Recruiting, TechNova Solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ background: 'white', padding: '72px 40px', scrollMarginTop: 56 }}>
        <div className="mx-auto" style={{ maxWidth: 1000 }}>
          <p className="text-center mb-2 font-medium uppercase" style={{ fontSize: 11, color: '#2563EB', letterSpacing: '0.08em' }}>Pricing</p>
          <h2 className="text-center font-semibold mb-3" style={{ fontSize: 26, color: '#1E293B' }}>Simple pricing for teams of any size</h2>

          {/* Billing toggle */}
          <div className="flex justify-center items-center gap-2 mb-10 mt-6">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className="rounded-full transition-all"
              style={{
                fontSize: 13, padding: '6px 16px',
                background: billingPeriod === 'monthly' ? '#1E293B' : 'transparent',
                color:      billingPeriod === 'monthly' ? 'white'   : '#64748B',
                border:     billingPeriod === 'monthly' ? 'none'    : '1px solid #E2E8F0',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className="rounded-full transition-all flex items-center gap-2"
              style={{
                fontSize: 13, padding: '6px 16px',
                background: billingPeriod === 'annual' ? '#1E293B' : 'transparent',
                color:      billingPeriod === 'annual' ? 'white'   : '#64748B',
                border:     billingPeriod === 'annual' ? 'none'    : '1px solid #E2E8F0',
              }}
            >
              Annual
              <span
                className="rounded-full font-medium"
                style={{ fontSize: 10, background: '#DCFCE7', color: '#15803D', padding: '2px 7px' }}
              >
                Save 20%
              </span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {/* Starter */}
            <div
              className="rounded-[12px] p-6 bg-white"
              style={{ border: '0.5px solid #E2E8F0', transition: 'transform 200ms, box-shadow 200ms' }}
              onMouseEnter={e => hoverPriceCard(e.currentTarget as HTMLDivElement, true)}
              onMouseLeave={e => hoverPriceCard(e.currentTarget as HTMLDivElement, false)}
            >
              <p className="font-semibold mb-1" style={{ fontSize: 15, color: '#1E293B' }}>Starter</p>
              <p className="mb-4" style={{ fontSize: 12, color: '#64748B' }}>For solo recruiters getting started</p>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="font-semibold" style={{ fontSize: 32, color: '#1E293B' }}>${starterPrice}</span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>/user/month</span>
              </div>
              <div className="flex flex-col gap-2 mb-6">
                {['Up to 200 candidates', 'Pipeline management', 'Outreach tracking', 'Basic reports'].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <Check size={14} style={{ color: '#16A34A', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#475569' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button className="w-full rounded-[7px] py-2 hover:bg-[#F8FAFC] transition-colors" style={{ fontSize: 13, color: '#1E293B', border: '0.5px solid #E2E8F0' }}>
                Get started
              </button>
            </div>

            {/* Team — popular */}
            <div
              className="rounded-[12px] p-6 bg-white"
              style={{
                boxShadow: '0 0 0 2px #2563EB, 0 8px 32px rgba(37,99,235,0.15)',
                transition: 'transform 200ms',
              }}
              onMouseEnter={e => hoverPriceCard(e.currentTarget as HTMLDivElement, true, true)}
              onMouseLeave={e => hoverPriceCard(e.currentTarget as HTMLDivElement, false, true)}
            >
              <span className="inline-block rounded-full px-3 py-1 mb-3" style={{ fontSize: 11, background: '#EFF6FF', color: '#1D4ED8' }}>
                Most popular
              </span>
              <p className="font-semibold mb-1" style={{ fontSize: 15, color: '#1E293B' }}>Team</p>
              <p className="mb-4" style={{ fontSize: 12, color: '#64748B' }}>For growing recruiting teams</p>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="font-semibold" style={{ fontSize: 32, color: '#1E293B' }}>${teamPrice}</span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>/user/month</span>
              </div>
              <div className="flex flex-col gap-2 mb-6">
                {['Unlimited candidates', 'Team management', 'Advanced analytics', 'All pipeline features', 'Priority support'].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <Check size={14} style={{ color: '#16A34A', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#475569' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button className="w-full rounded-[7px] py-2 font-medium text-white hover:opacity-90 transition-opacity" style={{ fontSize: 13, background: '#2563EB' }}>
                Get started
              </button>
            </div>

            {/* Enterprise */}
            <div
              className="rounded-[12px] p-6 bg-white"
              style={{ border: '0.5px solid #E2E8F0', transition: 'transform 200ms, box-shadow 200ms' }}
              onMouseEnter={e => hoverPriceCard(e.currentTarget as HTMLDivElement, true)}
              onMouseLeave={e => hoverPriceCard(e.currentTarget as HTMLDivElement, false)}
            >
              <p className="font-semibold mb-1" style={{ fontSize: 15, color: '#1E293B' }}>Enterprise</p>
              <p className="mb-4" style={{ fontSize: 12, color: '#64748B' }}>For large staffing organisations</p>
              <div className="flex flex-col mb-5">
                <span className="font-semibold" style={{ fontSize: 32, color: '#1E293B' }}>Custom</span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>contact us for pricing</span>
              </div>
              <div className="flex flex-col gap-2 mb-6">
                {['Everything in Team', 'Custom onboarding', 'Dedicated support', 'SLA guarantee'].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <Check size={14} style={{ color: '#16A34A', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#475569' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button className="w-full rounded-[7px] py-2 hover:bg-[#F8FAFC] transition-colors" style={{ fontSize: 13, color: '#1E293B', border: '0.5px solid #E2E8F0' }}>
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────────── */}
      <div
        className="text-center relative overflow-hidden"
        style={{ background: '#0F172A', padding: '88px 40px' }}
      >
        {/* Centered glow */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 640, height: 400,
          background: 'radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="relative">
          <h2 className="font-semibold mb-3" style={{ fontSize: 32, color: 'white' }}>Ready to place more candidates?</h2>
          <p className="mb-8 mx-auto" style={{ fontSize: 15, color: '#94A3B8', maxWidth: 460 }}>
            Join recruiting teams using Evaryst to close more deals, faster.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => scrollTo('pricing')}
              className="font-medium text-white rounded-[8px] transition-colors"
              style={{ fontSize: 14, padding: '12px 26px', background: '#2563EB' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1D4ED8' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563EB' }}
            >
              Request access
            </button>
            <button
              className="rounded-[8px] text-white transition-colors"
              style={{ fontSize: 14, padding: '12px 26px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              Talk to us
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────────────── */}
      <footer
        className="px-10 py-6"
        style={{ background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div
              className="flex items-center justify-center rounded-[7px]"
              style={{ width: 30, height: 30, background: '#2563EB' }}
            >
              <span className="font-semibold text-white" style={{ fontSize: 13 }}>E</span>
            </div>
            <span className="ml-2 font-medium text-white" style={{ fontSize: 15 }}>Evaryst</span>
          </div>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Contact'].map(link => (
              <span
                key={link}
                className="cursor-pointer transition-colors hover:text-[#94A3B8]"
                style={{ fontSize: 12, color: '#64748B' }}
              >
                {link}
              </span>
            ))}
          </div>
        </div>
        <p className="text-center mt-4" style={{ fontSize: 11, color: '#475569' }}>
          © 2026 Evaryst. All rights reserved.
        </p>
      </footer>

    </div>
  )
}
