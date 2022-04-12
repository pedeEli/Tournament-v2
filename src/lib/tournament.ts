import {proxy, snapshot, subscribe} from 'valtio/vanilla'
import type {Readable, Subscriber, Unsubscriber} from 'svelte/store'
import {v4} from 'uuid'

export const loadTournament = () => {
    const str = localStorage.getItem('tournament')
    const tournament = JSON.parse(str) ?? createEmptyTournament()
    return proxy<Tournament>(tournament)
}

const createEmptyTournament = (): Tournament => {
    return {
        settings: {
            name: 'Tournier',
            state: '/',
            haveGroups: false,
            luckyLoser: false,
            winnerPerGroup: 2,
            addingContestant: {
                addingType: 'team',
                teamName: '',
                personName: '',
                members: []
            }
        },
        contestants: {},
        matches: {},
        groups: {},
        finales: {}
    }
}

export const toStore = <T extends object>(obj: T): Readable<T> => {
    return {
        subscribe: (run: Subscriber<T>): Unsubscriber => {
            run(snapshot(obj) as T)
            return subscribe(obj, () => {
                run(snapshot(obj) as T)
            })
        }
    }
}

export const createId = (ids: string[]) => {
    const id = v4()
    if (ids.find(i => i === id))
        return createId(ids)
    return id
}

export const capitalizeWords = (str: string) => {
    return str.toLowerCase().split(' ').map(word => word[0].toUpperCase() + word.substring(1)).join(' ')
}