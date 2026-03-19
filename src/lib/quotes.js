export const quotes = [
  // Продуктивность
  { text: "Лучший момент начать — вчера. Второй лучший — сейчас.", author: "Китайская мудрость", category: "productivity" },
  { text: "Не откладывай на завтра то, что можно сделать сегодня.", author: "Бенджамин Франклин", category: "productivity" },
  { text: "Успех — это сумма небольших усилий, повторяемых изо дня в день.", author: "Роберт Коллиер", category: "productivity" },
  { text: "Дисциплина — это мост между целями и их достижением.", author: "Джим Рон", category: "productivity" },
  { text: "Фокусируйся на том, что можешь контролировать.", author: "Марк Аврелий", category: "productivity" },
  { text: "Делай сегодня то, что другие не хотят делать.", author: "Джерри Райс", category: "productivity" },
  // Здоровье
  { text: "Здоровье — это не всё, но без здоровья всё ничто.", author: "Артур Шопенгауэр", category: "health" },
  { text: "Позаботьтесь о своём теле. Это единственное место, где вам приходится жить.", author: "Джим Рон", category: "health" },
  { text: "Сон — лучшее лекарство.", author: "Народная мудрость", category: "health" },
  { text: "Движение — это жизнь.", author: "Гиппократ", category: "health" },
  // Цели
  { text: "Цель без плана — просто мечта.", author: "Антуан де Сент-Экзюпери", category: "goals" },
  { text: "Мечтайте масштабно, начинайте малым, действуйте сейчас.", author: "Робин Шарма", category: "goals" },
  { text: "Ваши текущие обстоятельства не определяют, куда вы можете пойти.", author: "Нидо Кубейн", category: "goals" },
  { text: "Каждый большой путь начинается с одного шага.", author: "Лао-цзы", category: "goals" },
  { text: "Ставь высокие цели — промахнёшься, но попадёшь хотя бы в облака.", author: "Лес Браун", category: "goals" },
  // Мотивация
  { text: "Ты не потерпишь поражения, пока не перестанешь пробовать.", author: "Альберт Эйнштейн", category: "motivation" },
  { text: "Поверьте в себя — и у вас будет меньше оправданий для неудач.", author: "Уинстон Черчилль", category: "motivation" },
  { text: "Единственный способ сделать великое дело — любить то, что делаешь.", author: "Стив Джобс", category: "motivation" },
  { text: "Не считай дни. Сделай так, чтобы дни считались.", author: "Мухаммед Али", category: "motivation" },
  { text: "Начни откуда стоишь. Используй что имеешь. Делай что можешь.", author: "Артур Эш", category: "motivation" },
  // Привычки
  { text: "Посейте привычку — пожнёте характер.", author: "Уильям Джеймс", category: "habits" },
  { text: "Побеждает не тот, кто сильнее, а тот, кто постоянен.", author: "Народная мудрость", category: "habits" },
  { text: "Мы — то, что мы делаем постоянно. Превосходство — это не поступок, а привычка.", author: "Аристотель", category: "habits" },
  { text: "Маленькие ежедневные улучшения со временем дают поразительные результаты.", author: "Робин Шарма", category: "habits" },
  // Английские (мотивация)
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "motivation" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "motivation" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown", category: "motivation" },
]

export function getQuoteForUser(preferences = []) {
  const preferred = preferences.length > 0
    ? quotes.filter(q => preferences.includes(q.category))
    : quotes
  const pool = preferred.length > 0 ? preferred : quotes
  const dayOfYear = Math.floor(Date.now() / 86400000)
  return pool[dayOfYear % pool.length]
}

export const quoteCategories = [
  { id: "productivity", label: "Продуктивность", emoji: "⚡" },
  { id: "health", label: "Здоровье", emoji: "💪" },
  { id: "goals", label: "Цели", emoji: "🎯" },
  { id: "motivation", label: "Мотивация", emoji: "🔥" },
  { id: "habits", label: "Привычки", emoji: "🌱" },
]
