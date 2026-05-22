import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface EditPanelProps {
  isOpen:    boolean
  onClose:   () => void
  title:     string
  onSave:    () => void
  isSaving?: boolean
  children:  ReactNode
}

export function EditPanel({ isOpen, onClose, title, onSave, isSaving, children }: EditPanelProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/10 z-40" />}
      <div
        className="fixed top-0 right-0 h-screen bg-white flex flex-col z-50"
        style={{
          width: 380,
          borderLeft:  '0.5px solid #E2E8F0',
          boxShadow:   '-4px 0 24px rgba(0,0,0,0.08)',
          transform:   isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition:  'transform 300ms ease-in-out',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
          <span className="text-[14px] font-medium text-[#1E293B]">{title}</span>
          <button type="button" onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-[#64748B]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}>
          {children}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 flex-shrink-0" style={{ borderTop: '0.5px solid #E2E8F0' }}>
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-[12px] font-medium text-[#475569] bg-white rounded-[7px] hover:bg-[#F8FAFC] transition-colors"
            style={{ border: '0.5px solid #E2E8F0' }}>
            Cancel
          </button>
          <button type="button" onClick={onSave} disabled={isSaving}
            className="px-4 py-2 text-[12px] font-medium text-white bg-[#2563EB] rounded-[7px] hover:bg-[#1D4ED8] transition-colors disabled:opacity-60 flex items-center gap-2">
            {isSaving && (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
            )}
            Save changes
          </button>
        </div>
      </div>
    </>
  )
}
