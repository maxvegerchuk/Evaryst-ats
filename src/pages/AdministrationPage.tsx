import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { User } from '../types/auth'
import { ALL_USERS } from '../types/auth'
import type { TeamMember } from '../types/team'

function storageKey(teamId: string) { return `evaryst_team_members_${teamId}` }

function loadMembers(teamId: string): TeamMember[] {
  try {
    const v = localStorage.getItem(storageKey(teamId))
    return v ? JSON.parse(v) : []
  } catch { return [] }
}

interface AdministrationPageProps {
  currentUser: User
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

const INP = 'text-[12px] text-[#1E293B] bg-white rounded-[7px] w-full placeholder-[#64748B]'
const INP_ST = { border: '0.5px solid #E2E8F0', padding: '8px 12px' } as const
const LBL = 'block text-[11px] text-[#475569] mb-1'

export function AdministrationPage({ currentUser }: AdministrationPageProps) {
  const builtInTeammates = ALL_USERS.filter(
    u => u.teamId === currentUser.teamId && u.id !== currentUser.id,
  )

  const [members,       setMembers]       = useState<TeamMember[]>(() => loadMembers(currentUser.teamId))
  const [showInvite,    setShowInvite]    = useState(false)
  const [inviteEmail,   setInviteEmail]   = useState('')
  const [inviteRole,    setInviteRole]    = useState<'recruiter' | 'talent_acquisition_manager'>('recruiter')
  const [inviteError,   setInviteError]   = useState('')
  const [successMsg,    setSuccessMsg]    = useState('')
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null)
  const [companyName,   setCompanyName]   = useState(
    () => currentUser.teamId === 'team-beta' ? 'Team Beta' : 'Team Alpha',
  )
  const [companyIndustry, setCompanyIndustry] = useState('')
  const [companyWebsite,  setCompanyWebsite]  = useState('')

  useEffect(() => {
    localStorage.setItem(storageKey(currentUser.teamId), JSON.stringify(members))
  }, [members, currentUser.teamId])

  useEffect(() => {
    if (!successMsg) return
    const t = setTimeout(() => setSuccessMsg(''), 3000)
    return () => clearTimeout(t)
  }, [successMsg])

  function sendInvite() {
    if (!inviteEmail.trim()) { setInviteError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) { setInviteError('Enter a valid email'); return }
    if (members.some(m => m.email.toLowerCase() === inviteEmail.trim().toLowerCase())) {
      setInviteError('This email has already been invited.')
      return
    }
    const member: TeamMember = {
      id:        'tm-' + Date.now(),
      email:     inviteEmail.trim(),
      role:      inviteRole,
      status:    'pending',
      invitedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
    setMembers(prev => [...prev, member])
    setSuccessMsg(`Invite sent to ${inviteEmail.trim()}`)
    setInviteEmail('')
    setInviteRole('recruiter')
    setInviteError('')
    setShowInvite(false)
  }

  function removeInvite(id: string) {
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  const roleLabel = (r: TeamMember['role']) =>
    r === 'talent_acquisition_manager' ? 'Manager' : 'Recruiter'

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-full">
      <h1 className="text-[24px] font-semibold text-[#1E293B] mb-6">Administration</h1>

      {/* ── TEAM MEMBERS ── */}
      <div className="bg-white rounded-[10px] p-5 mb-4" style={{ border: '0.5px solid #E2E8F0' }}>
        <div className="flex items-center mb-4">
          <span className="text-[14px] font-medium text-[#1E293B] flex-1">Team members</span>
          <button
            type="button"
            onClick={() => { setShowInvite(v => !v); setInviteError('') }}
            className="px-4 py-2 text-[12px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-[#1D4ED8] transition-colors"
          >
            + Invite recruiter
          </button>
        </div>

        {/* Invite form */}
        {showInvite && (
          <div className="rounded-[8px] p-4 mb-4" style={{ background: '#F8FAFC', border: '0.5px solid #E2E8F0' }}>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label htmlFor="invite-email" className={LBL}>Email address</label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={e => { setInviteEmail(e.target.value); setInviteError('') }}
                  placeholder="recruiter@company.com"
                  className={INP}
                  style={INP_ST}
                />
              </div>
              <div style={{ width: 180 }}>
                <label htmlFor="invite-role" className={LBL}>Role</label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as TeamMember['role'])}
                  className="text-[12px] text-[#1E293B] bg-white rounded-[7px] w-full cursor-pointer"
                  style={INP_ST}
                >
                  <option value="recruiter">Recruiter</option>
                  <option value="talent_acquisition_manager">Manager</option>
                </select>
              </div>
              <button
                type="button"
                onClick={sendInvite}
                className="px-4 py-2 text-[12px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-[#1D4ED8] transition-colors flex-shrink-0"
                style={{ paddingTop: 8, paddingBottom: 8 }}
              >
                Send invite
              </button>
              <button
                type="button"
                onClick={() => { setShowInvite(false); setInviteError('') }}
                className="text-[12px] text-[#64748B] hover:text-[#1E293B] flex-shrink-0"
              >
                Cancel
              </button>
            </div>
            {inviteError && (
              <p className="text-[11px] text-[#DC2626] mt-2">{inviteError}</p>
            )}
          </div>
        )}

