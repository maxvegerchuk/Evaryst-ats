type BadgeProps = {
  label: string
  color?: 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'stage'
}

const colorMap: Record<NonNullable<BadgeProps['color']>, string> = {
  info:    'bg-blue-50 text-blue-700 border border-blue-200',
  stage:   'bg-blue-50 text-blue-700 border border-blue-200',
  success: 'bg-status-success-bg text-status-success',
  warning: 'bg-status-warning-bg text-status-warning',
  danger:  'bg-status-danger-bg text-status-danger',
  neutral: 'bg-surface-overlay text-text-secondary',
}

export function Badge({ label, color = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${colorMap[color]}`}>
      {label}
    </span>
  )
}
