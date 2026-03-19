import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { quotes, quoteCategories } from '../lib/quotes'

export default function QuoteWidget({ preferences = [] }) {
  const [quote, setQuote] = useState(null)
  const [fadeIn, setFadeIn] = useState(true)

  function pickQuote() {
    const pool = preferences.length > 0
      ? quotes.filter(q => preferences.includes(q.category))
      : quotes
    const source = pool.length > 0 ? pool : quotes
    const idx = Math.floor(Date.now() / 3600000) % source.length
    return source[idx]
  }

  useEffect(() => {
    setQuote(pickQuote())
  }, [preferences])

  function refresh() {
    setFadeIn(false)
    setTimeout(() => {
      const pool = preferences.length > 0
        ? quotes.filter(q => preferences.includes(q.category))
        : quotes
      const source = pool.length > 0 ? pool : quotes
      const rand = source[Math.floor(Math.random() * source.length)]
      setQuote(rand)
      setFadeIn(true)
    }, 150)
  }

  if (!quote) return null

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <span className="section-title" style={{marginBottom:0}}>✨ Цитата дня</span>
        <button className="btn-icon" onClick={refresh} title="Следующая">
          <RefreshCw size={14} />
        </button>
      </div>
      <div style={{ opacity: fadeIn ? 1 : 0, transition: 'opacity 0.15s' }}>
        <p className="quote-text">«{quote.text}»</p>
        <p className="quote-author">— {quote.author}</p>
      </div>
    </div>
  )
}
