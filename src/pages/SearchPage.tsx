import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react'
import type { Candidate, CandidateStage } from '../types/candidate'
import { getAvatarColor, getInitials } from '../types/candidate'

const STAGE_COLORS: Record<CandidateStage, { bg: string; text: string }> = {
  'New':          { bg: '#F1F5F9', text: '#475569' },
  'Phone Screen': { bg: '#DBEAFE', text: '#1D4ED8' },
  'Interview':    { bg: '#FEF3C7', text: '#92400E' },
  'References':   { bg: '#F3E8FF', text: '#6D28D9' },
  'Submitted':    { bg: '#FFEDD5', text: '#9A3412' },
  'Placed':       { bg: '#DCFCE7', text: '#15803D' },
}

const RATING_COLORS: Record<string, { bg: string; text: string }> = {
  'Paper A': { bg: '#DBEAFE', text: '#1D4ED8' },
  'Paper B': { bg: '#F3E8FF', text: '#6D28D9' },
  'A':       { bg: '#DCFCE7', text: '#15803D' },
  'B':       { bg: '#FFFBEB', text: '#B45309' },
  'X':       { bg: '#FEE2E2', text: '#B91C1C' },
}

const SEL = 'text-[12px] text-[#1E293B] bg-white rounded-[7px] w-full cursor-pointer'
const SEL_ST = { border: '0.5px solid #E2E8F0', padding: '6px 10px' } as const
const LBL = 'block text-[11px] text-[#64748B] mb-1'

interface SearchPageProps {
  candidates:               Candidate[]
  initialKeyword?:          string
  setSelectedCandidateIds:  (ids: string[]) => void
  setCurrentCandidateIndex: (i: number) => void
  setCurrentPage:           (page: string) => void
}

