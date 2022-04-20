import {createId, toStoreKey} from '$lib/tournament'

export const getAssignedContestants = (groups: Group[]) => groups.map(group => group.members).flat(1)

export const createAndAssignMatches = (group: Group, matches: Matches) => {
    const matchPairs = createAllMatchPairs(group.members)
    const matchesList = Object.values(matches)
    group.matches = matchPairs.map(([leftId, rightId]) => {
        const existingMatch = findMatchWithIds(matchesList, leftId, rightId)
        if (existingMatch)
            return existingMatch.id

        const matchId = createId(Object.keys(matches))
        matches[matchId] = createNewMatch(matchId, leftId, rightId)
        return matchId
    })
}
const createAllMatchPairs = (ids: string[]): [string, string][] => {
    const pairs = []
    for (let i = 0; i < ids.length - 1; i++) {
        const leftId = ids[i]
        for (let j = i + 1; j < ids.length; j++) {
            const rightId = ids[j]
            pairs.push([leftId, rightId])
        }
    }
    return pairs
}
const findMatchWithIds = (matches: Match[], leftId: string, rightId: string): Match | undefined => {
    return matches.find(({left, right}) => left === leftId && right === rightId)
}
const createNewMatch = (id: string, left: string, right: string): Match => {
    return {
        id, left, right,
        state: 'waiting',
        leftScore: 0,
        rightScore: 0,
        time: 0,
    }
}

export const removeMatches = (group: Group, matches: Matches) => {
    group.matches.forEach(id => delete matches[id])
}

export const removeMatchesOfContestant = (id: string, group: Group, matches: Matches) => {
    const toRemove = Object.values(matches).filter(({left, right}) => left === id || right === id).map(({id}) => id)
    toRemove.forEach(id => removeMatch(id, group, matches))
}
const removeMatch = (id: string, group: Group, matches: Matches) => {
    delete matches[id]
    const index = group.matches.findIndex(_id => _id === id)
    group.matches.splice(index, 1)
}

export const reassignMatchesAfterRandomize = (groups: Group[], matches: Matches) => {
    const oldMatches = groups.map(({matches}) => matches).flat(1)
    groups.forEach(group => {
        createAndAssignMatches(group, matches)
    })
    const newMatches = groups.map(({matches}) => matches).flat(1)
    newMatches.forEach(id => {
        const index = oldMatches.findIndex(_id => _id === id)
        if (index === -1) return
        oldMatches.splice(index, 1)
    })
    oldMatches.forEach(id => delete matches[id])
}

export const getMatchesOf = (group: Group, matches: Matches, id: string) => {
    return group.matches
        .map(mid => matches[mid])
        .filter(({left, right, state}) => state === 'closed' && (left === id || right === id))
}
export const calcInfo = (matches: Match[], id: string) => {
    return matches.reduce<GroupMemberInfo>((acc, cur) => {
        if (cur.left === id) {
            if (cur.leftScore > cur.rightScore) {
                acc.wins++
                acc.diff += cur.leftScore - cur.rightScore
            }
        } else {
            if (cur.rightScore > cur.leftScore) {
                acc.wins++
                acc.diff += cur.rightScore - cur.leftScore
            }
        }
        return acc
    }, {id, wins: 0, diff: 0})
}


export const manageState = (groups: Groups, matches: Matches) => {
    const unsubs = Object.keys(groups).map(gid => {
        const group = groups[gid]
        const matchesStateMap = new Map<string, MatchState>()
        const matchesState = group.matches.map(mid => {
            const match = matches[mid]
            return {stateStore: toStoreKey(match, 'state'), mid}
        })
        const unsub = matchesState.map(({stateStore, mid}) => {
            return stateStore.subscribe(state => {
                matchesStateMap.set(mid, state)

                const values = [...matchesStateMap.values()]
                if (values.every(value => value === 'waiting')) {
                    group.state = 'prestart'
                    return
                }
                if (values.every(value => value === 'closed')) {
                    group.state = 'finished'
                    return
                }
                group.state = 'running'
            })
        })
        return unsub
    }).flat(1)
    return () => unsubs.forEach(unsub => unsub())
}