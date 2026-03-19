import { useState } from 'react'
import { 
  Plus, Trash2, Flame, Check,
  Dumbbell, PersonStanding, BookOpen, Activity, 
  Apple, Droplets, Moon, Brain, 
  Target, PenTool, Music, Leaf, 
  Coffee, Heart, Zap, Sunrise
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const ICONS = {
  dumbbell: Dumbbell, person: PersonStanding, book: BookOpen, activity: Activity,
  apple: Apple, drop: Droplets, moon: Moon, brain: Brain,
  target: Target, pen: PenTool, music: Music, leaf: Leaf,
  coffee: Coffee, heart: Heart, zap: Zap, sun: Sunrise
}
const ICON_KEYS = Object.keys(ICONS)

export default function HabitTracker({ habits, habitLogs, today, onUpdate }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('dumbbell')
  const [loading, setLoading] = useState(false)

  const todayLogs = habitLogs.filter(l => l.date === today)

  function isCompleted(habitId) {
    return todayLogs.some(l => l.habit_id === habitId && l.completed)
  }

  function getStreak(habitId) {
    const logs = habitLogs
      .filter(l => l.habit_id === habitId && l.completed)
      .map(l => l.date)
      .sort((a,b) => b.localeCompare(a))

    let streak = 0
    const d = new Date(today)
    while (true) {
      const ds = d.toISOString().split('T')[0]
      if (logs.includes(ds)) { streak++; d.setDate(d.getDate()-1) }
      else break
    }
    return streak
  }

  async function toggleHabit(habitId) {
    const existing = todayLogs.find(l => l.habit_id === habitId)
    if (existing) {
      await supabase.from('habit_logs').update({ completed: !existing.completed }).eq('id', existing.id)
    } else {
      await supabase.from('habit_logs').insert({ habit_id: habitId, date: today, completed: true })
    }
    onUpdate()
  }

  async function addHabit() {
    if (!newName.trim()) return
    setLoading(true)
    await supabase.from('habits').insert({ name: newName.trim(), emoji: newIcon })
    setNewName(''); setShowAdd(false); setLoading(false)
    onUpdate()
  }

  async function deleteHabit(id) {
    await supabase.from('habit_logs').delete().eq('habit_id', id)
    await supabase.from('habits').delete().eq('id', id)
    onUpdate()
  }

  const done = habits.filter(h => isCompleted(h.id)).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="section-title" style={{marginBottom:0}}>
          <Target size={18} style={{marginRight:4}} /> Привычки
          <span className="text-muted text-sm" style={{fontWeight:400}}>({done}/{habits.length})</span>
        </span>
        <button className="btn btn-sm btn-ghost" onClick={() => setShowAdd(v => !v)}>
          <Plus size={14}/> Добавить
        </button>
      </div>

      {showAdd && (
        <div className="card-sm mb-3 animate-in">
          <div className="mb-2">
            <label className="form-label">Название привычки</label>
            <input
              className="input mt-1"
              placeholder="Например: Утренняя зарядка"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addHabit()}
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Иконка</label>
            <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:6}}>
              {ICON_KEYS.map(key => {
                const IconComp = ICONS[key]
                return (
                  <button
                    key={key}
                    onClick={() => setNewIcon(key)}
                    style={{
                      background: newIcon === key ? 'var(--text)' : 'var(--surface3)',
                      color: newIcon === key ? 'var(--bg)' : 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding:'8px',
                      cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      transition:'all 0.15s'
                    }}
                  >
                    <IconComp size={18} />
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={addHabit} disabled={loading}>
              {loading ? '...' : 'Сохранить'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Отмена</button>
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Target size={40} strokeWidth={1.5} />
          </div>
          <div className="empty-state-text">Добавьте первую привычку</div>
        </div>
      ) : (
        <div className="stack">
          {habits.map(h => {
             const done = isCompleted(h.id)
             const streak = getStreak(h.id)
             const IconComp = ICONS[h.emoji]
             return (
               <div key={h.id} className="habit-item animate-in">
                 <div
                   className={`checkbox ${done ? 'checked' : ''}`}
                   onClick={() => toggleHabit(h.id)}
                 >
                   {done && <Check size={13} strokeWidth={3} />}
                 </div>
                 <div className="habit-emoji">
                   {IconComp ? <IconComp size={20} /> : <span style={{fontSize:20}}>{h.emoji}</span>}
                 </div>
                 <div style={{flex:1, minWidth:0}}>
                   <div style={{fontWeight:500, fontSize:14, textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--text-muted)' : 'var(--text)'}}>
                     {h.name}
                   </div>
                 </div>
                 {streak > 0 && (
                   <div className="streak-badge">
                     <Flame size={12}/> {streak}д
                   </div>
                 )}
                <button
                  className="btn-icon"
                  style={{marginLeft:4}}
                  onClick={() => deleteHabit(h.id)}
                  title="Удалить"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
