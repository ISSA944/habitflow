import { useState, useEffect, useCallback } from 'react'
import { Home, CheckSquare, BarChart2, Zap, Settings, CalendarDays, ListTodo, AlertTriangle, Target } from 'lucide-react'
import { supabase, isConnected } from './lib/supabase'
import { getQuoteForUser } from './lib/quotes'
import ClockWidget from './components/ClockWidget'
import QuoteWidget from './components/QuoteWidget'
import HabitTracker from './components/HabitTracker'
import TaskList from './components/TaskList'
import DailyRoutine from './components/DailyRoutine'
import AIAdvisor from './components/AIAdvisor'
import ChartsView from './components/ChartsView'
import SettingsPage from './components/SettingsPage'
import './index.css'

const TODAY = new Date().toISOString().split('T')[0]

const NAV = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'habits', label: 'Привычки', icon: CheckSquare },
  { id: 'tasks', label: 'Задачи', icon: ListTodo },
  { id: 'routine', label: 'Рутина', icon: CalendarDays },
  { id: 'ai', label: 'AI советы', icon: Zap, desktopOnly: true },
  { id: 'charts', label: 'Аналитика', icon: BarChart2 },
  { id: 'settings', label: 'Настройки', icon: Settings },
]

// Mobile bottom nav: only 5 items
const MOBILE_NAV = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'habits', label: 'Привычки', icon: CheckSquare },
  { id: 'tasks', label: 'Задачи', icon: ListTodo },
  { id: 'charts', label: 'Аналитика', icon: BarChart2 },
  { id: 'settings', label: 'Ещё', icon: Settings },
]

