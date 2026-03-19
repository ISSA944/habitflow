import { useState, useEffect } from 'react'

const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
const days = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота']

function getGreeting(hour) {
  if (hour < 6) return 'Доброй ночи'
  if (hour < 12) return 'Доброе утро'
  if (hour < 17) return 'Добрый день'
  if (hour < 22) return 'Добрый вечер'
  return 'Доброй ночи'
}

export default function ClockWidget() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const h = time.getHours()
  const m = String(time.getMinutes()).padStart(2,'0')
  const s = String(time.getSeconds()).padStart(2,'0')
  const formatted = `${String(h).padStart(2,'0')}:${m}`

  return (
    <div className="clock-widget">
      <div className="clock-time">{formatted}<span style={{fontSize:'0.45em',opacity:0.4,letterSpacing:0}}>:{s}</span></div>
      <div className="clock-greeting">{getGreeting(h)}, Искандер</div>
      <div className="clock-date">
        {days[time.getDay()]}, {time.getDate()} {months[time.getMonth()]} {time.getFullYear()}
      </div>
    </div>
  )
}
