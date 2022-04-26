import {writable} from 'svelte/store'
import {toStoreKey, toCommonSmartStore} from '$lib/tournament'

export const selectedMatch = writable('')

type GroupedByState = {
    [K in Match['state']]?: string[]
}
export const groupByState = (matches: Matches) => {
    return Object.values(matches).reduce<GroupedByState>((acc, cur) => {
        const group = acc[cur.state] ?? []
        acc[cur.state] = [...group, cur.id]
        return acc
    }, {})
}

export const manageTimeAndState = (matches: Matches) => {
    const intervals = new Map<string, NodeJS.Timeout>()
    const matchSubscriber = (match: Match) => {
        const state = toStoreKey(match, 'state')
        return state.subscribe(s => {
            if (s === 'running') {
                const interval = setInterval(() => {
                    match.time--
                    if (match.time > 0)
                        return
                    match.state = 'finished'
                }, 1000)
                return intervals.set(match.id, interval)
            }
            if (s === 'paused' || s === 'finished') {
                const interval = intervals.get(match.id)
                return clearInterval(interval)
            }
        })
    }
    const cleanUp = () => intervals.forEach(interval => clearInterval(interval))
    return toCommonSmartStore(matches, matchSubscriber, cleanUp)
}

export const managePhaseChange = (groups: Groups, matches: Matches, settings: Settings, state: State) => {
    return toCommonSmartStore<Match>(matches, match => {
        return toStoreKey(match, 'state').subscribe(matchState => {
            if (matchState === 'waiting')
                return
            
            const luckyLoserPossible = Math.log2(settings.winnerPerGroup * Object.keys(groups).length) % 1 !== 0
            settings.luckyLoser = luckyLoserPossible ? settings.luckyLoser : false

            state.phase = 'groups'
        })
    })
}