# 🥩 Beef Market

**Tinder for prediction markets.** Swipe on hot takes, bet real (fake) money on whether the internet agrees, and watch the odds move in real time.

Built at a hackathon in one session. Fully fake backend, entirely too much personality.

---

## What it is

Beef Market is a prediction market where the assets are spicy opinions.

- **Swipe right (AGREE)** or **left (DISAGREE)** on takes like *"AI is mid and we're all pretending otherwise"*
- Stake between $10–$500 on your conviction
- Watch live odds shift as the crowd votes
- Cash out when the market resolves

It's Kalshi meets Polymarket meets the group chat that will not stop arguing.

---

## Core features

**🃏 Swipe market** — Tinder-style card deck with drag physics. Swipe right to agree, left to disagree, up to skip. Stakes selector on each card.

**📊 Live simulation** — Odds move in real time. Volume spikes. Positions update. The ticker never sleeps.

**🚨 Urgency signals** — Cards expiring in under an hour pulse red. Under 30 minutes gets a full CLOSING banner.

**💬 Comments** — Tap any card to open the comments sheet. Filtered by CONTROVERSIAL (debate mode) or SPICY (ranked by heat). Pick your side before you can comment.

**🔒 Dark pool** — Submit a private take that only your network can access via a generated room code. Black card. Gold badge. Invite only.

**🤖 Claude-powered controversy gate** — The submit screen uses Claude AI to rate your take 0–100 for controversy. Lukewarm opinions are rejected. Only genuine beef makes it to market.

**💼 Portfolio** — Track your open positions and resolved history. One legendary BIG WIN already in the books.

**🏆 Leaderboard** — Sharpest bettors ranked by win rate. Hottest takes ranked by pool size.

---

## Stack

- React 19 + Vite
- Tailwind CSS v4
- Framer Motion (card physics)
- Claude API (`claude-haiku`) — controversy scoring
- Zero backend. All state in memory.

---

## Running locally

```bash
pnpm install
```

Create a `.env` file:

```
ANTHROPIC_API_KEY=your_key_here
```

```bash
pnpm dev
```

Open `http://localhost:5173` — the app renders as a fake iPhone in the browser.

---

## The pitch

> Everyone has opinions. Almost nobody is willing to put money on them.
> Beef Market changes that. One swipe at a time.
