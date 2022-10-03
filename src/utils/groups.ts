import {matches, groups, settings, state as gameState} from '@/state/tournament'
import {createId} from '@/utils/str'
import {subscribeKey} from 'valtio/utils'
import {commonSmartSubscribe, smartSubscribe} from '@/utils/valtio'
import {log2} from '@/utils/math'
import {INTERNAL_Snapshot} from 'valtio/vanilla'

export const deleteMatchesOfContestant = (member: App.Id, group: App.Group) => {
  const todelete = Object.values(matches).filter(({left, right}) => left === member || right === member).map(({id}) => id)
  todelete.forEach(id => deleteMatch(id, group))
}
const deleteMatch = (match: App.Id, group: App.Group) => {
  delete matches[match]
  const index = group.matches.findIndex(id => id === match)
  group.matches.splice(index, 1)
}


export const createAndAssignMatches = (group: App.Group) => {
  const matchPairs = createAllMatchPairs(group.members)
  const matchesList = Object.values(matches)
  const matchIds = new Set(Object.keys(matches))
  group.matches = matchPairs.map(([leftId, rightId]) => {
    const existingMatch = findMatchWithIds(matchesList, leftId, rightId)
    if (existingMatch)
      return existingMatch.id

    const matchId = createId(matchIds)
    matchIds.add(matchId)
    matches[matchId] = createNewMatch(matchId, leftId, rightId)
    return matchId
  })
}
const createAllMatchPairs = (ids: App.Id[]): [App.Id, App.Id][] => {
  const pairs: [App.Id, App.Id][] = []
  for (let i = 0; i < ids.length - 1; i++) {
    const leftId = ids[i]
    for (let j = i + 1; j < ids.length; j++) {
      const rightId = ids[j]
      pairs.push([leftId, rightId])
    }
  }
  return pairs
}
const findMatchWithIds = (matches: App.Match[], leftId: App.Id, rightId: App.Id): App.Match | undefined => {
  return matches.find(({left, right}) => left === leftId && right === rightId)
}
const createNewMatch = (id: App.Id, left: App.Id, right: App.Id): App.Match => {
  return {
    id, left, right,
    state: 'waiting',
    leftScore: 0,
    rightScore: 0,
    drawable: true
  }
}


export const deleteFromGroups = (contestant: App.Id) => {
  const group = Object.values(groups).find(({members}) => members.find(id => id === contestant))
  if (!group)
    return
  
  const index = group.members.indexOf(contestant)
  group.members.splice(index, 1)
  deleteMatchesOfContestant(contestant, group)
}


export const deleteMatches = (group: App.Group) => {
  group.matches.forEach(id => delete matches[id])
}


export const getMatchesOf = (group: App.Group, contestant: App.Id) => {
  return group.matches
    .map(mid => matches[mid])
    .filter(({left, right, state}) => state === 'closed' && (left === contestant || right === contestant))
}
export const calcInfo = (matches: App.Match[], contestant: App.Id) => {
  return matches.reduce<App.GroupMemberInfo>((acc, cur) => {
    if (cur.left === contestant) {
      acc.diff += cur.leftScore - cur.rightScore
      if (cur.leftScore > cur.rightScore)
        acc.wins++
    } else {
      acc.diff += cur.rightScore - cur.leftScore
      if (cur.rightScore > cur.leftScore)
        acc.wins++
    }
    return acc
  }, {id: contestant, wins: 0, diff: 0})
}
export const sortInfos = (a: App.GroupMemberInfo, b: App.GroupMemberInfo) => {
  const d = b.wins - a.wins
  if (d !== 0)
    return d
  return b.diff - a.diff
}


export const reassignMatchesAfterRandomize = () => {
  const gs = Object.values(groups)
  const oldMatches = gs.map(({matches}) => matches).flat(1)
  gs.forEach(group => {
    createAndAssignMatches(group)
  })
  const newMatches = gs.map(({matches}) => matches).flat(1)
  newMatches.forEach(id => {
    const index = oldMatches.findIndex(_id => _id === id)
    if (index === -1) return
    oldMatches.splice(index, 1)
  })
  oldMatches.forEach(id => delete matches[id])
}

