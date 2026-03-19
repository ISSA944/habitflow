import { useState } from 'react'
import { Plus, Trash2, Check, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'

const CATEGORIES = [
  { id: 'work', label: 'Работа', emoji: '💼' },
  { id: 'personal', label: 'Личное', emoji: '🙋' },
  { id: 'health', label: 'Здоровье', emoji: '💪' },
  { id: 'study', label: 'Учёба', emoji: '📚' },
  { id: 'other', label: 'Другое', emoji: '📌' },
]

const PRIORITIES = [
  { id: 'high', label: 'Высокий', cls: 'badge-high', dot: 'dot-high' },
  { id: 'medium', label: 'Средний', cls: 'badge-medium', dot: 'dot-medium' },
  { id: 'low', label: 'Низкий', cls: 'badge-low', dot: 'dot-low' },
]

export default function TaskList({ tasks, onUpdate }) {
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ title: '', category: 'work', priority: 'medium', deadline: '' })
  const [loading, setLoading] = useState(false)

  async function addTask() {
    if (!form.title.trim()) return
    setLoading(true)
    await supabase.from('tasks').insert({
      title: form.title.trim(),
      category: form.category,
      priority: form.priority,
      deadline: form.deadline || null,
      completed: false,
    })
    setForm({ title:'', category:'work', priority:'medium', deadline:'' })
    setShowAdd(false)
    setLoading(false)
    onUpdate()
  }

  async function toggleTask(task) {
    await supabase.from('tasks').update({ completed: !task.completed }).eq('id', task.id)
    onUpdate()
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    onUpdate()
  }

  const filtered = filter === 'all' ? tasks
    : filter === 'done' ? tasks.filter(t => t.completed)
    : filter === 'active' ? tasks.filter(t => !t.completed)
    : tasks.filter(t => t.category === filter)

  const activeCnt = tasks.filter(t => !t.completed).length

  function isOverdue(task) {
    if (!task.deadline || task.completed) return false
    return new Date(task.deadline) < new Date()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="section-title" style={{marginBottom:0}}>
          ✅ Задачи
          {activeCnt > 0 && <span className="badge badge-medium">{activeCnt}</span>}
        </span>
        <button className="btn btn-sm btn-ghost" onClick={() => setShowAdd(v => !v)}>
          <Plus size={14}/> Добавить
        </button>
      </div>

      {/* Filters */}
      <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:14}}>
        {[
          {id:'all',label:'Все'},
          {id:'active',label:'Активные'},
          {id:'done',label:'Готово'},
          ...CATEGORIES,
        ].map(f => (
          <button
            key={f.id}
            className={`tag ${filter === f.id ? 'selected' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.emoji && <span>{f.emoji} </span>}{f.label}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="card-sm mb-3 animate-in">
          <div className="form-group mb-3">
            <label className="form-label">Задача</label>
            <input
              className="input"
              placeholder="Что нужно сделать?"
              value={form.title}
              onChange={e => setForm(p => ({...p, title: e.target.value}))}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              autoFocus
            />
          </div>
          <div className="form-row mb-3">
            <div className="form-group">
              <label className="form-label">Категория</label>
              <select className="select input" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Приоритет</label>
              <select className="select input" value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))}>
                {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Дедлайн</label>
              <input type="date" className="input" value={form.deadline} onChange={e => setForm(p => ({...p, deadline: e.target.value}))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={addTask} disabled={loading}>
              {loading ? '...' : 'Сохранить'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Отмена</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-text">Задач нет</div>
        </div>
      ) : (
        <div className="stack">
          {filtered.map(t => {
            const cat = CATEGORIES.find(c => c.id === t.category)
            const pri = PRIORITIES.find(p => p.id === t.priority)
            return (
              <div key={t.id} className={`task-item animate-in ${t.completed ? 'task-done' : ''}`}>
                <div
                  className={`checkbox ${t.completed ? 'checked' : ''}`}
                  onClick={() => toggleTask(t)}
                  style={{marginTop:2}}
                >
                  {t.completed && <Check size={13} strokeWidth={3}/>}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{
                    fontWeight:500,
                    fontSize:14,
                    textDecoration: t.completed ? 'line-through' : 'none',
                    color: t.completed ? 'var(--text-muted)' : 'var(--text)',
                  }} className="truncate">{t.title}</div>
                  <div className="task-meta">
                    <div className={`priority-dot ${pri?.dot}`}></div>
                    <span className={`badge ${pri?.cls}`}>{pri?.label}</span>
                    {cat && <span className="text-xs text-muted">{cat.emoji} {cat.label}</span>}
                    {t.deadline && (
                      <span className={`text-xs ${isOverdue(t) ? '' : 'text-muted'}`}
                        style={{color: isOverdue(t) ? 'var(--danger)' : undefined}}>
                        <Calendar size={10} style={{display:'inline', marginRight:3}} />
                        {new Date(t.deadline).toLocaleDateString('ru-RU')}
                        {isOverdue(t) && ' — просрочено'}
                      </span>
                    )}
                  </div>
                </div>
                <button className="btn-icon" onClick={() => deleteTask(t.id)} title="Удалить">
                  <Trash2 size={13}/>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
