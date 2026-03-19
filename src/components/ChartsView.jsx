import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#606060', font: { family: 'Inter', size: 11 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#606060', font: { family: 'Inter', size: 11 } },
      min: 0, max: 1, stepSize: 1,
    },
  },
}

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function getLast30Days() {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function getDayLabel(dateStr, period) {
  const d = new Date(dateStr + 'T12:00:00')
  if (period === 'day') return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  if (period === 'month') return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  return d.toLocaleDateString('ru-RU', { weekday: 'short', day:'numeric' })
}

export default function ChartsView({ habits, habitLogs, tasks }) {
  const [period, setPeriod] = useState('week')

  const dates = period === 'month' ? getLast30Days() : getLast7Days()

  // Completion rate per day
  const completionData = dates.map(date => {
    if (habits.length === 0) return 0
    const dayLogs = habitLogs.filter(l => l.date === date && l.completed)
    return Math.round((dayLogs.length / habits.length) * 100)
  })

  const lineData = {
    labels: dates.map(d => getDayLabel(d, period)),
    datasets: [{
      data: completionData,
      fill: true,
      borderColor: 'rgba(255,255,255,0.8)',
      backgroundColor: 'rgba(255,255,255,0.04)',
      pointBackgroundColor: '#fff',
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
    }]
  }

  const lineOptions = {
    ...CHART_OPTIONS,
    scales: {
      ...CHART_OPTIONS.scales,
      y: { ...CHART_OPTIONS.scales.y, min: 0, max: 100, ticks: { ...CHART_OPTIONS.scales.y.ticks, callback: v => v + '%' } }
    },
    plugins: {
      ...CHART_OPTIONS.plugins,
      tooltip: {
        callbacks: { label: ctx => `${ctx.raw}% привычек` },
        backgroundColor: '#1e1e1e',
        borderColor: '#333',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#a0a0a0',
      }
    }
  }

  // Task pie by category
  const catLabels = ['Работа', 'Личное', 'Здоровье', 'Учёба', 'Другое']
  const catKeys = ['work', 'personal', 'health', 'study', 'other']
  const catCounts = catKeys.map(k => tasks.filter(t => t.category === k).length)
  const pieColors = ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0.15)']

  const pieData = {
    labels: catLabels,
    datasets: [{
      data: catCounts,
      backgroundColor: pieColors,
      borderColor: '#141414',
      borderWidth: 2,
    }]
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: '#a0a0a0', font: { family: 'Inter', size: 12 }, padding: 14 }
      },
      tooltip: {
        backgroundColor: '#1e1e1e',
        borderColor: '#333',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#a0a0a0',
      }
    }
  }

  // Habit completion pie for today
  const today = new Date().toISOString().split('T')[0]
  const todayDone = habitLogs.filter(l => l.date === today && l.completed).length
  const todayMissed = Math.max(0, habits.length - todayDone)

  const habitPieData = {
    labels: ['Выполнено', 'Невыполнено'],
    datasets: [{
      data: [todayDone, todayMissed],
      backgroundColor: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.1)'],
      borderColor: '#141414',
      borderWidth: 2,
    }]
  }

  const activeTasks = tasks.filter(t => !t.completed).length
  const doneTasks = tasks.filter(t => t.completed).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="page-title" style={{marginBottom:0, fontSize:22}}>📊 Аналитика</span>
        <div className="period-tabs">
          {[{id:'week',label:'Неделя'},{id:'month',label:'Месяц'}].map(p => (
            <button
              key={p.id}
              className={`period-tab ${period === p.id ? 'active' : ''}`}
              onClick={() => setPeriod(p.id)}
            >{p.label}</button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid-3 mb-4">
        <div className="card stat-card">
          <div className="stat-number">{todayDone}</div>
          <div className="stat-label">Привычек сегодня</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number">{activeTasks}</div>
          <div className="stat-label">Активных задач</div>
        </div>
        <div className="card stat-card">
          <div className="stat-number">
            {habits.length > 0 ? Math.round(todayDone / habits.length * 100) : 0}%
          </div>
          <div className="stat-label">Прогресс сегодня</div>
        </div>
      </div>

      {/* Line chart */}
      <div className="card mb-4">
        <div className="section-title">Выполнение привычек</div>
        <div style={{height:220}}>
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Pie charts */}
      <div className="grid-2">
        <div className="card">
          <div className="section-title">Привычки сегодня</div>
          <div style={{height:200}}>
            <Doughnut data={habitPieData} options={pieOptions} />
          </div>
        </div>
        <div className="card">
          <div className="section-title">Задачи по категориям</div>
          <div style={{height:200}}>
            <Doughnut data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}