type ValidSettings = {
  status: 'valid'
} | {
  status: 'invalid',
  message: string
}
export const groupsValidSettings = (groups: INTERNAL_Snapshot<App.Groups> | App.Groups, groupsCount: number, settings: INTERNAL_Snapshot<App.Settings> | App.Settings): ValidSettings => {
  const {winnerPerGroup} = settings
  const enoughMembersInGroups = Object.values(groups).every(({members}) => members.length >= winnerPerGroup)
  if (!enoughMembersInGroups)
    return {
      status: 'invalid',
      message: `Es müssen mindestens ${winnerPerGroup} Mitglieder in jeder Gruppe sein.`
    }

  
  const winnersCount = winnerPerGroup * groupsCount
  const luckyLoserPossible = 1 << log2(winnersCount) !== winnersCount
  const luckyLoser = luckyLoserPossible ? settings.luckyLoser : false

  if (luckyLoser) {
    const winnersCount = winnerPerGroup * groupsCount
    const totalNeededMembersCount = 1 << log2(winnersCount) << 1
    const totalMembersCount = Object.values(groups).reduce((acc, {members}) => acc + members.length, 0)
    if (totalMembersCount < totalNeededMembersCount)
      return {
        status: 'invalid',
        message: 'Insgesamt sind nicht genug Mitglieder in den Gruppen für Lucky Loser'
      }
  }
  
  return { status: 'valid' }
}


const getGroupWinners = (group: App.Group) => {
  const infos = group.members.map(mid => {
    const mmatches = getMatchesOf(group, mid)
    return calcInfo(mmatches, mid)
  })
  return getWinners(infos, settings.winnerPerGroup)
}

/**
 * Groups every info together with the same win and diff
 * and returns the result.
 * It also return a list of all the hashes sorted from
 * largest to smallest so grouped.get(hashes[0])
 * has the highest wins and diff.
 */
const groupAndSortMembers = (infos: App.GroupMemberInfo[]) => {
  type Hash = number
  const maxDiff = infos.reduce((max, {diff}) => Math.max(max, diff), 0)
  const winMultiplier = Math.pow(10, Math.floor(Math.log10(maxDiff)) + 1)
  const hasher = ({diff, wins}: App.GroupMemberInfo): Hash => wins * winMultiplier + diff

  const grouped = infos.reduce<Map<Hash, App.GroupMemberInfo[]>>((groups, info) => {
    const hash = hasher(info)
    const group = groups.get(hash) ?? []
    group.push(info)
    groups.set(hash, group)
    return groups
  }, new Map())
  const hashes = Array.from(grouped.keys())
  hashes.sort((a, b) => b - a)

  return {grouped, hashes}
}
const getWinners = (infos: App.GroupMemberInfo[], winnerPerGroup: number) => {
  const {hashes, grouped} = groupAndSortMembers(infos)

  let index = 0
  let winners: string[] = []
  let options: string[] = []
  while (winners.length < winnerPerGroup) {
    const hash = hashes[index++]
    const groups = grouped.get(hash)!

    // all contestants on this level are winners
    if (groups.length <= winnerPerGroup - winners.length) {
      winners.push(...mapKey(groups, 'id'))
      continue
    }

    // not all contestants fit in the winners array, so we have a tiebreaker
    options.push(...mapKey(groups, 'id'))
    break
  }
  return {
    winners,
    options,
    remaining: winnerPerGroup - winners.length
  }
}


/**
 * The outer array represents the list of group.
 * The inner array represents the list of members in a group.
 */
const getLosers = (): App.GroupMemberInfo[][] => {
  return Object.values(groups).map(group => {
    const {winners, members} = group
    const losers = members.filter(mid => {
      if (Array.isArray(winners))
        return !winners.includes(mid)
      const {definite, selection} = winners
      return !definite.includes(mid) && !selection.includes(mid)
    })
    return losers.map(mid => {
      const mmatches = getMatchesOf(group, mid)
      return calcInfo(mmatches, mid)
    })
  })
}
const getLuckyLoser = () => {
  const winnerPerGroup = settings.winnerPerGroup
  const numberOfGroups = Object.keys(groups).length

  const totalGroupWinners = winnerPerGroup * numberOfGroups
  // getting the closest smaller power of two
  const totalWinners = 1 << (log2(totalGroupWinners - 1) + 1)
  const missingWinners = totalWinners - totalGroupWinners

  const infos = getLosers()
  const allLosers = infos.map(groupAndSortMembers)

  const winners: string[] = []
  const options: string[] = []
  let index = 0
  while (winners.length < missingWinners) {
    // retrieve all losers of all groups in the same level (e.g. all third places)
    const losers = allLosers.map(({grouped, hashes}) => grouped.get(hashes[index])!).flat(1).filter(loser => loser !== undefined)
    index++
    // all losers of this level are lucky losers
    if (losers.length < missingWinners - winners.length) {
      winners.push(...mapKey(losers, 'id'))
      continue
    }
    
    // get winners of one level
    const {winners: ws, options: os} = getWinners(losers, missingWinners - winners.length)
    winners.push(...ws)
    options.push(...os) // possible tiebreaker
    break
  }
  return {
    winners,
    options,
    remaining: missingWinners - winners.length
  }
}


