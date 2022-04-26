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
        state: {
            page: '/',
            phase: 'configure',
            addingContestant: {
                addingType: 'team',
                teamName: '',
                personName: '',
                members: []
            },
            luckyLoser: []
        },
        settings: {
            name: 'Tournier',
            haveGroups: true,
            luckyLoser: true,
            winnerPerGroup: 2,
            defaultTime: 15 * 60
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

export const toCommonSmartStore = <
    OBJ extends {id: string},
    OBJS extends {[index: string]: OBJ} = {[index: string]: OBJ}
>(
    objs: OBJS,
    run: (obj: OBJ) => Unsubscriber,
    cleanUp?: () => void
) => toSmartStore<OBJ, string, string>(toStore(objs), index => objs[index], ({id}) => id, run, cleanUp)


/**
 * manage subscription on every item of an object
 * automaticly remove subscription when item is deleted on the object
 * and automaticly create an subscription when an item is added to the object 
 */
export const toSmartStore = <OBJ, ID, INDEX extends string | number | symbol>(
    store: Readable<{[I in INDEX]: OBJ}>,
    getObj: (index: INDEX) => OBJ,
    getId: (obj: OBJ) => ID,
    run: (obj: OBJ) => Unsubscriber,
    cleanUp?: () => void
) => {
    const unsubs = new Map<ID, Unsubscriber>()

    const unsub = store.subscribe(objs => {
        const ids = new Set<ID>()
        Object.keys(objs).forEach(index => {
            const obj = getObj(index as INDEX)
            const id = getId(obj)
            ids.add(id)
            if (unsubs.has(id))
                return
            const unsub = run(obj)
            unsubs.set(id, unsub)
        });
        [...unsubs.keys()].forEach(id => {
            if (ids.has(id))
                return
            unsubs.get(id)()
            unsubs.delete(id)
        })
    })

    return () => {
        unsub()
        unsubs.forEach(unsub => unsub())
        cleanUp && cleanUp()
    }
}


export const mapKey = <T extends object, K extends keyof T>(arr: T[], key: K) => {
    return arr.map(obj => obj[key])
}