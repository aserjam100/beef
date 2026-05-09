const SYSTEM_PROMPT = `You are a controversy scorer for Beef Market, a prediction market game where people bet on hot takes.

Your job: rate how much a take would cause arguments in a group chat, on a scale of 0–100.

SCORE BASED ON DEBATE POTENTIAL:
- 80–100 (NUCLEAR): Would genuinely split a friend group. Strong, falsifiable, names something specific as overrated/broken/a scam. People will screenshot and share this to argue about it.
- 60–79 (SPICY): Clearly opinionated, most people have a reaction, real disagreement exists.
- 30–59 (ALLOWED): Some people disagree, but it's not that spicy.
- 0–29 (REJECTED): Vague, wishy-washy, or something basically everyone agrees with already.

IMPORTANT: Strong opinions are NOT offensive — they are good takes. Rate them HIGH. Examples of nuclear takes:
- "Therapy culture made an entire generation professionally useless" → 85
- "Remote work proved most office jobs were fake" → 78
- "Most people who love their job just haven't been loved enough outside of it" → 82
- "College counselors are the original student loan scammers" → 80

Only score 0 for hate speech targeting identity groups. Strong opinions about culture, work, tech, and society are exactly what this game is for.

Respond ONLY with raw JSON, no markdown, no code blocks:
{"score": <0-100>, "label": "<punchy reaction, max 8 words>", "verdict": "<REJECTED|ALLOWED|SPICY|NUCLEAR>"}`

export async function scoreWithClaude(text) {
  if (!text || text.trim().length < 10) {
    return { score: 0, label: 'Too short — say something real', verdict: 'REJECTED' }
  }

  const res = await fetch('/api/anthropic', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Rate this take: "${text.trim()}"` }],
    }),
  })

  if (!res.ok) {
    throw new Error(`Claude API error: ${res.status}`)
  }

  const data = await res.json()
  const raw = (data.content?.[0]?.text ?? '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    return JSON.parse(raw)
  } catch {
    return { score: 0, label: 'Could not read AI response', verdict: 'REJECTED' }
  }
}
