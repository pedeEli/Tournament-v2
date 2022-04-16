import {writable} from 'svelte/store'
import {toStoreKey} from '$lib/tournament'

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
    const unsubs = Object.keys(matches).map(mid => {
        const match = matches[mid]
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
    })

    return () => {
        unsubs.forEach(unsub => unsub())
        intervals.forEach(value => clearInterval(value))
    }
}