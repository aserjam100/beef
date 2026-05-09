import { users } from '../data/users.js'

let toastId = 9000

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateTickerItem(takes) {
  const take = randomItem(takes)
  const user = randomItem(users)
  const templates = [
    `🔥 '${take.text.slice(0, 28)}' +${rand(5, 40)}% in 1h`,
    `💀 ${user.username} got liquidated on '${take.text.slice(0, 22)}'`,
    `📈 '${take.text.slice(0, 28)}' breaking out`,
    `${user.username} +$${rand(50, 900)} on '${take.text.slice(0, 22)}'`,
    `🥩 New beef from ${user.username}`,
    `💸 $${rand(1000, 20000).toLocaleString()} traded in last hour`,
    `📉 '${take.text.slice(0, 24)}' rugged to ${rand(5, 25)}% agree`,
    `🚨 '${take.text.slice(0, 28)}' resolves in ${rand(5, 45)}m`,
  ]
  return randomItem(templates)
}

export function startSimulation(dispatch, getState, activeTab) {
  const intervals = []

  // every 4-7s: update a random take
  function scheduleTakeUpdate() {
    const delay = rand(4000, 7000)
    const t = setTimeout(() => {
      const state = getState()
      if (state.activeTakes.length === 0) { scheduleTakeUpdate(); return }
      const take = randomItem(state.activeTakes)
      const deltaAgree = (Math.random() - 0.5) * 4
      const newAgreePct = Math.min(95, Math.max(5, take.agreePct + deltaAgree))
      const newVoteCount = take.voteCount + rand(1, 3)
      dispatch({ type: 'UPDATE_TAKE', payload: { id: take.id, agreePct: Math.round(newAgreePct * 10) / 10, voteCount: newVoteCount } })
      scheduleTakeUpdate()
    }, delay)
    intervals.push(t)
  }

  // every 8s: rotate ticker
  const tickerInterval = setInterval(() => {
    const state = getState()
    if (state.activeTakes.length === 0) return
    const item = generateTickerItem(state.activeTakes)
    dispatch({ type: 'ROTATE_TICKER', payload: item })
  }, 8000)
  intervals.push(tickerInterval)

  // every 25-35s: notification toast
  function scheduleNotification() {
    const delay = rand(25000, 35000)
    const t = setTimeout(() => {
      if (activeTab() === 'submit') { scheduleNotification(); return }
      const state = getState()
      if (state.activeTakes.length === 0) { scheduleNotification(); return }
      const take = randomItem(state.activeTakes)
      const messages = [
        `🚨 Market resolving soon: '${take.text.slice(0, 30)}'`,
        `🔥 Volume spike on '${take.text.slice(0, 30)}'`,
        `📈 '${take.text.slice(0, 30)}' is moving fast`,
      ]
      dispatch({
        type: 'ADD_TOAST',
        payload: { id: ++toastId, message: randomItem(messages), variant: 'warning', duration: 2500 },
      })
      scheduleNotification()
    }, delay)
    intervals.push(t)
  }

  scheduleTakeUpdate()
  scheduleNotification()

  return () => intervals.forEach(t => { clearTimeout(t); clearInterval(t) })
}
