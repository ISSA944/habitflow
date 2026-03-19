import { useState } from 'react'
import { Plus, Trash2, Check, Calendar, CheckSquare, AlignLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'


export default function TaskList({ tasks, onUpdate }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCat, setNewCat] = useState('work')
  const [newPriority, setNewPriority] = useState('medium')
  const [newDate, setNewDate] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [filter, setFilter] = useState('all')

  const CATEGORIES = {
    work: { label: 'Работа', color: 'var(--info)' },
    personal: { label: 'Личное', color: 'var(--success)' },
    learning: { label: 'Обучение', color: 'var(--warning)' },
  }

  const PRIORITIES = {
    high: { label: 'Высокий', class: 'badge-high', dot: 'dot-high' },
    medium: { label: 'Средний', class: 'badge-medium', dot: 'dot-medium' },
    low: { label: 'Низкий', class: 'badge-low', dot: 'dot-low' }
  }

  async function addTask() {
    if (!newTitle.trim()) return
    setLoading(true)
    await supabase.from('tasks').insert({
      title: newTitle.trim(),
      category: newCat,
      priority: newPriority,
      due_date: newDate || null,
      completed: false
    })
    setNewTitle(''); setNewDate(''); setShowAdd(false); setLoading(false)
    onUpdate()
  }

  async function toggleTask(t) {
    await supabase.from('tasks').update({ completed: !t.completed }).eq('id', t.id)
    onUpdate()
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    onUpdate()
  }

  let filtered = tasks
  if (filter !== 'all') {
    filtered = tasks.filter(t => t.category === filter)
  }

  const active = tasks.filter(t => !t.completed).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="section-title" style={{marginBottom:0}}>
          <CheckSquare size={18} style={{marginRight:4}} /> Список задач
          <span className="text-muted text-sm" style={{fontWeight:400}}>({active} акт.)</span>
        </span>
        <button className="btn btn-sm btn-ghost" onClick={() => setShowAdd(v => !v)}>
          <Plus size={14}/> Добавить
        </button>
      </div>

      <div className="period-tabs mb-4">
        <button className={`period-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Все</button>
        <button className={`period-tab ${filter === 'work' ? 'active' : ''}`} onClick={() => setFilter('work')}>Работа</button>
        <button className={`period-tab ${filter === 'personal' ? 'active' : ''}`} onClick={() => setFilter('personal')}>Личное</button>
        <button className={`period-tab ${filter === 'learning' ? 'active' : ''}`} onClick={() => setFilter('learning')}>Обучение</button>
      </div>

      {showAdd && (
        <div className="card-sm mb-4 animate-in">
          <div className="form-row mb-3">
            <div className="form-group" style={{flex:2}}>
              <label className="form-label">Название задачи</label>
              <input
                className="input"
                placeholder="Что нужно сделать?"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                autoFocus
              />
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Дедлайн (необяз.)</label>
              <input type="date" className="input" value={newDate} onChange={e => setNewDate(e.target.value)} />
            </div>
          </div>
          <div className="form-row mb-3">
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Категория</label>
              <select className="select" value={newCat} onChange={e => setNewCat(e.target.value)}>
                {Object.entries(CATEGORIES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{flex:1}}>
              <label className="form-label">Приоритет</label>
              <select className="select" value={newPriority} onChange={e => setNewPriority(e.target.value)}>
                {Object.entries(PRIORITIES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
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
          <div className="empty-state-icon">
             <AlignLeft size={40} strokeWidth={1.5} />
          </div>
          <div className="empty-state-text">Задач в этой категории нет.</div>
        </div>
      ) : (
        <div className="stack">
          {filtered.map(t => (
            <div key={t.id} className={`task-item animate-in ${t.completed ? 'task-done' : ''}`}>
              <div
                className={`checkbox ${t.completed ? 'checked' : ''} mt-1`}
                onClick={() => toggleTask(t)}
              >
                {t.completed && <Check size={13} strokeWidth={3}/>}
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:500, fontSize:14}}>{t.title}</div>
                <div className="task-meta">
                  {CATEGORIES[t.category] && (
                    <span className="flex items-center gap-2 text-xs" style={{color: CATEGORIES[t.category].color}}>
                      <div className="w-2 h-2 rounded-full bg-current" style={{width:6,height:6,borderRadius:'50%',background:'currentColor'}}/>
                      {CATEGORIES[t.category].label}
                    </span>
                  )}
                  {PRIORITIES[t.priority] && (
                    <span className={`badge ${PRIORITIES[t.priority].class}`}>
                      {PRIORITIES[t.priority].label}
                    </span>
                  )}
                  {t.due_date && (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Calendar size={12}/> {new Date(t.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <button className="btn-icon" onClick={() => deleteTask(t.id)}>
                <Trash2 size={13}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
