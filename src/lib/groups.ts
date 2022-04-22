import {createId, toStoreKey, toSmartStore, toCommonSmartStore, mapKey} from '$lib/tournament'

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

export const getGroupWinners = (group: Group, matches: Matches, settings: Settings) => {
    const infos = group.members.map(mid => {
        const mmatches = getMatchesOf(group, matches, mid)
        return calcInfo(mmatches, mid)
    })
    return getWinners(infos, settings)
}
export const getWinners = (infos: GroupMemberInfo[], {winnerPerGroup}: Settings) => {
    const maxDiff = infos.reduce((max, {diff}) => Math.max(max, diff), 0)
    const winMultiplier = Math.pow(10, Math.floor(Math.log10(maxDiff)) + 1)
    const hasher = ({diff, wins}: GroupMemberInfo) => wins * winMultiplier + diff

    const grouped = infos.reduce<{[hash: number]: GroupMemberInfo[]}>((groups, info) => {
        const hash = hasher(info)
        const group = groups[hash] ?? []
        group.push(info)
        groups[hash] = group
        return groups
    }, {})
    const hashes = Object.keys(grouped) as any as number[]
    hashes.sort((a, b) => b - a)

    let index = 0
    let winners: string[] = []
    let options: string[] = []
    while (winners.length < winnerPerGroup) {
        const hash = hashes[index++]
        const groups = grouped[hash]

        if (groups.length <= winnerPerGroup - winners.length) {
            winners.push(...mapKey(groups, 'id'))
            continue
        }

        options.push(...mapKey(groups, 'id'))
        break
    }
    return {winners, options}
}


export const manageState = (groups: Groups, matches: Matches, settings: Settings) => {
    const groupSubscripter = (group: Group) => {
        const matchStates = new Map<string, MatchState>()
        group.matches.forEach(mid => matchStates.set(mid, matches[mid].state))

        const setWinner = () => {
            const {winners, options} = getGroupWinners(group, matches, settings)
            if (options.length === 0) {
                group.winners = winners
                return group.state === 'finished'
            }
            group.winners = {definite: winners, options, selection: []}
            group.state = 'tie'
        }
        
        const scoreSubscriber = (scores: {left: number, right: number}, side: 'left' | 'right') => (score: number) => {
            if (group.state === 'running' || scores[side] === score)
                return
            scores[side] = score
            setWinner()
        }

        const matchSubscriber = (mid: string) => {
            const match = matches[mid]
            const scores = {left: match.leftScore, right: match.rightScore}

            const unsub1 = toStoreKey(match, 'state').subscribe(state => {
                matchStates.set(mid, state)
                const states = [...matchStates.values()]

                if (states.some(state => state !== 'closed'))
                    return group.state = 'running'

                if (group.state === 'finished')
                    return

                setWinner()
            })
            const unsub2 = toStoreKey(match, 'leftScore').subscribe(scoreSubscriber(scores, 'left'))
            const unsub3 = toStoreKey(match, 'rightScore').subscribe(scoreSubscriber(scores, 'right'))
            return () => {
                matchStates.delete(mid)
                unsub1()
                unsub2()
                unsub3()
            }
        }

        return toSmartStore<string, string, number>(
            toStoreKey(group, 'matches'),
            index => group.matches[index],
            id => id,
            matchSubscriber)
    }
    return toCommonSmartStore(groups, groupSubscripter)
}