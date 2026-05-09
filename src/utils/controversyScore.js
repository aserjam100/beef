const NUCLEAR_WORDS = ['overrated','dead','scam','mid','actually','always','never','ruined','just','fad','worst','stupid','hate','wrong','lie','fake','broken','fraud','trash','garbage','toxic','cringe','cope','delusional']
const LUKEWARM_WORDS = ['good','nice','interesting','fine','okay','decent','alright','pretty','kind of','sort of','maybe','sometimes']

export function scoreText(text) {
  if (!text || text.trim().length < 10) {
    return { score: 0, label: "Too vague — give us something to argue about" }
  }
  const lower = text.toLowerCase()
  if (NUCLEAR_WORDS.some(w => lower.includes(w))) {
    return { score: 85, label: "🌶️🌶️🌶️ NUCLEAR — approved" }
  }
  if (LUKEWARM_WORDS.some(w => lower.includes(w))) {
    return { score: 15, label: "🌡️ LUKEWARM" }
  }
  return { score: 50, label: "🌶️🌶️ SPICY" }
}
