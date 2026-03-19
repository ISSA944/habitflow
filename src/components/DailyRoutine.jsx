import { useState } from 'react'
import { Plus, Trash2, Check, GripVertical } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function DailyRoutine({ routines, today, onUpdate }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')
  const [loading, setLoading] = useState(false)

  async function addRoutine() {
    if (!newTitle.trim()) return
    setLoading(true)
    await supabase.from('routines').insert({
      title: newTitle.trim(),
      time_slot: newTime || null,
      order_index: routines.length,
      completed_today: false,
      date: today,
    })
    setNewTitle(''); setNewTime(''); setShowAdd(false); setLoading(false)
    onUpdate()
  }

  async function toggleRoutine(r) {
    await supabase.from('routines').update({ completed_today: !r.completed_today }).eq('id', r.id)
    onUpdate()
  }

  async function deleteRoutine(id) {
    await supabase.from('routines').delete().eq('id', id)
    onUpdate()
  }

  const sorted = [...routines].sort((a,b) => {
    if (a.time_slot && b.time_slot) return a.time_slot.localeCompare(b.time_slot)
    if (a.time_slot) return -1
    if (b.time_slot) return 1
    return a.order_index - b.order_index
  })

  const done = routines.filter(r => r.completed_today).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="section-title" style={{marginBottom:0}}>
          🗓 Ежедневная рутина
          <span className="text-muted text-sm" style={{fontWeight:400}}>({done}/{routines.length})</span>
        </span>
        <button className="btn btn-sm btn-ghost" onClick={() => setShowAdd(v => !v)}>
          <Plus size={14}/> Добавить
        </button>
      </div>

      {showAdd && (
        <div className="card-sm mb-3 animate-in">
          <div className="form-row mb-3">
            <div className="form-group" style={{flex:2}}>
              <label className="form-label">Дело</label>
              <input
                className="input"
                placeholder="Зарядка, Завтрак, Медитация..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addRoutine()}
                autoFocus
              />
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Время (необяз.)</label>
              <input type="time" className="input" value={newTime} onChange={e => setNewTime(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={addRoutine} disabled={loading}>
              {loading ? '...' : 'Сохранить'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Отмена</button>
          </div>
        </div>
      )}

      {routines.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">☀️</div>
          <div className="empty-state-text">Добавьте ежедневные дела</div>
        </div>
      ) : (
        <div className="stack">
          {sorted.map(r => (
            <div key={r.id} className="routine-item animate-in">
              {r.time_slot && <span className="routine-time">{r.time_slot}</span>}
              <div
                className={`checkbox ${r.completed_today ? 'checked' : ''}`}
                onClick={() => toggleRoutine(r)}
              >
                {r.completed_today && <Check size={13} strokeWidth={3}/>}
              </div>
              <div style={{
                flex:1,
                fontSize:14,
                fontWeight:500,
                textDecoration: r.completed_today ? 'line-through' : 'none',
                color: r.completed_today ? 'var(--text-muted)' : 'var(--text)',
              }}>{r.title}</div>
              <button className="btn-icon" onClick={() => deleteRoutine(r.id)}>
                <Trash2 size={13}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
