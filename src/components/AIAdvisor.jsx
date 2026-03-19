import { generateRecommendations } from '../lib/aiAdvisor'

export default function AIAdvisor({ habits, habitLogs, tasks }) {
  const tips = generateRecommendations(habits, habitLogs, tasks)

  return (
    <div>
      <div className="section-title mb-4">💡 AI-рекомендации</div>
      <div className="stack">
        {tips.map((tip, i) => (
          <div key={i} className={`tip-card ${tip.type} animate-in`}>
            <div className="tip-icon">{tip.icon}</div>
            <div>
              <div style={{fontWeight:600, fontSize:14, marginBottom:4}}>{tip.title}</div>
              <div style={{fontSize:13, color:'var(--text-secondary)', lineHeight:1.5}}>{tip.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
