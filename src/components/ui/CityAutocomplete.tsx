import { useState } from 'react'
import { US_CITIES } from '../../data/usCities'

interface CityAutocompleteProps {
  cityValue:       string
  stateValue:      string
  onCityChange:    (city: string) => void
  onStateChange:   (state: string) => void
  cityPlaceholder?: string
}

const INP_ST = { border: '0.5px solid #E2E8F0', padding: '8px 12px' }
const INP_CLS = 'text-[12px] text-[#1E293B] rounded-[7px] focus:outline-none bg-white placeholder:text-[#94A3B8] focus:border-[#2563EB] transition-colors'

export function CityAutocomplete({
  cityValue,
  stateValue,
  onCityChange,
  onStateChange,
  cityPlaceholder = 'City',
}: CityAutocompleteProps) {
  const [open, setOpen] = useState(false)

  const suggestions = cityValue.trim().length > 0
    ? US_CITIES.filter(c =>
        c.city.toLowerCase().startsWith(cityValue.toLowerCase())
      ).slice(0, 6)
    : []

  function selectCity(city: string, state: string) {
    onCityChange(city)
    onStateChange(state)
    setOpen(false)
  }

  return (
    <div className="flex gap-2 items-start w-full">
      {/* City input with dropdown */}
      <div className="relative flex-1">
        <input
          value={cityValue}
          onChange={e => { onCityChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={cityPlaceholder}
          className={`${INP_CLS} w-full`}
          style={INP_ST}
          autoComplete="off"
        />
        {open && suggestions.length > 0 && (
          <div
            className="absolute top-full left-0 mt-1 bg-white rounded-[8px] shadow-md z-50 w-full max-h-[200px] overflow-y-auto"
            style={{ border: '0.5px solid #E2E8F0' }}
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => selectCity(s.city, s.state)}
                className="w-full px-3 py-2 text-left text-[12px] text-[#1E293B] hover:bg-[#F8FAFC] cursor-pointer"
              >
                {s.city}, {s.state}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* State input */}
      <input
        value={stateValue}
        onChange={e => onStateChange(e.target.value)}
        placeholder="ST"
        className={INP_CLS}
        style={{ ...INP_ST, width: 64 }}
        maxLength={2}
        autoComplete="off"
      />
    </div>
  )
}
