/**
 * Rule-based AI recommendations engine
 * Analyzes user's habit/task data and generates personalized tips
 */

export function generateRecommendations(habits, habitLogs, tasks) {
  const tips = []
  const today = new Date().toISOString().split('T')[0]

  // --- Habit analysis ---
  const todayLogs = habitLogs.filter(l => l.date === today)
  const completedToday = todayLogs.filter(l => l.completed).map(l => l.habit_id)
  const missedHabits = habits.filter(h => !completedToday.includes(h.id))

  if (missedHabits.length > 0) {
    tips.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Незавершённые привычки',
      text: `Сегодня ещё не выполнено ${missedHabits.length} привычек. Осталось время наверстать!`,
    })
  }

  // Streak detection
  const streakHabits = habits.filter(h => {
    const logs = habitLogs.filter(l => l.habit_id === h.id && l.completed)
    return logs.length >= 7
  })
  if (streakHabits.length > 0) {
    tips.push({
      type: 'success',
      icon: '🔥',
      title: 'Отличная серия!',
      text: `Вы поддерживаете серию по ${streakHabits.length} привычкам. Продолжайте — это формирует характер!`,
    })
  }

  // --- Task analysis ---
  const incompleteTasks = tasks.filter(t => !t.completed)
  const highPriority = incompleteTasks.filter(t => t.priority === 'high')

  if (highPriority.length > 0) {
    tips.push({
      type: 'action',
      icon: '🎯',
      title: 'Высокие приоритеты',
      text: `У вас ${highPriority.length} задачи с высоким приоритетом. Начните с них — это освободит голову.`,
    })
  }

  // Overdue tasks
  const overdue = incompleteTasks.filter(t => {
    if (!t.deadline) return false
    return new Date(t.deadline) < new Date()
  })
  if (overdue.length > 0) {
    tips.push({
      type: 'warning',
      icon: '📅',
      title: 'Просроченные задачи',
      text: `${overdue.length} задачи просрочены. Пересмотрите дедлайны или закройте их сегодня.`,
    })
  }

  // Completion rate
  const completedTasks = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  if (totalTasks > 0 && completedTasks / totalTasks > 0.8) {
    tips.push({
      type: 'success',
      icon: '🏆',
      title: 'Высокий уровень выполнения!',
      text: `Вы завершили ${Math.round(completedTasks / totalTasks * 100)}% задач. Вы в ударе сегодня!`,
    })
  }

  // Morning energy tip
  const hour = new Date().getHours()
  if (hour < 10) {
    tips.push({
      type: 'info',
      icon: '☀️',
      title: 'Утренний совет',
      text: 'Начните день с самой важной задачи, пока воля и энергия на пике. Это правило "Съешь лягушку".',
    })
  } else if (hour >= 20) {
    tips.push({
      type: 'info',
      icon: '🌙',
      title: 'Вечерний ритуал',
      text: 'Потратьте 5 минут на планирование следующего дня. Это снизит стресс утром.',
    })
  }

  // Default tip if nothing else
  if (tips.length === 0) {
    tips.push({
      type: 'info',
      icon: '💡',
      title: 'Совет дня',
      text: 'Добавьте первую привычку и начните отслеживать прогресс. Маленькие шаги — большие результаты!',
    })
  }

  return tips.slice(0, 4) // Max 4 tips
}
