async function callClaude(system, userMsg) {
  const res = await fetch('/api/anthropic', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      system,
      messages: [{ role: 'user', content: userMsg }],
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text?.trim() ?? null
}

export async function getDevilsAdvocate(take) {
  return callClaude(
    'You are Satan — smug, snarky, and delighted when people are wrong. Write ONE sentence demolishing this take. Be cutting, a little mean, and specific. Act like you\'ve seen civilizations crumble over dumber opinions. Max 25 words. No quotes, no prefix, just the sentence.',
    `Argue against: "${take.text}"`
  )
}

export async function getAnalystNote(take) {
  return callClaude(
    'You are a dry, sarcastic financial analyst covering a prediction market for hot takes. Write 2 sentences in Bloomberg style explaining the market dynamics. Be specific and slightly absurd. No disclaimers.',
    `Take: "${take.text}"\n${take.agreePct}% AGREE · ${100 - take.agreePct}% DISAGREE · $${take.totalPool.toLocaleString()} pool · ${take.voteCount} votes · ${take.timeLeftMinutes}m left`
  )
}
