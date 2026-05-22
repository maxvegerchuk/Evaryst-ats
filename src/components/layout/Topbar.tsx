import { useState, useRef } from 'react'
import { Search, Bell, ChevronDown, Phone, Video, Settings, LogOut, UserPlus } from 'lucide-react'
import type { EventStatus } from './SchedulePanel'
import { EVENTS } from './SchedulePanel'
import type { User } from '../../types/auth'
import { useClickOutside } from '../../hooks/useClickOutside'

const NAV_LINKS = [
  { label: 'Dashboard',      page: 'dashboard',      managerOnly: false },
  { label: 'People',         page: 'people',         managerOnly: false },
  { label: 'Jobs',           page: 'jobs',           managerOnly: false },
  { label: 'Companies',      page: 'companies',      managerOnly: false },
  { label: 'Reports',        page: 'reports',        managerOnly: false },
  { label: 'Administration', page: 'administration', managerOnly: true  },
  { label: 'Search',         page: 'search',         managerOnly: false },
] as const

const ROLE_LABELS: Record<string, string> = {
  recruiter:                    'Recruiter',
  talent_acquisition_manager:   'Talent Acquisition Manager',
}

interface TopbarProps {
  currentPage:      string
  setCurrentPage:   (page: string) => void
  needsUpdateCount: number
  eventStatuses:    Record<string, EventStatus>
  onSetStatus:      (id: string, status: EventStatus) => void
  currentUser:      User
  onLogout:         () => void
  onAddCandidate:   () => void
  onSearch:         (query: string) => void
  isManager?:       boolean
}

