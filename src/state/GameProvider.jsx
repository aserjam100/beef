import { useReducer } from 'react'
import { GameContext, gameReducer, initialState } from './gameState.js'

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}