/**
 * Sets the state of the group automaticly when a match state has changed.
 * Sets the winners and possible tiebreacker when every match is over.
 * Calculates lucky loser when every group is finished.
 */
export const manageGroupState = () => {
  const groupStates = new Map<App.Id, App.GroupState>()
  const groupWinners = new Map<App.Id, string>()

  Object.values(groups).forEach(({id, state, winners}) => {
    groupStates.set(id, state)
    groupWinners.set(id, JSON.stringify(winners))
  })

  const handleLuckyLoser = () => {
    if (gameState.phase === 'configure' || gameState.phase === 'brackets')
      return

    const states = Array.from(groupStates.values())
    const notAllFinished = states.some(state => state !== 'finished');
    // only calculate lucky loser when all groups are finished
    // also reset the gameState if it was groupsFinished
    if (notAllFinished && gameState.phase !== 'groups')
      return gameState.phase = 'groups'
    if (notAllFinished)
      return;

    if (gameState.phase === 'groupsFinished')
      return

    // when there's no lucky loser continue to groupsFinished
    if (!settings.luckyLoser)
      return gameState.phase = 'groupsFinished'
    
    const {options, winners, remaining} = getLuckyLoser()
    if (options.length === 0) {
      gameState.phase = 'groupsFinished'
      return gameState.luckyLoser = winners
    }
    gameState.luckyLoser = {
      definite: winners,
      options,
      selection: [],
      remaining 
    }
  }
  const stateSubscriber = (id: App.Id) => (state: App.GroupState) => {
    groupStates.set(id, state)
    handleLuckyLoser()
  }

  const groupSubscriber = (group: App.Group) => {
    groupStates.set(group.id, group.state)
    const unsub1 = subscribeKey(group, 'state', stateSubscriber(group.id))
    // in case the winners change because a match was edited
    // we recalculate lucky loser
    const unsub2 = subscribeKey(group, 'winners', winners => {
      const winnersStr = JSON.stringify(winners)
      if (!groupWinners.has(group.id)) {
        groupWinners.set(group.id, winnersStr)
        return
      }
      if (winnersStr === groupWinners.get(group.id))
        return
      if (gameState.phase === 'groupsFinished')
        gameState.phase = 'groups'
      handleLuckyLoser()
    })

    // ---------------------------------
    const matchStates = new Map<App.Id, App.MatchState>()
    group.matches.forEach(mid => matchStates.set(mid, matches[mid].state))

    const setWinner = () => {
      const {winners, options, remaining} = getGroupWinners(group)
      group.state = 'tie'
      setTimeout(() => {
        if (options.length === 0) {
          group.winners = winners
          return group.state = 'finished'
        }
        // tiebreaker
        group.winners = {
          definite: winners,
          options,
          selection: [],
          remaining
        }
      })
    }
    
    const scoreSubscriber = (scores: {left: number, right: number}, side: 'left' | 'right') => (score: number) => {
      if (scores[side] === score)
        return
      scores[side] = score
      if (group.state === 'running')
        return
      setWinner()
    }

    const matchSubscriber = (mid: string) => {
      const match = matches[mid]
      matchStates.set(mid, match.state)
      const scores = {left: match.leftScore, right: match.rightScore}

      // when all matches are finished calculate the winners of the group
      const unsub1 = subscribeKey(match, 'state', state => {
        matchStates.set(mid, state)
        const states = Array.from(matchStates.values())

        if (states.some(state => state !== 'closed')) {
          if (group.state !== 'running')
            group.state = 'running'
          return
        }

        if (group.state === 'finished')
          return

        setWinner()
      })
      // recalculate winners when the match has been edited
      const unsub2 = subscribeKey(match, 'leftScore', scoreSubscriber(scores, 'left'))
      const unsub3 = subscribeKey(match, 'rightScore', scoreSubscriber(scores, 'right'))
      return () => {
        matchStates.delete(mid)
        unsub1()
        unsub2()
        unsub3()
      }
    }

    const unsub3 = smartSubscribe<string, string, number>(
      group.matches,
      id => id,
      callback => {
        return subscribeKey(group, 'matches', callback)
      },
      matchSubscriber
    )

    return () => {
      unsub1()
      unsub2()
      unsub3()
    }
  }
  return commonSmartSubscribe(groups, groupSubscriber)
}


export const mapKey = <T extends object, K extends keyof T>(arr: T[], key: K) => {
  return arr.map(obj => obj[key])
}