        {/* Success toast */}
        {successMsg && (
          <div className="rounded-[7px] p-3 mb-4 text-[12px]" style={{ background: '#DCFCE7', color: '#15803D' }}>
            {successMsg}
          </div>
        )}

        {/* Table */}
        <div className="rounded-[10px] overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th scope="col" key={h} className="text-left px-4 py-2 text-[10px] uppercase text-[#64748B] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Current user row */}
              <tr style={{ borderBottom: '0.5px solid #F1F5F9' }}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-[#1D4ED8]">{currentUser.initials}</span>
                    </div>
                    <span className="text-[12px] font-medium text-[#1E293B]">{currentUser.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-[12px] text-[#475569]">{currentUser.email}</td>
                <td className="px-4 py-2.5 text-[12px] text-[#475569]">{roleLabel(currentUser.role)}</td>
                <td className="px-4 py-2.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#15803D' }}>
                    Active
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[12px] text-[#475569]">—</td>
                <td className="px-4 py-2.5 text-[12px] text-[#64748B]">—</td>
              </tr>

              {/* Built-in teammates from the same team */}
              {builtInTeammates.map(u => (
                <tr key={u.id} style={{ borderBottom: '0.5px solid #F1F5F9' }}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-[#1D4ED8]">{u.initials}</span>
                      </div>
                      <span className="text-[12px] font-medium text-[#1E293B]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-[#475569]">{u.email}</td>
                  <td className="px-4 py-2.5 text-[12px] text-[#475569]">{roleLabel(u.role)}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#15803D' }}>
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-[#475569]">—</td>
                  <td className="px-4 py-2.5 text-[12px] text-[#64748B]">—</td>
                </tr>
              ))}

              {/* Manually invited members */}
              {members.length === 0 ? null : (
                members.map(m => (
                  <tr key={m.id} className="hover:bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #F1F5F9' }}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {m.name && (
                          <div className="w-6 h-6 rounded-full bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-[#1D4ED8]">
                              {m.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-[12px] text-[#1E293B]">{m.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#475569]">{m.email}</td>
                    <td className="px-4 py-2.5 text-[12px] text-[#475569]">{roleLabel(m.role)}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{
                        background: m.status === 'active' ? '#DCFCE7' : '#FEF3C7',
                        color:      m.status === 'active' ? '#15803D' : '#92400E',
                      }}>
                        {m.status === 'active' ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#475569]">{formatDate(m.invitedAt)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        {m.status === 'pending' && (
                          <button type="button" onClick={() => setSuccessMsg(`Invite resent to ${m.email}`)} className="text-[11px] text-[#2563EB] hover:underline">
                            Resend
                          </button>
                        )}
                        <button type="button" onClick={() => setRemoveConfirmId(m.id)} className="text-[#64748B] hover:text-[#DC2626] transition-colors">
                          <X size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Remove confirmation */}
        {removeConfirmId && (() => {
          const m = members.find(x => x.id === removeConfirmId)
          if (!m) return null
          return (
            <div className="mt-3 rounded-[7px] p-3" style={{ background: '#FEF2F2', border: '0.5px solid #FECACA' }}>
              <p className="text-[12px] text-[#DC2626] mb-2">
                Remove {m.name || m.email} from your team?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRemoveConfirmId(null)}
                  className="px-3 py-1.5 text-[11px] text-[#475569] bg-white rounded-[6px] hover:bg-[#F8FAFC]"
                  style={{ border: '0.5px solid #E2E8F0' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { removeInvite(removeConfirmId); setRemoveConfirmId(null) }}
                  className="px-3 py-1.5 text-[11px] font-medium text-white rounded-[6px] hover:bg-[#B91C1C] transition-colors"
                  style={{ background: '#DC2626' }}
                >
                  Remove
                </button>
              </div>
            </div>
          )
        })()}
      </div>

      {/* ── COMPANY SETTINGS ── */}
      <div className="bg-white rounded-[10px] p-5" style={{ border: '0.5px solid #E2E8F0' }}>
        <p className="text-[14px] font-medium text-[#1E293B] mb-4">Company settings</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="co-name" className={LBL}>Company name</label>
            <input id="co-name" value={companyName} onChange={e => setCompanyName(e.target.value)} className={INP} style={INP_ST} />
          </div>
          <div>
            <label htmlFor="co-industry" className={LBL}>Industry</label>
            <select id="co-industry" value={companyIndustry} onChange={e => setCompanyIndustry(e.target.value)} className="text-[12px] text-[#1E293B] bg-white rounded-[7px] w-full cursor-pointer" style={INP_ST}>
              <option value="">Select industry</option>
              {['Technology','Healthcare','Finance','Manufacturing','Retail','Education','Logistics','Aerospace','Data Analytics'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="co-website" className={LBL}>Website</label>
            <input id="co-website" value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} placeholder="company.com" className={INP} style={INP_ST} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSuccessMsg('Settings saved')}
          className="mt-4 px-4 py-2 text-[12px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-[#1D4ED8] transition-colors"
        >
          Save changes
        </button>
      </div>
    </div>
  )
}
