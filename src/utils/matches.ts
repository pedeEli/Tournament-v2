import {groups, matches, settings, state} from '@/state/tournament'
import {commonSmartSubscribe} from '@/utils/valtio'
import {subscribeKey} from 'valtio/utils'
import {log2} from '@/utils/math'

export const managePhaseChangeFromConfigure = () => {
  return commonSmartSubscribe<App.Match>(matches, match => {
    return subscribeKey(match, 'state', matchState => {
      if (matchState === 'waiting' || matchState === 'pinned')
        return
      
      if (settings.groups) {
        const winnersCount = settings.winnerPerGroup * Object.keys(groups).length
        const luckyLoserPossible = 1 << log2(winnersCount) !== winnersCount
        settings.luckyLoser = luckyLoserPossible ? settings.luckyLoser : false
  
        state.phase = 'groups'
        return
      }

      settings.luckyLoser = false
      state.phase = 'brackets'
    })
  })
}


export const manageTimeAndState = () => {
  const intervals = new Map<App.Id, NodeJS.Timeout>()

  const matchInterval = (match: App.Match) => {
    return setInterval(() => {
      match.time!--
      if (match.time! > 0)
        return
      match.state = 'finished'
    }, 1000)
  }

  Object.values(matches).forEach((match) => {
    if (match.state !== 'running')
      return
    const interval = matchInterval(match)
    intervals.set(match.id, interval)
  })

  const matchSubscriber = (match: App.Match) => {
    return subscribeKey(match, 'state', s => {
      if (s === 'running') {
        const interval = matchInterval(match)
        return intervals.set(match.id, interval)
      }
      if (s === 'paused' || s === 'finished') {
        const interval = intervals.get(match.id)
        return clearInterval(interval)
      }
    })
  }
  const cleanUp = () => intervals.forEach(interval => clearInterval(interval))
  return commonSmartSubscribe(matches, matchSubscriber, cleanUp)
}