import { createContext, useContext } from 'react'
import { activeTakes as seedTakes, resolvedTakes } from '../data/takes.js'
import { tickerItems } from '../data/ticker.js'
import { seedComments } from '../data/comments.js'

export const GameContext = createContext(null)

export function useGame() {
  return useContext(GameContext)
}

const initialState = {
  user: { username: '@beef_lord', balance: 4247.83, wins: 47, losses: 23, rank: 12 },
  openPositions: [
    { takeId: 2,  text: "Slack is just email with anxiety and worse search",           side: 'AGREE',    stake: 50,  agreePct: 74, timeLeftMinutes: 210 },
    { takeId: 3,  text: "LinkedIn is the cringe capital of the internet",              side: 'AGREE',    stake: 75,  agreePct: 79, timeLeftMinutes: 95  },
    { takeId: 5,  text: "Hustle culture is just insecurity with a podcast deal",       side: 'AGREE',    stake: 100, agreePct: 62, timeLeftMinutes: 72  },
    { takeId: 8,  text: "College is a scam for 80% of the people who go",             side: 'AGREE',    stake: 150, agreePct: 49, timeLeftMinutes: 55  },
    { takeId: 11, text: "\"Do what you love\" is advice written by people already rich", side: 'AGREE', stake: 100, agreePct: 73, timeLeftMinutes: 60  },
    { takeId: 12, text: "Remote work made everyone worse at their actual jobs",        side: 'DISAGREE', stake: 75,  agreePct: 36, timeLeftMinutes: 30  },
    { takeId: 14, text: "Most life coaches have never actually accomplished anything", side: 'AGREE',    stake: 200, agreePct: 81, timeLeftMinutes: 53  },
    { takeId: 19, text: "Therapy speak has made everyone worse at communication",      side: 'AGREE',    stake: 100, agreePct: 55, timeLeftMinutes: 78  },
    { takeId: 24, text: "AGI is a fundraising term dressed up as a prophecy",          side: 'AGREE',    stake: 500, agreePct: 45, timeLeftMinutes: 28  },
    { takeId: 27, text: "Tipping culture is corps outsourcing payroll to customers",   side: 'AGREE',    stake: 50,  agreePct: 77, timeLeftMinutes: 33  },
    { takeId: 29, text: "Gen Z talks about mental health more than any gen and has less of it", side: 'DISAGREE', stake: 50, agreePct: 38, timeLeftMinutes: 44 },
  ],
  resolvedHistory: resolvedTakes,
  activeTakes: seedTakes.map(t => ({ ...t })),
  ticker: [...tickerItems],
  toasts: [],
  comments: { ...seedComments },
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'PLACE_BET': {
      const { takeId, side, stake, text } = action.payload
      const take = state.activeTakes.find(t => t.id === takeId)
      const newPosition = { takeId, text, side, stake, agreePct: take?.agreePct ?? 50, timeLeftMinutes: take?.timeLeftMinutes ?? 120 }
      const alreadyHas = state.openPositions.some(p => p.takeId === takeId)
      return {
        ...state,
        user: { ...state.user, balance: Math.max(0, state.user.balance - stake) },
        openPositions: alreadyHas
          ? state.openPositions.map(p => p.takeId === takeId ? newPosition : p)
          : [...state.openPositions, newPosition],
      }
    }
    case 'UPDATE_TAKE': {
      return {
        ...state,
        activeTakes: state.activeTakes.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
        openPositions: state.openPositions.map(p =>
          p.takeId === action.payload.id ? { ...p, agreePct: action.payload.agreePct ?? p.agreePct } : p
        ),
      }
    }
    case 'ROTATE_TICKER': {
      return { ...state, ticker: [action.payload, ...state.ticker.slice(0, 29)] }
    }
    case 'ADD_TOAST': {
      return { ...state, toasts: [...state.toasts, action.payload] }
    }
    case 'REMOVE_TOAST': {
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) }
    }
    case 'ADD_TAKE': {
      return { ...state, activeTakes: [action.payload, ...state.activeTakes] }
    }
    case 'COMMENT': {
      const { takeId, comment } = action.payload
      const existing = state.comments[takeId] || []
      return { ...state, comments: { ...state.comments, [takeId]: [comment, ...existing] } }
    }
    default:
      return state
  }
}

export { initialState }
