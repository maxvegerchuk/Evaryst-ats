import { useState } from 'react'
import { ChevronLeft, Users, Briefcase, Calendar, Trophy, Plus, BarChart2 } from 'lucide-react'
import type { Candidate } from '../../types/candidate'
import { getInitials, getAvatarColor } from '../../types/candidate'

const STORAGE_KEY = 'evaryst-sidebar-collapsed'

const SECTION_LABEL = 'text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.08em]'

interface SidebarProps {
  currentPage:            string
  setCurrentPage:         (page: string) => void
  isNewUser?:             boolean
  candidates:             Candidate[]
  onNavigateToCandidate:  (id: string) => void
  isManager?:             boolean
  recruiterCount?:        number
  openJobsCount?:         number
}

export function Sidebar({ setCurrentPage, candidates, onNavigateToCandidate, isManager, recruiterCount = 0, openJobsCount = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
  })

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch { /* storage unavailable */ }
      return next
    })
  }

  const cx = collapsed

  const pinnedCandidates = candidates.filter(c => c.starred)

  return (
    <aside
      style={{ width: cx ? 64 : 220 }}
      className="hidden md:flex shrink-0 bg-white border-r border-[#E2E8F0] h-full flex-col transition-[width] duration-200 ease-in-out overflow-hidden"
      aria-label="Quick access panel"
    >
      {/* Collapse toggle */}
      <div className={`flex ${cx ? 'justify-center' : 'justify-end'} px-3 pt-3 pb-0`}>
        <button
          onClick={toggle}
          className="w-7 h-7 flex items-center justify-center border-subtle rounded-md bg-white hover:bg-[#F8FAFC] transition-colors flex-shrink-0"
          aria-label={cx ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            size={14}
            className={`text-[#94A3B8] transition-transform duration-200 ${cx ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 flex flex-col">

        {/* MY STATS */}
        <section className="px-3 pb-3 border-b border-[#F1F5F9]">
          {!cx && <p className={`${SECTION_LABEL} mb-2`}>My Stats</p>}
          {cx ? (
            <div className="flex flex-col items-center gap-2 py-1">
              <button title="Candidates" className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F8FAFC]">
                <Users size={15} className="text-[#2563EB]" />
              </button>
              <button title="Open jobs" className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F8FAFC]">
                <Briefcase size={15} className="text-[#64748B]" />
              </button>
              <button title="Placements" className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F8FAFC]">
                <Trophy size={15} className="text-[#16A34A]" />
              </button>
              <button title="Interviews" className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F8FAFC]">
                <Calendar size={15} className="text-[#F59E0B]" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-[#2563EB] shrink-0" />
                  <span className="text-[12px] text-[#475569]">Candidates</span>
                </div>
                <span className="text-[13px] font-medium text-[#1E293B]">{candidates.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-[#64748B] shrink-0" />
                  <span className="text-[12px] text-[#475569]">Open jobs</span>
                </div>
                <span className="text-[13px] font-medium text-[#1E293B]">{openJobsCount}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-[#16A34A] shrink-0" />
                  <span className="text-[12px] text-[#475569]">Placements</span>
                </div>
                <span className="text-[13px] font-medium text-[#1E293B]">
                  {candidates.filter(c => c.stage === 'Placed').length}
                </span>
              </div>
              <div className="py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#F59E0B] shrink-0" />
                    <span className="text-[12px] text-[#475569]">Interviews</span>
                  </div>
                  <span className="text-[13px] font-medium text-[#1E293B]">{candidates.filter(c => c.stage === 'Interview').length}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* TEAM (manager only) */}
        {isManager && (
          <section className="px-3 py-3 border-b border-[#F1F5F9]">
            {!cx && <p className={`${SECTION_LABEL} mb-2`}>Team</p>}
            {cx ? (
              <div className="flex flex-col items-center gap-2 py-1">
                <button title="Recruiters" className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F8FAFC]">
                  <Users size={15} className="text-[#2563EB]" />
                </button>
                <button title="Team Stats" className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F8FAFC]">
                  <BarChart2 size={15} className="text-[#64748B]" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => setCurrentPage('administration')}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-[7px] hover:bg-[#F8FAFC] transition-colors text-left"
                >
                  <Users size={14} className="text-[#2563EB] shrink-0" />
                  <span className="text-[12px] text-[#475569]">Recruiters</span>
                  <span className="ml-auto text-[12px] font-medium text-[#1E293B]">{recruiterCount}</span>
                </button>
                <button
                  onClick={() => setCurrentPage('administration')}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-[7px] hover:bg-[#F8FAFC] transition-colors text-left"
                >
                  <BarChart2 size={14} className="text-[#64748B] shrink-0" />
                  <span className="text-[12px] text-[#475569]">Team Stats</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* CANDIDATES */}
        <section className="px-3 py-3 border-b border-[#F1F5F9]">
          {!cx && (
            <div className="flex items-center justify-between mb-2">
              <p className={SECTION_LABEL}>Candidates</p>
              <button onClick={() => setCurrentPage('candidates')} className="w-5 h-5 flex items-center justify-center text-[#94A3B8] hover:text-[#475569]">
                <Plus size={13} />
              </button>
            </div>
          )}
          {cx ? (
            <div className="flex flex-col items-center gap-1.5">
              {pinnedCandidates.map(c => {
                const { bg, clr } = getAvatarColor(c.id)
                return (
                  <button
                    key={c.id}
                    title={`${c.name} — ${c.specialty}`}
                    onClick={() => onNavigateToCandidate(c.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:ring-2 hover:ring-[#E2E8F0] hover:ring-offset-1 transition-all"
                    style={{ backgroundColor: bg, color: clr }}
                  >
                    <span className="text-[10px] font-bold leading-none">{getInitials(c.name)}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            pinnedCandidates.length === 0 ? null : (
              <div className="flex flex-col gap-0.5">
                {pinnedCandidates.map(c => {
                  const { bg, clr } = getAvatarColor(c.id)
                  return (
                    <button
                      key={c.id}
                      onClick={() => onNavigateToCandidate(c.id)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-[7px] hover:bg-[#F8FAFC] transition-colors text-left"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold leading-none"
                        style={{ backgroundColor: bg, color: clr }}
                      >
                        {getInitials(c.name)}
                      </div>
                      <div className="flex-1 min-w-0 leading-tight">
                        <p className="text-[12px] font-medium text-[#1E293B] truncate">{c.name}</p>
                        <p className="text-[11px] text-[#94A3B8]">{c.specialty}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          )}
        </section>

        {/* JOBS — empty, show nothing */}
        <section className="px-3 py-3 border-b border-[#F1F5F9]">
          {!cx && (
            <div className="flex items-center justify-between mb-2">
              <p className={SECTION_LABEL}>Jobs</p>
              <button onClick={() => setCurrentPage('jobs')} className="w-5 h-5 flex items-center justify-center text-[#94A3B8] hover:text-[#475569]">
                <Plus size={13} />
              </button>
            </div>
          )}
        </section>

        {/* RECENT — removed sample data, show nothing */}
        <section className="px-3 py-3">
          {!cx && <p className={`${SECTION_LABEL} mb-2`}>Recent</p>}
        </section>

      </div>
    </aside>
  )
}
