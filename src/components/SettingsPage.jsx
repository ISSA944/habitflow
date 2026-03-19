import { useState } from 'react'
import { Bell, BellOff, Save } from 'lucide-react'
import { quoteCategories } from '../lib/quotes'
import { supabase } from '../lib/supabase'

export default function SettingsPage({ preferences, onUpdate }) {
  const [quotePrefs, setQuotePrefs] = useState(preferences?.quote_categories || [])
  const [notifTimes, setNotifTimes] = useState(preferences?.notification_times || ['08:00', '20:00'])
  const [notifEnabled, setNotifEnabled] = useState(Notification.permission === 'granted')
  const [saved, setSaved] = useState(false)

  async function requestNotifications() {
    const perm = await Notification.requestPermission()
    setNotifEnabled(perm === 'granted')
    if (perm === 'granted') {
      new Notification('HabitFlow 🎉', { body: 'Уведомления включены! Мы будем напоминать о привычках.' })
    }
  }

  function toggleCategory(id) {
    setQuotePrefs(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  function updateTime(i, val) {
    setNotifTimes(prev => { const n = [...prev]; n[i] = val; return n })
  }

  async function save() {
    const data = {
      quote_categories: quotePrefs,
      notification_times: notifTimes,
    }
    const { data: existing } = await supabase.from('user_preferences').select('id').limit(1)
    if (existing && existing.length > 0) {
      await supabase.from('user_preferences').update(data).eq('id', existing[0].id)
    } else {
      await supabase.from('user_preferences').insert({ ...data, name: 'Искандер' })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onUpdate()
  }

  return (
    <div>
      <div className="page-title" style={{fontSize:22}}>⚙️ Настройки</div>

      {/* Quote preferences */}
      <div className="card mb-4">
        <div className="section-title">Предпочтения цитат</div>
        <p className="text-secondary text-sm mb-3">
          Выберите темы, цитаты из которых вы хотите видеть. Чем больше — тем разнообразнее.
        </p>
        <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {quoteCategories.map(cat => (
            <button
              key={cat.id}
              className={`tag ${quotePrefs.includes(cat.id) ? 'selected' : ''}`}
              onClick={() => toggleCategory(cat.id)}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card mb-4">
        <div className="section-title">Напоминания</div>
        <div className="mb-3">
          {notifEnabled ? (
            <div className="notif-banner">
              <Bell size={16}/> Уведомления разрешены
            </div>
          ) : (
            <div>
              <div className="notif-banner" style={{borderColor:'rgba(250,204,21,0.3)', color:'var(--warning)', background:'rgba(250,204,21,0.06)', marginBottom:12}}>
                <BellOff size={16}/> Уведомления не разрешены
              </div>
              <button className="btn btn-primary" onClick={requestNotifications}>
                <Bell size={14}/> Разрешить уведомления
              </button>
            </div>
          )}
        </div>
        {notifEnabled && (
          <div>
            <label className="form-label mb-2">Время напоминаний</label>
            <div className="flex gap-3" style={{flexWrap:'wrap'}}>
              {notifTimes.map((t, i) => (
                <div key={i} className="form-group" style={{maxWidth:140}}>
                  <label className="form-label">Напоминание {i + 1}</label>
                  <input
                    type="time"
                    className="input"
                    value={t}
                    onChange={e => updateTime(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button className="btn btn-primary" onClick={save}>
        <Save size={14}/> {saved ? '✅ Сохранено!' : 'Сохранить настройки'}
      </button>
    </div>
  )
}