export function Topbar({ currentPage, setCurrentPage, needsUpdateCount, eventStatuses, onSetStatus, currentUser, onLogout, onAddCandidate, onSearch, isManager }: TopbarProps) {
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [showUserMenu,   setShowUserMenu]   = useState(false)
  const [searchQuery,    setSearchQuery]    = useState('')

  const bellRef   = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)

  useClickOutside(bellRef,   () => setShowNotifPanel(false), showNotifPanel)
  useClickOutside(avatarRef, () => setShowUserMenu(false),   showUserMenu)

  const needsUpdateEvents = EVENTS.filter(ev => (eventStatuses[ev.id] ?? 'upcoming') === 'needs-update')

  return (
    <header
      className="shrink-0 bg-white border-b border-[#E2E8F0] flex items-center px-5 gap-4 h-[60px]"
      aria-label="Top navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 bg-[#2563EB] rounded-[7px] flex items-center justify-center shadow-sm">
          <span className="text-[13px] font-bold text-white leading-none">E</span>
        </div>
        <span className="text-[14px] font-medium text-[#1E293B]">Evaryst</span>
      </div>

      {/* Nav links */}
      <nav className="flex items-center gap-1 ml-6" aria-label="Main navigation">
        {NAV_LINKS.filter(l => !l.managerOnly || isManager).map(({ label, page }) => {
          const isActive = currentPage === page || (page === 'people' && currentPage === 'candidates') || (page === 'companies' && currentPage === 'company') || (page === 'jobs' && currentPage === 'job')
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              aria-current={isActive ? 'page' : undefined}
              className={`text-[13px] px-2.5 py-1.5 rounded-[7px] transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                  : 'text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              {label}
            </button>
          )
        })}
      </nav>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
        <input
          type="search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              onSearch(searchQuery.trim())
              setSearchQuery('')
            }
          }}
          placeholder="Search candidates, jobs..."
          aria-label="Search candidates and jobs"
          className="pl-9 pr-4 text-[12px] bg-white rounded-[7px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none w-60"
          style={{ border: '0.5px solid #E2E8F0', paddingTop: 6, paddingBottom: 6 }}
        />
      </div>

      {/* Add candidate shortcut */}
      <button
        type="button"
        onClick={onAddCandidate}
        className="flex items-center gap-1.5 bg-[#2563EB] text-white rounded-[7px] px-3 py-1.5 text-[12px] font-medium hover:bg-blue-700 transition-colors shrink-0 whitespace-nowrap"
      >
        <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
        Add candidate
      </button>

      {/* Bell + notification panel */}
      <div ref={bellRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setShowNotifPanel(v => !v)}
          className="relative p-2 rounded-[7px] hover:bg-[#F8FAFC] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-[#64748B]" aria-hidden="true" />
          {needsUpdateCount > 0 && (
            <span
              className="absolute top-0.5 right-0.5 flex items-center justify-center rounded-full text-white leading-none"
              style={{ width: 14, height: 14, fontSize: 9, backgroundColor: '#DC2626', border: '1.5px solid white' }}
              aria-label={`${needsUpdateCount} updates needed`}
            >
              {needsUpdateCount}
            </span>
          )}
        </button>

        {showNotifPanel && (
          <div
            className="absolute right-0 top-full mt-1 bg-white rounded-[10px] shadow-lg z-50"
            style={{ width: 288, border: '0.5px solid #E2E8F0' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '0.5px solid #F1F5F9' }}>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#1E293B]">Updates needed</span>
                {needsUpdateCount > 0 && (
                  <span
                    className="text-[10px] font-medium text-white rounded-full px-1.5 py-0.5"
                    style={{ backgroundColor: '#DC2626' }}
                  >
                    {needsUpdateCount}
                  </span>
                )}
              </div>
              {needsUpdateCount > 0 && (
                <button
                  type="button"
                  onClick={() => { needsUpdateEvents.forEach(ev => onSetStatus(ev.id, 'completed')); setShowNotifPanel(false) }}
                  className="text-[11px] text-[#64748B] hover:text-[#1E293B] transition-colors"
                >
                  Dismiss all
                </button>
              )}
            </div>

            {/* Event list */}
            {needsUpdateEvents.length === 0 ? (
              <p className="text-[12px] text-[#94A3B8] text-center py-6">All caught up!</p>
            ) : (
              <div>
                {needsUpdateEvents.slice(0, 5).map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '0.5px solid #F8FAFC' }}>
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${ev.type === 'phone' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
                      {ev.type === 'phone'
                        ? <Phone className="w-3 h-3 text-blue-600" aria-hidden="true" />
                        : <Video className="w-3 h-3 text-purple-600" aria-hidden="true" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#1E293B] truncate">{ev.name}</p>
                      <p className="text-[10px] text-[#94A3B8]">{ev.time}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button type="button" onClick={() => onSetStatus(ev.id, 'completed')}
                        className="w-6 h-6 flex items-center justify-center rounded text-[11px] hover:bg-[#DCFCE7] hover:text-[#15803D] text-[#64748B] transition-colors"
                        title="Mark done">✓</button>
                      <button type="button" onClick={() => onSetStatus(ev.id, 'rescheduled')}
                        className="w-6 h-6 flex items-center justify-center rounded text-[11px] hover:bg-[#FEF9C3] hover:text-[#92400E] text-[#64748B] transition-colors"
                        title="Rescheduled">↻</button>
                      <button type="button" onClick={() => onSetStatus(ev.id, 'no-show')}
                        className="w-6 h-6 flex items-center justify-center rounded text-[11px] hover:bg-[#FEF2F2] hover:text-[#DC2626] text-[#64748B] transition-colors"
                        title="Not reached">✗</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="px-4 py-2.5" style={{ borderTop: '0.5px solid #F1F5F9' }}>
              <button
                type="button"
                onClick={() => setShowNotifPanel(false)}
                className="text-[12px] text-[#2563EB] hover:underline"
              >
                View all in Schedule →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar + dropdown */}
      <div ref={avatarRef} className="relative shrink-0 pl-3 border-l border-[#E2E8F0]">
        <button
          onClick={() => setShowUserMenu(v => !v)}
          className="flex items-center gap-2 rounded-[7px] hover:bg-[#F8FAFC] transition-colors px-2 py-1.5"
          aria-label="User menu"
        >
          <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-[#1D4ED8] leading-none">{currentUser.initials}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" aria-hidden="true" />
        </button>

        {showUserMenu && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-[10px] shadow-lg z-50 py-1" style={{ border: '0.5px solid #E2E8F0' }}>
            <div className="px-4 py-3" style={{ borderBottom: '0.5px solid #F1F5F9' }}>
              <p className="text-[13px] font-medium text-[#1E293B]">{currentUser.name}</p>
              <p className="text-[11px] text-[#64748B]">{ROLE_LABELS[currentUser.role] ?? currentUser.role}</p>
              <p className="text-[10px] text-[#94A3B8]">{currentUser.company}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowUserMenu(false)}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#F8FAFC] cursor-pointer text-[12px] text-[#475569]"
            >
              <Settings size={14} className="text-[#64748B]" />
              Settings
            </button>
            <div className="h-px bg-[#F1F5F9] mx-2 my-1" />
            <button
              type="button"
              onClick={() => { setShowUserMenu(false); onLogout() }}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#F8FAFC] cursor-pointer text-[12px] text-[#DC2626]"
            >
              <LogOut size={14} className="text-[#DC2626]" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
