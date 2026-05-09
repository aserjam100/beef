# 🥩 Beef Market

**Tinder meets prediction market.** Swipe right to agree, swipe left to disagree — and put your money where your mouth is.

Drop nuclear takes online. Bet on them. Watch the crowd decide who was right. Test your relationships and friendships with dark pools.

---

## What is it

Beef Market is a prediction market where the assets are hot takes.

Swipe right if you agree. Swipe left if you don't. Pick your stake — $10, $50, $100, $500 — and let the market do the rest. Odds shift in real time as more people pile in. When the market resolves, winners get paid. Everyone else gets humbled.

Got a take too spicy for the public? Open a dark pool. Generate a private room code, share it with your group chat, and let them put money on it. No leaderboard. No strangers. Just your people betting against each other.

---

## Getting started

**Requirements:** Node.js 18+, pnpm, an Anthropic API key

```bash
git clone https://github.com/aserjam100/beef.git
cd beef
pnpm install
```

Create a `.env` file in the root:

```
ANTHROPIC_API_KEY=your_key_here
```

```bash
pnpm dev
```

Open `http://localhost:5173` in your browser.

---

## How it works

**Swipe** — Drag a card right to agree, left to disagree, up to skip. Pick your stake before you swipe.

**Bet** — Money goes into a shared pool. Odds move as the crowd votes. The more conviction behind a position, the better the payout if you're right.

**Submit your beef** — Write a take and Claude scores it 0–100 for controversy in real time. Too safe and it gets rejected. Hit nuclear and it goes live on the market.

**Dark pool** — Toggle to private before submitting. You get a room code — share it, and only your people can join. Black card. Gold badge. Off the leaderboard.

**Resolve** — Markets close and positions settle. Win and you get paid. Lose and the market reminds you.