export default function App() {
  const [page, setPage] = useState('home')
  const [habits, setHabits] = useState([])
  const [habitLogs, setHabitLogs] = useState([])
  const [tasks, setTasks] = useState([])
  const [routines, setRoutines] = useState([])
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    try {
      const [
        { data: h },
        { data: hl },
        { data: t },
        { data: r },
        { data: p },
      ] = await Promise.all([
        supabase.from('habits').select('*').order('created_at'),
        supabase.from('habit_logs').select('*'),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('routines').select('*').eq('date', TODAY).order('order_index'),
        supabase.from('user_preferences').select('*').limit(1),
      ])
      setHabits(h || [])
      setHabitLogs(hl || [])
      setTasks(t || [])
      setRoutines(r || [])
      setPreferences(p?.[0] || null)
    } catch(e) {
      console.warn('Supabase load error:', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Push notification scheduler
  useEffect(() => {
    if (Notification.permission !== 'granted' || !preferences?.notification_times) return
    const times = preferences.notification_times
    const intervals = []
    times.forEach(time => {
      const [h, m] = time.split(':').map(Number)
      const now = new Date()
      const target = new Date()
      target.setHours(h, m, 0, 0)
      if (target < now) target.setDate(target.getDate() + 1)
      const diff = target - now
      const timer = setTimeout(() => {
        new Notification('HabitFlow — Напоминание 🌱', {
          body: 'Не забудьте отметить свои привычки сегодня!',
          icon: '/favicon.svg',
        })
      }, diff)
      intervals.push(timer)
    })
    return () => intervals.forEach(clearTimeout)
  }, [preferences])

  const quotePrefs = preferences?.quote_categories || []

  // Dashboard stats
  const todayLogs = habitLogs.filter(l => l.date === TODAY)
  const doneHabits = todayLogs.filter(l => l.completed).length
  const activeTasks = tasks.filter(t => !t.completed).length
  const doneRoutine = routines.filter(r => r.completed_today).length

  function renderPage() {
    if (page === 'home') return (
      <div className="animate-in">
        <div className="page-title">Сегодня</div>

        <div className="bento-grid">
          {/* Top Row: Clock & Quote */}
          <div className="card bento-col-5" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
            <ClockWidget />
          </div>
          <div className="card bento-col-7" style={{display:'flex', flexDirection:'column', justifyContent:'center'}}>
            <QuoteWidget preferences={quotePrefs} />
          </div>

          {/* Stats Row — horizontal scroll on mobile */}
          <div className="bento-col-12 stats-scroll">
            <div className="card stat-card stat-mini" style={{cursor:'pointer'}} onClick={() => setPage('habits')}>
              <div className="stat-icon-wrap"><Target size={18} /></div>
              <div>
                <div className="stat-number">{doneHabits}<span style={{fontSize:18,opacity:0.4}}>/{habits.length}</span></div>
                <div className="stat-label">Привычки</div>
              </div>
            </div>
            <div className="card stat-card stat-mini" style={{cursor:'pointer'}} onClick={() => setPage('tasks')}>
              <div className="stat-icon-wrap"><CheckSquare size={18} /></div>
              <div>
                <div className="stat-number">{activeTasks}</div>
                <div className="stat-label">Задачи</div>
              </div>
            </div>
            <div className="card stat-card stat-mini" style={{cursor:'pointer'}} onClick={() => setPage('routine')}>
              <div className="stat-icon-wrap"><CalendarDays size={18} /></div>
              <div>
                <div className="stat-number">{doneRoutine}<span style={{fontSize:18,opacity:0.4}}>/{routines.length}</span></div>
                <div className="stat-label">Рутина</div>
              </div>
            </div>
          </div>

          {/* Activity Row */}
          <div className="card bento-col-7">
            <HabitTracker habits={habits.slice(0,5)} habitLogs={habitLogs} today={TODAY} onUpdate={loadAll} />
          </div>
          <div className="card bento-col-5">
            <TaskList tasks={tasks.filter(t => !t.completed).slice(0,5)} onUpdate={loadAll} />
          </div>

          {/* AI Advisor Row */}
          <div className="card bento-col-12">
            <AIAdvisor habits={habits} habitLogs={habitLogs} tasks={tasks} />
          </div>
        </div>
      </div>
    )

    if (page === 'habits') return (
      <div className="animate-in">
        <div className="page-title">Трекер привычек</div>
        <div className="card">
          <HabitTracker habits={habits} habitLogs={habitLogs} today={TODAY} onUpdate={loadAll} />
        </div>
      </div>
    )

    if (page === 'tasks') return (
      <div className="animate-in">
        <div className="page-title">Список задач</div>
        <div className="card">
          <TaskList tasks={tasks} onUpdate={loadAll} />
        </div>
      </div>
    )

    if (page === 'routine') return (
      <div className="animate-in">
        <div className="page-title">Ежедневная рутина</div>
        <div className="card">
          <DailyRoutine routines={routines} today={TODAY} onUpdate={loadAll} />
        </div>
      </div>
    )

    if (page === 'ai') return (
      <div className="animate-in">
        <div className="page-title">AI-рекомендации</div>
        <div className="card">
          <AIAdvisor habits={habits} habitLogs={habitLogs} tasks={tasks} />
        </div>
      </div>
    )

    if (page === 'charts') return (
      <div className="animate-in">
        <ChartsView habits={habits} habitLogs={habitLogs} tasks={tasks} />
      </div>
    )

    if (page === 'settings') return (
      <div className="animate-in">
        <SettingsPage preferences={preferences} onUpdate={loadAll} />
      </div>
    )
  }

  if (loading) return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      flexDirection:'column', gap:16, color:'var(--text-muted)'
    }}>
      <div style={{fontSize:40}}>🌱</div>
      <div style={{fontSize:16, fontWeight:500}}>Загружаем дашборд...</div>
    </div>
  )

  return (
    <div className="app">
      {/* Desktop Sidebar */}
      <nav className="sidebar desktop-nav">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🌱</div>
          <div className="sidebar-brand-name">HabitFlow</div>
        </div>
        <div className="nav-group-label">Навигация</div>
        {NAV.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <Icon size={17} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {MOBILE_NAV.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`mobile-nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <Icon size={20} strokeWidth={page === item.id ? 2.5 : 1.8} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Main */}
      <main className="main-content">
        {!isConnected && (
          <div style={{
            display:'flex', alignItems:'flex-start', gap:10, padding:'12px 16px',
            borderRadius:12, background:'rgba(250,204,21,0.06)',
            border:'1px solid rgba(250,204,21,0.25)', marginBottom:20, fontSize:13,
          }}>
            <AlertTriangle size={16} style={{color:'var(--warning)', flexShrink:0, marginTop:1}} />
            <div>
              <strong style={{color:'var(--warning)'}}>Supabase не подключён</strong>
              {' — '}
              <span style={{color:'var(--text-secondary)'}}>данные не сохраняются. Откройте <code style={{background:'rgba(255,255,255,0.08)', padding:'1px 6px', borderRadius:4}}>.env.local</code> и вставьте ваши ключи Supabase (URL и anon key) — тогда данные будут сохраняться на всех устройствах.</span>
            </div>
          </div>
        )}
        {renderPage()}
      </main>
    </div>
  )
}