export function SearchPage({ candidates, initialKeyword = '', setSelectedCandidateIds, setCurrentCandidateIndex, setCurrentPage }: SearchPageProps) {
  const [keywords,        setKeywords]        = useState(initialKeyword)
  const [searchMode,      setSearchMode]      = useState<'keywords' | 'boolean'>('keywords')
  const prevKeyword = useRef(initialKeyword)
  useEffect(() => {
    if (initialKeyword !== prevKeyword.current) {
      setKeywords(initialKeyword)
      prevKeyword.current = initialKeyword
    }
  }, [initialKeyword])
  const [classification,  setClassification]  = useState('')
  const [location,        setLocation]        = useState('')
  const [within,          setWithin]          = useState('')
  const [stage,           setStage]           = useState('')
  const [rating,          setRating]          = useState('')
  const [showAdvanced,    setShowAdvanced]     = useState(false)
  const [resumeWithin,    setResumeWithin]    = useState('')
  const [workAuth,        setWorkAuth]        = useState('')
  const [industry,        setIndustry]        = useState('')
  const [lastContacted,   setLastContacted]   = useState('')
  const [sortBy,          setSortBy]          = useState('date')
  const [selectedIds,     setSelectedIds]     = useState<string[]>([])
  const [filteredList,    setFilteredList]    = useState<Candidate[]>(candidates)
  const [matchCount,      setMatchCount]      = useState(candidates.length)

  useEffect(() => {
    const filtered = candidates.filter(c => {
      if (keywords && !c.name.toLowerCase().includes(keywords.toLowerCase()) &&
          !c.specialty.toLowerCase().includes(keywords.toLowerCase())) return false
      if (classification && c.specialty.toLowerCase() !== classification.toLowerCase()) return false
      if (location && !c.location.toLowerCase().includes(location.toLowerCase())) return false
      if (stage && c.stage !== stage) return false
      if (rating && c.rating !== rating) return false
      return true
    })
    setFilteredList(filtered)
    setMatchCount(filtered.length)
    setSelectedIds(prev => prev.filter(id => filtered.some(c => c.id === id)))
  }, [keywords, classification, location, stage, rating, candidates])

  const sorted = [...filteredList].sort((a, b) => {
    if (sortBy === 'name')    return a.name.localeCompare(b.name)
    if (sortBy === 'rating')  return a.rating.localeCompare(b.rating)
    return b.addedDate.localeCompare(a.addedDate)
  })

  const allSelected = sorted.length > 0 && sorted.every(c => selectedIds.includes(c.id))
  const toggleAll   = () => setSelectedIds(allSelected ? [] : sorted.map(c => c.id))
  const toggleRow   = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  function clearAll() {
    setKeywords(''); setClassification(''); setLocation(''); setWithin('')
    setStage(''); setRating(''); setResumeWithin(''); setWorkAuth('')
    setIndustry(''); setLastContacted('')
  }

  function handleViewProfiles() {
    if (!selectedIds.length) return
    setSelectedCandidateIds(selectedIds)
    setCurrentCandidateIndex(0)
    setCurrentPage('candidate')
  }

  const activeFilters: { key: string; label: string; clear: () => void }[] = []
  if (keywords)       activeFilters.push({ key: 'kw',    label: keywords,      clear: () => setKeywords('') })
  if (classification) activeFilters.push({ key: 'cls',   label: classification, clear: () => setClassification('') })
  if (location)       activeFilters.push({ key: 'loc',   label: within ? `${location} · ${within}` : location, clear: () => { setLocation(''); setWithin('') } })
  if (stage)          activeFilters.push({ key: 'stage', label: stage,         clear: () => setStage('') })
  if (rating)         activeFilters.push({ key: 'rate',  label: rating,        clear: () => setRating('') })

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-full">

      {/* ── PAGE HEADER ── */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-[18px] font-medium text-[#1E293B]">Search candidates</h1>
        <span className="text-[12px] text-[#64748B]">
          <span className={`font-[500] ${matchCount === 0 ? 'text-[#DC2626]' : 'text-[#1E293B]'}`}>
            {matchCount}
          </span>
          {' '}candidates match current filters
        </span>
      </div>

      {/* ── SEARCH CARD ── */}
      <div className="bg-white rounded-[10px] p-4 mb-4" style={{ border: '0.5px solid #E2E8F0' }}>

        {/* Row 1: keyword input + mode toggle */}
        <div className="grid gap-3 items-end mb-3" style={{ gridTemplateColumns: '1fr auto' }}>
          <div>
            <label className={LBL}>Keywords</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder="Search by skills, title, keywords..."
                className="w-full pl-9 pr-3 py-2 text-[12px] text-[#1E293B] bg-white rounded-[7px] placeholder-[#64748B]"
                style={{ border: '0.5px solid #E2E8F0' }}
              />
            </div>
            {searchMode === 'boolean' && (
              <p className="text-[10px] text-[#64748B] mt-1">
                Use AND, OR, NOT operators. Example: (React OR Vue) AND TypeScript
              </p>
            )}
          </div>
          <div className="flex gap-1 pb-0.5">
            {(['keywords', 'boolean'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setSearchMode(mode)}
                className="text-[11px] px-3 py-1.5 rounded-full capitalize transition-colors"
                style={{
                  border:     `0.5px solid ${searchMode === mode ? '#2563EB' : '#E2E8F0'}`,
                  background: searchMode === mode ? '#EFF6FF' : 'white',
                  color:      searchMode === mode ? '#2563EB'  : '#64748B',
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: 5 filter columns */}
        <div className="grid grid-cols-5 gap-3">
          <div>
            <label className={LBL}>Classification</label>
            <select value={classification} onChange={e => setClassification(e.target.value)} className={SEL} style={SEL_ST}>
              <option value="">All classifications</option>
              {['Software Engineer','UX Designer','Product Manager','Data Analyst','IT Manager','Business Analyst','HR Manager','Sales Representative','Marketing Manager','Network Admin','DevOps Engineer'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={LBL}>Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City or state"
              className="text-[12px] text-[#1E293B] bg-white rounded-[7px] w-full placeholder-[#64748B]"
              style={SEL_ST}
            />
          </div>
          <div>
            <label className={LBL}>Within</label>
            <select value={within} onChange={e => setWithin(e.target.value)} className={SEL} style={SEL_ST}>
              <option value="">Any distance</option>
              {['10 miles','25 miles','50 miles','100 miles'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={LBL}>Pipeline stage</label>
            <select value={stage} onChange={e => setStage(e.target.value)} className={SEL} style={SEL_ST}>
              <option value="">Any stage</option>
              {['New','Phone Screen','Interview','References','Submitted','Placed'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={LBL}>Rating</label>
            <select value={rating} onChange={e => setRating(e.target.value)} className={SEL} style={SEL_ST}>
              <option value="">Any rating</option>
              {['Paper A','Paper B','A','B','X'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Row 3: Advanced + Clear */}
        <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: '0.5px solid #F1F5F9' }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className="flex items-center gap-1.5 text-[11px] text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            <SlidersHorizontal size={13} />
            Advanced settings
            {showAdvanced
              ? <ChevronUp   size={12} className="text-[#64748B]" />
              : <ChevronDown size={12} className="text-[#64748B]" />
            }
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] text-[#64748B] hover:text-[#1E293B] transition-colors"
          >
            Clear all
          </button>
        </div>

        {/* Advanced settings */}
        {showAdvanced && (
          <div className="mt-3 pt-3 grid grid-cols-4 gap-3" style={{ borderTop: '0.5px solid #F1F5F9' }}>
            <div>
              <label className={LBL}>Resume updated within</label>
              <select value={resumeWithin} onChange={e => setResumeWithin(e.target.value)} className={SEL} style={SEL_ST}>
                <option value="">Any time</option>
                {['Last week','Last month','Last 3 months','Last 6 months','Last year'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={LBL}>Work authorization</label>
              <select value={workAuth} onChange={e => setWorkAuth(e.target.value)} className={SEL} style={SEL_ST}>
                <option value="">Any</option>
                {['US Citizen','Green Card','H1B Visa','TN Visa','Sponsorship required'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={LBL}>Industry</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} className={SEL} style={SEL_ST}>
                <option value="">Any industry</option>
                {['Technology','Healthcare','Finance','Manufacturing','Retail','Education','Logistics','Aerospace','Data Analytics'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={LBL}>Last contacted</label>
              <select value={lastContacted} onChange={e => setLastContacted(e.target.value)} className={SEL} style={SEL_ST}>
                <option value="">Any time</option>
                {['Last week','Last month','Last 3 months','Over 6 months ago'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── RESULTS SECTION ── */}

      {/* Results header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="text-[13px] font-medium text-[#1E293B]">Results</span>
          <span className="ml-2 text-[10px] font-medium text-[#2563EB] bg-[#EFF6FF] rounded-full px-2 py-0.5">
            {sorted.length}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-[11px] text-[#64748B] bg-white rounded-[7px] cursor-pointer"
            style={{ border: '0.5px solid #E2E8F0', padding: '6px 10px' }}
          >
            <option value="date">Date added</option>
            <option value="name">Name A–Z</option>
            <option value="rating">Rating</option>
            <option value="contact">Last contact</option>
          </select>
          <button
            type="button"
            onClick={handleViewProfiles}
            disabled={selectedIds.length === 0}
            className="px-4 py-1.5 text-[12px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-[#1D4ED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            View Profiles{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
          </button>
        </div>
      </div>

      {/* Active filter pills */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {activeFilters.map(f => (
            <div
              key={f.key}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]"
              style={{ background: '#EFF6FF', border: '0.5px solid #BFDBFE', color: '#1D4ED8' }}
            >
              {f.label}
              <button type="button" onClick={f.clear} className="hover:text-[#1E40AF] transition-colors leading-none">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Results table */}
      <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: '0.5px solid #E2E8F0' }}>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Search size={40} className="text-[#E2E8F0] mb-3" />
            <p className="text-[14px] font-medium text-[#1E293B] mb-1">No candidates match your search</p>
            <p className="text-[12px] text-[#64748B] mb-3">Try adjusting your filters or keywords</p>
            <button type="button" onClick={clearAll} className="text-[12px] text-[#2563EB] hover:underline">
              Clear all filters
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC]" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
                <th scope="col" className="px-3 py-2.5 w-9">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[#2563EB]" />
                </th>
                {['Name','Classification','Location','Stage','Rating','Last Contact'].map(h => (
                  <th scope="col" key={h} className="text-left px-3 py-2.5 text-[10px] uppercase text-[#64748B] font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(c => {
                const av = getAvatarColor(c.id)
                const sc = STAGE_COLORS[c.stage]
                const rc = RATING_COLORS[c.rating] ?? { bg: '#F1F5F9', text: '#475569' }
                return (
                  <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors" style={{ borderBottom: '0.5px solid #F1F5F9' }}>
                    <td className="px-3 py-2.5">
                      <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleRow(c.id)} className="accent-[#2563EB]" />
                    </td>
                    <td className="px-3 py-2.5" style={{ minWidth: 200 }}>
                      <button
                        type="button"
                        onClick={() => { setSelectedCandidateIds([c.id]); setCurrentCandidateIndex(0); setCurrentPage('candidate') }}
                        className="flex items-center gap-2 text-left"
                      >
                        <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: av.bg }}>
                          <span className="text-[10px] font-bold leading-none" style={{ color: av.clr }}>{getInitials(c.name)}</span>
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-[#2563EB] hover:underline leading-tight">{c.name}</p>
                          <p className="text-[10px] text-[#64748B] leading-tight">{c.specialty}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-[12px] text-[#64748B]" style={{ minWidth: 150 }}>{c.specialty}</td>
                    <td className="px-3 py-2.5 text-[12px] text-[#64748B]" style={{ minWidth: 130 }}>{c.location || '—'}</td>
                    <td className="px-3 py-2.5" style={{ minWidth: 120 }}>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: sc.bg, color: sc.text }}>
                        {c.stage}
                      </span>
                    </td>
                    <td className="px-3 py-2.5" style={{ minWidth: 100 }}>
                      {c.rating
                        ? <span className="text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: rc.bg, color: rc.text }}>{c.rating}</span>
                        : <span className="text-[12px] text-[#64748B]">—</span>
                      }
                    </td>
                    <td className="px-3 py-2.5 text-[12px] text-[#64748B]" style={{ minWidth: 110 }}>{c.addedDate || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}
