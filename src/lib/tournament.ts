import {proxy, snapshot, subscribe} from 'valtio/vanilla'
import {subscribeKey} from 'valtio/utils'
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
            defaultTime: 15 * 60,
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

export const toStoreKey = <T extends object, K extends keyof T>(obj: T, key: K): Readable<T[K]> => {
    return {
        subscribe: (run: Subscriber<T[K]>): Unsubscriber => {
            run(obj[key])
            return subscribeKey(obj, key, run)
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

type GroupedContestants = {
    persons: Person[],
    teams: Team[]
}
export const groupByType = (contestants: Contestants): GroupedContestants => {
    const groups: GroupedContestants = {
        persons: [],
        teams: []
    }
    for (const contestant of Object.values(contestants)) {
        if (contestant.type === 'person') {
            groups.persons.push(contestant)
        }
        if (contestant.type === 'team')
            groups.teams.push(contestant)
    }
    return groups
}