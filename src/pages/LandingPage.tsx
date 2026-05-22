import { Rocket, Users, Phone, BarChart2, Briefcase, Search, Building2, Check } from 'lucide-react'

interface LandingPageProps {
  isAuthenticated: boolean
  onGoToApp: () => void
}

export function LandingPage({ isAuthenticated, onGoToApp }: LandingPageProps) {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 bg-white flex items-center px-10"
        style={{ height: 56, borderBottom: '0.5px solid #E2E8F0' }}
      >
        <div className="flex items-center">
          <div
            className="flex items-center justify-center rounded-[7px]"
            style={{ width: 30, height: 30, background: '#2563EB' }}
          >
            <span className="font-semibold text-white" style={{ fontSize: 13 }}>E</span>
          </div>
          <span className="ml-2 font-medium" style={{ fontSize: 15, color: '#1E293B' }}>Evaryst</span>
        </div>

        <div className="flex-1 flex justify-center gap-8">
          {([['Features', 'features'], ['How it works', 'how-it-works'], ['Pricing', 'pricing']] as const).map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="bg-transparent border-none hover:text-[#1E293B] transition-colors cursor-pointer"
              style={{ fontSize: 13, color: '#475569' }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              onClick={onGoToApp}
              className="font-medium text-white rounded-[7px] transition-colors hover:opacity-90"
              style={{ fontSize: 13, padding: '8px 16px', background: '#2563EB' }}
            >
              Go to app →
            </button>
          ) : (
            <>
              <button
                onClick={() => { window.location.href = '/login' }}
                className="rounded-[7px] hover:bg-[#F8FAFC] transition-colors"
                style={{ fontSize: 13, color: '#1E293B', padding: '8px 16px', border: '0.5px solid #E2E8F0' }}
              >
                Sign in
              </button>
              <button
                onClick={() => scrollTo('pricing')}
                className="font-medium text-white rounded-[7px] transition-colors hover:opacity-90"
                style={{ fontSize: 13, padding: '8px 16px', background: '#2563EB' }}
              >
                Request access
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────────── */}
      <section id="hero" style={{ padding: '80px 40px 60px' }}>
        <div className="grid grid-cols-2 gap-12 items-center mx-auto" style={{ maxWidth: 1100 }}>

          {/* Left */}
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-5"
              style={{ background: '#EFF6FF', border: '0.5px solid #BFDBFE' }}
            >
              <Rocket size={12} style={{ color: '#1D4ED8' }} />
              <span className="font-medium" style={{ fontSize: 11, color: '#1D4ED8' }}>Built for staffing agencies</span>
            </div>

            <h1 className="font-semibold leading-tight mb-4" style={{ fontSize: 38, color: '#1E293B' }}>
              The ATS that helps you<br />
              <span style={{ color: '#2563EB' }}>place candidates faster</span>
            </h1>

            <p className="leading-relaxed mb-8" style={{ fontSize: 15, color: '#64748B', maxWidth: 440 }}>
              Evaryst gives recruiting teams a modern pipeline, smart outreach tracking,
              and real-time analytics — without the complexity of legacy systems.
            </p>

            <div className="flex gap-3 items-center">
              <button
                onClick={() => scrollTo('pricing')}
                className="font-medium text-white rounded-[8px] hover:opacity-90 transition-opacity"
                style={{ fontSize: 14, padding: '10px 20px', background: '#2563EB' }}
              >
                Request access
              </button>
              <button
                onClick={() => scrollTo('features')}
                className="rounded-[8px] hover:bg-[#F8FAFC] transition-colors"
                style={{ fontSize: 14, padding: '10px 20px', color: '#1E293B', border: '0.5px solid #E2E8F0' }}
              >
                See it in action
              </button>
            </div>

            <p className="mt-3" style={{ fontSize: 11, color: '#94A3B8' }}>
              No credit card required · Setup in minutes
            </p>
          </div>

          {/* Right: Dashboard preview */}
          <div className="rounded-[12px] p-4" style={{ background: '#F8FAFC', border: '0.5px solid #E2E8F0' }}>
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Placements',        value: 12, trend: '+3 vs last month', trendClr: '#16A34A' },
                { label: 'Active candidates', value: 84, trend: '+12 this week',    trendClr: '#16A34A' },
                { label: 'Open jobs',         value: 17, trend: 'Across 8 clients', trendClr: '#94A3B8' },
                { label: 'Interviews',        value: 31, trend: '+8 vs last month', trendClr: '#16A34A' },
              ].map(kpi => (
                <div key={kpi.label} className="rounded-[8px] p-3 bg-white" style={{ border: '0.5px solid #E2E8F0' }}>
                  <p style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>{kpi.label}</p>
                  <p className="font-medium" style={{ fontSize: 18, color: '#1E293B', marginBottom: 2 }}>{kpi.value}</p>
                  <p style={{ fontSize: 10, color: kpi.trendClr }}>{kpi.trend}</p>
                </div>
              ))}
            </div>

            {/* Mini candidate table */}
            <div className="rounded-[8px] overflow-hidden bg-white" style={{ border: '0.5px solid #E2E8F0' }}>
              <div
                className="grid bg-[#F8FAFC] px-3 py-2"
                style={{ gridTemplateColumns: '1.8fr 1.6fr 0.9fr 0.9fr', borderBottom: '0.5px solid #E2E8F0' }}
              >
                {['NAME', 'STAGE', 'RATING', 'JOB'].map(h => (
                  <span key={h} style={{ fontSize: 10, color: '#94A3B8' }}>{h}</span>
                ))}
              </div>
              {[
                { initials: 'MW', name: 'Marcus Webb',  stage: 'Phone Screen', stageBg: '#DBEAFE', stageClr: '#1D4ED8', rating: 'Paper A', ratingBg: '#EFF6FF', ratingClr: '#1D4ED8', job: '.NET Dev'    },
                { initials: 'AF', name: 'Ava Foster',   stage: 'Interview',    stageBg: '#FEF3C7', stageClr: '#92400E', rating: 'Paper A', ratingBg: '#EFF6FF', ratingClr: '#1D4ED8', job: 'UX Designer' },
                { initials: 'MH', name: 'Mason Harper', stage: 'Submitted',    stageBg: '#FFEDD5', stageClr: '#9A3412', rating: 'A',       ratingBg: '#F3E8FF', ratingClr: '#6D28D9', job: 'DevOps'      },
              ].map((row, i) => (
                <div
                  key={row.name}
                  className="grid items-center px-3 py-2"
                  style={{ gridTemplateColumns: '1.8fr 1.6fr 0.9fr 0.9fr', borderBottom: i < 2 ? '0.5px solid #F1F5F9' : undefined }}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="flex items-center justify-center rounded-full flex-shrink-0"
                      style={{ width: 20, height: 20, background: '#DBEAFE' }}
                    >
                      <span style={{ fontSize: 8, fontWeight: 600, color: '#1D4ED8' }}>{row.initials}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#1E293B' }}>{row.name}</span>
                  </div>
                  <span
                    className="rounded-full inline-block"
                    style={{ fontSize: 9, background: row.stageBg, color: row.stageClr, padding: '2px 7px', whiteSpace: 'nowrap' }}
                  >
                    {row.stage}
                  </span>
                  <span
                    className="rounded-full inline-block"
                    style={{ fontSize: 9, background: row.ratingBg, color: row.ratingClr, padding: '2px 7px', whiteSpace: 'nowrap' }}
                  >
                    {row.rating}
                  </span>
                  <span style={{ fontSize: 11, color: '#64748B' }}>{row.job}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ── FEATURES ────────────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '60px 40px' }}>
        <div className="mx-auto" style={{ maxWidth: 1100 }}>
          <p
            className="text-center mb-2 font-medium uppercase"
            style={{ fontSize: 11, color: '#2563EB', letterSpacing: '0.08em' }}
          >
            Features
          </p>
          <h2 className="text-center font-semibold mb-3" style={{ fontSize: 26, color: '#1E293B' }}>
            Everything your team needs to close deals
          </h2>
          <p className="text-center mb-10" style={{ fontSize: 14, color: '#64748B' }}>
            From first call to placement — Evaryst covers the full recruiting workflow.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Users,     bg: '#EFF6FF', clr: '#2563EB', title: 'Candidate pipeline',  desc: 'Track every candidate from New to Placed. Full profile with resume, qualification, and contact history.' },
              { icon: Phone,     bg: '#F0FDF4', clr: '#15803D', title: 'Outreach tracking',   desc: 'Log calls and meetings, track status updates, and never lose a follow-up.' },
              { icon: BarChart2, bg: '#FAF5FF', clr: '#6D28D9', title: 'Team analytics',      desc: 'Managers see pipeline health, recruiter performance, and placement metrics in real time.' },
              { icon: Briefcase, bg: '#FFF7ED', clr: '#C2410C', title: 'Job management',      desc: 'Create jobs, assign recruiters, and track every position across your client companies.' },
              { icon: Search,    bg: '#EFF6FF', clr: '#2563EB', title: 'Advanced search',     desc: 'Find the right candidate fast with keyword and boolean search across your talent database.' },
              { icon: Building2, bg: '#F0FDF4', clr: '#15803D', title: 'Client management',   desc: 'Manage client companies, contacts, and job orders. All client intel in one profile.' },
            ].map(({ icon: Icon, bg, clr, title, desc }) => (
              <div
                key={title}
                className="rounded-[12px] p-5 bg-white transition-colors cursor-default"
                style={{ border: '0.5px solid #E2E8F0' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2563EB' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E2E8F0' }}
              >
                <div
                  className="flex items-center justify-center rounded-[8px] mb-3"
                  style={{ width: 36, height: 36, background: bg }}
                >
                  <Icon size={18} style={{ color: clr }} />
                </div>
                <p className="font-medium mb-2" style={{ fontSize: 14, color: '#1E293B' }}>{title}</p>
                <p className="leading-relaxed" style={{ fontSize: 12, color: '#64748B' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: '#F8FAFC', padding: '64px 40px' }}>
        <div className="mx-auto" style={{ maxWidth: 1100 }}>
          <p
            className="text-center mb-2 font-medium uppercase"
            style={{ fontSize: 11, color: '#2563EB', letterSpacing: '0.08em' }}
          >
            How it works
          </p>
          <h2 className="text-center font-semibold" style={{ fontSize: 26, color: '#1E293B' }}>
            From sourcing to placement in three steps
          </h2>

          <div className="grid grid-cols-3 gap-6 mx-auto mt-10" style={{ maxWidth: 900 }}>
            {[
              { n: 1, title: 'Add candidates',    desc: 'Import or manually add candidates to your pipeline. Attach resumes, notes, and qualification data.' },
              { n: 2, title: 'Work the pipeline', desc: 'Track every call, schedule follow-ups, and move candidates through stages. Your whole team stays in sync.' },
              { n: 3, title: 'Place and report',  desc: 'Record placements, track fees, and review team performance. Close more deals with data.' },
            ].map(step => (
              <div key={step.n} className="text-center p-6">
                <div
                  className="flex items-center justify-center rounded-full mx-auto mb-3 font-medium text-white"
                  style={{ width: 32, height: 32, background: '#2563EB', fontSize: 13 }}
                >
                  {step.n}
                </div>
                <p className="font-medium mb-2" style={{ fontSize: 14, color: '#1E293B' }}>{step.title}</p>
                <p className="leading-relaxed" style={{ fontSize: 12, color: '#64748B' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '64px 40px' }}>
        <div className="mx-auto" style={{ maxWidth: 1000 }}>
          <p
            className="text-center mb-2 font-medium uppercase"
            style={{ fontSize: 11, color: '#2563EB', letterSpacing: '0.08em' }}
          >
            Pricing
          </p>
          <h2 className="text-center font-semibold" style={{ fontSize: 26, color: '#1E293B' }}>
            Simple pricing for teams of any size
          </h2>

          <div className="grid grid-cols-3 gap-5 mt-10">
            {/* Starter */}
            <div className="rounded-[12px] p-6 bg-white" style={{ border: '0.5px solid #E2E8F0' }}>
              <p className="font-semibold mb-1" style={{ fontSize: 15, color: '#1E293B' }}>Starter</p>
              <p className="mb-4" style={{ fontSize: 12, color: '#64748B' }}>For solo recruiters getting started</p>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="font-semibold" style={{ fontSize: 32, color: '#1E293B' }}>$29</span>
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
              <button
                className="w-full rounded-[7px] py-2 hover:bg-[#F8FAFC] transition-colors"
                style={{ fontSize: 13, color: '#1E293B', border: '0.5px solid #E2E8F0' }}
              >
                Get started
              </button>
            </div>

            {/* Team */}
            <div className="rounded-[12px] p-6 bg-white" style={{ border: '2px solid #2563EB' }}>
              <span
                className="inline-block rounded-full px-3 py-1 mb-3"
                style={{ fontSize: 11, background: '#EFF6FF', color: '#1D4ED8' }}
              >
                Most popular
              </span>
              <p className="font-semibold mb-1" style={{ fontSize: 15, color: '#1E293B' }}>Team</p>
              <p className="mb-4" style={{ fontSize: 12, color: '#64748B' }}>For growing recruiting teams</p>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="font-semibold" style={{ fontSize: 32, color: '#1E293B' }}>$59</span>
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
              <button
                className="w-full rounded-[7px] py-2 font-medium text-white hover:opacity-90 transition-opacity"
                style={{ fontSize: 13, background: '#2563EB' }}
              >
                Get started
              </button>
            </div>

            {/* Enterprise */}
            <div className="rounded-[12px] p-6 bg-white" style={{ border: '0.5px solid #E2E8F0' }}>
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
              <button
                className="w-full rounded-[7px] py-2 hover:bg-[#F8FAFC] transition-colors"
                style={{ fontSize: 13, color: '#1E293B', border: '0.5px solid #E2E8F0' }}
              >
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────────── */}
      <div className="text-center" style={{ borderTop: '0.5px solid #E2E8F0', padding: '64px 40px' }}>
        <h2 className="font-semibold mb-2" style={{ fontSize: 28, color: '#1E293B' }}>
          Ready to place more candidates?
        </h2>
        <p className="mb-6" style={{ fontSize: 14, color: '#64748B' }}>
          Join recruiting teams using Evaryst to close more deals, faster.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => scrollTo('pricing')}
            className="font-medium text-white rounded-[8px] hover:opacity-90 transition-opacity"
            style={{ fontSize: 14, padding: '12px 24px', background: '#2563EB' }}
          >
            Request access
          </button>
          <button
            className="rounded-[8px] hover:bg-[#F8FAFC] transition-colors"
            style={{ fontSize: 14, padding: '12px 24px', color: '#1E293B', border: '0.5px solid #E2E8F0' }}
          >
            Talk to us
          </button>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────────────── */}
      <footer
        className="flex justify-between items-center px-10 py-6"
        style={{ borderTop: '0.5px solid #E2E8F0' }}
      >
        <div className="flex items-center">
          <div
            className="flex items-center justify-center rounded-[7px]"
            style={{ width: 30, height: 30, background: '#2563EB' }}
          >
            <span className="font-semibold text-white" style={{ fontSize: 13 }}>E</span>
          </div>
          <span className="ml-2 font-medium" style={{ fontSize: 15, color: '#1E293B' }}>Evaryst</span>
        </div>
        <div className="flex gap-5">
          {['Privacy', 'Terms', 'Contact'].map(link => (
            <span
              key={link}
              className="cursor-pointer hover:text-[#475569] transition-colors"
              style={{ fontSize: 12, color: '#94A3B8' }}
            >
              {link}
            </span>
          ))}
        </div>
      </footer>
    </div>
  )
}
