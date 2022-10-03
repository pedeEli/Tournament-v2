import {matches} from './tournament'
import {commonSmartSubscribe} from '@/utils/valtio'
import {proxy} from 'valtio'
import {subscribeKey} from 'valtio/utils'


const runningMatches = proxy<App.Id[]>([])
const pausedMatches = proxy<App.Id[]>([])
const pinnedMatches = proxy<App.Id[]>([])
const finishedMatches = proxy<App.Id[]>([])
const selectedMatch = proxy<{id: App.Id | undefined}>({id: undefined})

export {
  runningMatches,
  pausedMatches,
  pinnedMatches,
  finishedMatches,
  selectedMatch
}

const matchArrays: Partial<Record<App.MatchState, App.Id[]>> = {
  running: runningMatches,
  paused: pausedMatches,
  pinned: pinnedMatches,
  finished: finishedMatches
}

const matchStates = new Map<App.Id, App.MatchState>()

Object.values(matches).forEach(({id, state}) => {
  matchStates.set(id, state)
  const curArray = matchArrays[state]
  if (curArray)
    curArray.push(id)
})

commonSmartSubscribe<App.Match>(matches, match => {
  matchStates.set(match.id, match.state)

  const matchArray = matchArrays[match.state]
  if (matchArray)
    matchArray.push(match.id)

  const unsub = subscribeKey(match, 'state', state => {
    const prev = matchStates.get(match.id)!
    if (prev === state)
      return

    matchStates.set(match.id, state)
    
    const prevArray = matchArrays[prev]
    if (prevArray) {
      const prevIndex = prevArray.indexOf(match.id)
      prevArray.splice(prevIndex, 1)
    }

    const newArray = matchArrays[state]
    if (!newArray)
      return

    newArray.push(match.id)
  })

  return () => {
    unsub()
    const state = matchStates.get(match.id)!
    const matchArray = matchArrays[state]
    if (matchArray) {
      const index = matchArray.indexOf(match.id)
      matchArray.splice(index, 1)
    }
    matchStates.delete(match.id)
  }
})