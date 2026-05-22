import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Plus, X, CheckSquare } from 'lucide-react'

type Priority = 'high' | 'medium' | 'low'

interface Task {
  id:       number
  text:     string
  priority: Priority | null
  dueDate:  Date
  done:     boolean
}

const PRIORITY_DOT: Record<Priority, string> = {
  high:   'bg-red-500',
  medium: 'bg-amber-400',
  low:    'bg-slate-300',
}

const PRIORITY_BORDER: Record<Priority, string> = {
  high:   'border-red-500',
  medium: 'border-amber-400',
  low:    'border-slate-300',
}

const initialTasks: Task[] = []

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  )
}

interface TasksCardProps {
  selectedDate?: Date
  isNewUser?: boolean
}

interface TaskRowProps {
  task:     Task
  isToday:  boolean
  selected: Date
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

function TaskRow({ task, isToday, selected, onToggle, onDelete }: TaskRowProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isOverdue = task.dueDate < selected && !isSameDay(task.dueDate, selected)

  return (
    <li className="group flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.text}
        type="button"
        className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
          task.done
            ? 'bg-[#2563EB] border-[#2563EB]'
            : 'border-border-strong hover:border-[#2563EB]'
        }`}
      >
        {task.done && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Text + tags */}
      <div className="flex-1 min-w-0">
        <span className={`text-[13px] leading-snug ${task.done ? 'line-through text-text-muted' : 'text-text-primary'}`}>
          {task.text}
        </span>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {/* Overdue tag — shown in today view if past due, always shown in non-today sections */}
          {(isToday ? task.dueDate < today && !isSameDay(task.dueDate, today) : isOverdue) && !task.done && (
            <span className="text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full">
              Overdue
            </span>
          )}
        </div>
      </div>

      {/* Priority dot */}
      {task.priority !== null && (
        <span
          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`}
          aria-label={`${task.priority} priority`}
        />
      )}
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-slate-100 shrink-0"
        aria-label="Delete task"
      >
        <X className="w-3.5 h-3.5 text-[#94A3B8]" />
      </button>
    </li>
  )
}

export function TasksCard({ selectedDate: propDate }: TasksCardProps) {
  const [tasks, setTasks]             = useState<Task[]>(initialTasks)
  const [adding, setAdding]           = useState(false)
  const [newText, setNewText]         = useState('')
  const [newPriority, setNewPriority] = useState<Priority | null>(null)
  const inputRef                      = useRef<HTMLInputElement>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selectedDate = propDate ?? today
  const isToday = isSameDay(selectedDate, today)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  function toggleTask(id: number) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function addTask() {
    const text = newText.trim()
    if (!text) return
    const next: Task = {
      id:       Date.now(),
      text,
      priority: newPriority,
      dueDate:  new Date(selectedDate),
      done:     false,
    }
    setTasks(prev => [...prev, next])
    setNewText('')
    setNewPriority(null)
    setAdding(false)
  }

  function deleteTask(id: number) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function onInputKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter')  { e.preventDefault(); addTask() }
    if (e.key === 'Escape') { setAdding(false); setNewText('') }
  }

  const pendingCount = tasks.filter(t => !t.done).length

  // Sections for non-today view
  const overdueTasks  = tasks.filter(t => t.dueDate <  selectedDate && !isSameDay(t.dueDate, selectedDate))
  const thisDayTasks  = tasks.filter(t => isSameDay(t.dueDate, selectedDate))
  const upcomingTasks = tasks.filter(t => t.dueDate >  selectedDate && !isSameDay(t.dueDate, selectedDate))

  return (
    <section
      className="bg-white border-subtle rounded-card shadow-sm h-full flex flex-col"
      aria-labelledby="tasks-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '0.5px solid #E2E8F0' }}>
        <div className="flex items-center gap-2">
          <h2 id="tasks-heading" className="text-[15px] font-bold text-text-primary">Tasks</h2>
          <span className="text-[10px] font-bold text-text-muted bg-slate-100 px-2 py-0.5 rounded-full">
            {pendingCount} pending
          </span>
        </div>
        <button
          onClick={() => setAdding(true)}
          type="button"
          className="flex items-center gap-1 text-[12px] font-medium text-[#2563EB] bg-white border-subtle px-[10px] py-1 rounded-[6px] hover:bg-[#F8FAFC] transition-colors"
        >
          <Plus className="w-3 h-3 text-[#2563EB]" aria-hidden="true" />
          Add task
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 px-5 py-4 overflow-auto">
        {tasks.length === 0 && !adding ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckSquare className="w-8 h-8 text-[#E2E8F0] mb-2" />
            <p className="text-[12px] text-[#94A3B8] mb-3">No tasks yet</p>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="bg-[#2563EB] text-white rounded-[7px] px-4 py-2 text-[12px] font-medium hover:bg-blue-700 transition-colors"
            >
              + Add task
            </button>
          </div>
        ) : isToday ? (
          /* Flat list for today */
          <ul className="flex flex-col divide-y divide-[#F1F5F9]" aria-label="Tasks">
            {tasks.map(task => (
              <TaskRow key={task.id} task={task} isToday onToggle={toggleTask} onDelete={deleteTask} selected={selectedDate} />
            ))}
          </ul>
        ) : (
          /* Sectioned view for other days */
          <div className="flex flex-col gap-4">
            {overdueTasks.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-[0.08em] mb-2">Overdue</p>
                <ul className="flex flex-col divide-y divide-[#F1F5F9]">
                  {overdueTasks.map(task => (
                    <TaskRow key={task.id} task={task} isToday={false} onToggle={toggleTask} onDelete={deleteTask} selected={selectedDate} />
                  ))}
                </ul>
              </div>
            )}
            {thisDayTasks.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.08em] mb-2">This day</p>
                <ul className="flex flex-col divide-y divide-[#F1F5F9]">
                  {thisDayTasks.map(task => (
                    <TaskRow key={task.id} task={task} isToday={false} onToggle={toggleTask} onDelete={deleteTask} selected={selectedDate} />
                  ))}
                </ul>
              </div>
            )}
            {upcomingTasks.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.08em] mb-2">Upcoming</p>
                <ul className="flex flex-col divide-y divide-[#F1F5F9]">
                  {upcomingTasks.map(task => (
                    <TaskRow key={task.id} task={task} isToday={false} onToggle={toggleTask} onDelete={deleteTask} selected={selectedDate} />
                  ))}
                </ul>
              </div>
            )}
            {overdueTasks.length === 0 && thisDayTasks.length === 0 && upcomingTasks.length === 0 && (
              <p className="text-[13px] text-text-muted text-center py-8">No tasks for this day</p>
            )}
          </div>
        )}

        {/* Inline add input */}
        {adding && (
          <div className="mt-3 flex items-center gap-2 border border-[#2563EB] rounded-btn px-3 py-2 bg-[#EFF6FF]">
            <input
              ref={inputRef}
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={onInputKey}
              placeholder="Task name… Enter to save, Esc to cancel"
              className="flex-1 text-[12px] bg-transparent outline-none text-[#1E293B] placeholder:text-[#94A3B8]"
              aria-label="New task name"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              {(['high', 'medium', 'low'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriority(prev => prev === p ? null : p)}
                  className={`w-3 h-3 rounded-full shrink-0 transition-all border-2 ${
                    newPriority === p
                      ? `${PRIORITY_DOT[p]} border-transparent`
                      : `bg-transparent ${PRIORITY_BORDER[p]}`
                  }`}
                  aria-label={`${p} priority`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
