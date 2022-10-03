import {matches, groups, brackets, state, settings, contestants} from '@/state/tournament'
import {subscribeKey} from 'valtio/utils'
import {createId} from '@/utils/str'
import {commonSmartSubscribe} from '@/utils/valtio'
import {log2} from '@/utils/math'
const gameState = state

const createBracket = (bids: Set<App.Id>) => (match: App.Match): App.Bracket => {
  const id = createId(bids)
  bids.add(id)
  return {
    id,
    level: 0,
    match: match.id
  }
}
const createMatch = (mids: Set<App.Id>) => ([left, right]: [App.Id, App.Id]): App.Match => {  
  const id = createId(mids)
  mids.add(id)
  return {
    id, left, right,
    leftScore: 0,
    rightScore: 0,
    state: 'waiting',
    drawable: false
  }
}
const createNextBrackets = (brackets: App.Bracket[], bids: Set<App.Id>, mids: Set<App.Id>, level1Starters: App.Id[]) => {
  const nextBrackets: App.Bracket[] = []
  const bracketMatches: App.Match[] = []
  let i = 0
  while (i < brackets.length) {
    const left = brackets[i]
    const match = createMatch(mids)(['', ''])
    bracketMatches.push(match)

    const bid = createId(bids)
    bids.add(bid)
    left.parent = bid
    
    if (left.level === 0 && i < level1Starters.length) {
      match.right = level1Starters[i]
      nextBrackets.push({
        id: bid,
        level: left.level + 1,
        match: match.id,
        left: left.id
      })

      i++
      continue
    }

    const right = brackets[i + 1]
    right.parent = bid
    nextBrackets.push({
      id: bid,
      level: left.level + 1,
      match: match.id,
      left: left.id,
      right: right.id
    })
    i += 2
  }
  if (nextBrackets[0].level === 1) {
    while (i < level1Starters.length) {
      const left = level1Starters[i]
      const right = level1Starters[i + 1]
      const match = createMatch(mids)([left, right])
      const bid = createId(bids)
      bracketMatches.push(match)
      nextBrackets.push({
        id: bid,
        level: 1,
        match: match.id
      })
      i += 2
    }
  }
  return [nextBrackets, bracketMatches] as const
}

export const deleteBrackets = () => {
  Object.values(brackets).forEach(({match, id}) => {
    delete brackets[id]
    delete matches[match]
  })
}
const createBracketsTree = (pairs: [App.Id, App.Id][], level1Starters: App.Id[]) => {
  const mids = new Set(Object.keys(matches))
  let bmatches = pairs.map(createMatch(mids))
  const allMatches = [...bmatches]

  const bids = new Set<App.Id>()
  let nextBrackets = bmatches.map(createBracket(bids))
  const allBrackets = [...nextBrackets]

  while (nextBrackets.length > 1 || (allBrackets.length === 1 && level1Starters.length > 0)) {
    [nextBrackets, bmatches] = createNextBrackets(nextBrackets, bids, mids, level1Starters)
    allBrackets.push(...nextBrackets)
    allMatches.push(...bmatches)
  }

  allMatches.forEach(m => matches[m.id] = m)
  allBrackets.forEach(b => brackets[b.id] = b)
}

export const createNoGroupsBrackets = () => {
  deleteBrackets()
  const winners = Object.keys(contestants)
  if (winners.length < 2)
    return
  winners.sort(() => Math.random() - 0.5)
  const {pairs, level1Starters} = pairUpNoLuckyLoser([winners], winners.length)
  createBracketsTree(pairs, level1Starters)
}

export const manageBracketsMatches = () => {
  return subscribeKey(state, 'phase', phase => {
    if (phase !== 'groupsFinished')
      return

    deleteBrackets()

    const winners = Object.values(groups).map(group => {
      const {winners} = group
      if (Array.isArray(winners))
        return [...winners]
      return [...winners.definite, ...winners.selection]
    })

    const {pairs, level1Starters} = getPairs(winners)
    createBracketsTree(pairs, level1Starters)
  })
}
const getPairs = (winners: App.Id[][]) => {
  if (!settings.luckyLoser)
    return pairUpNoLuckyLoser(winners)
  
  const luckyLoser = !settings.luckyLoser
    ? []
    : Array.isArray(state.luckyLoser)
    ? state.luckyLoser
    : [...state.luckyLoser.definite, ...state.luckyLoser.selection]
  const pairs = pairUpWithLuckyLoser(winners, luckyLoser)
  return {pairs, level1Starters: []}
}


export const managePhaseChangeToBrackets = () => {
  return commonSmartSubscribe<App.Bracket>(brackets, bracket => {
      const match = matches[bracket.match]
      return subscribeKey(match, 'state', state => {
          if (state === 'waiting')
              return
          
          gameState.phase = 'brackets'
      })
  })
}


export const propagateBracketsWinners = () => {
  return commonSmartSubscribe<App.Bracket>(brackets, bracket => {
      if (!bracket.parent)
          return () => {}
      
      const match = matches[bracket.match]
      const parent = brackets[bracket.parent]
      const parentMatch = matches[parent.match]
      const side = parent.left === bracket.id ? 'left' : 'right' as const

      const propagateWinner = () => {
          if (match.state !== 'closed' || (parentMatch.state !== 'waiting' && parentMatch.state !== 'pinned'))
              return () => {}
          const winner = match.leftScore > match.rightScore ? match.left : match.right
          parentMatch[side] = winner
      }

      const unsub1 = subscribeKey(match, 'state', propagateWinner)
      const unsub2 = subscribeKey(match, 'leftScore', propagateWinner)
      const unsub3 = subscribeKey(match, 'rightScore', propagateWinner)

      return () => {
          unsub1()
          unsub2()
          unsub3()
      }
  })
}

export const generateColumns = (brackets: App.Brackets) => {
  const allBrackets = Object.values(brackets)
  if (allBrackets.length === 0)
    return []
  const grandFinale = allBrackets.find(bracket => !bracket.parent)!
  let column: App.Bracket[] = [grandFinale]
  const columns: App.Bracket[][] = []

  while (column.length) {
      columns.unshift(column)
      column = column.map(parent => allBrackets.filter(bracket => bracket.parent === parent.id)).flat()
  }

  const pairedColumns = columns.map(pairUpColumn)
  const columnInfos: App.ColumnInfo[][] = []
  for (let i = 0; i < pairedColumns.length; i++) {
    const pairedColumn = pairedColumns[i]
    const columnInfo: App.ColumnInfo[] = []
    columnInfos.push(columnInfo)

    for (let j = 0; j < pairedColumn.length; j++) {
      const pair = pairedColumn[j]
      const isArray = Array.isArray(pair)

      let spaceTop = 0.5
      let spaceBottom = 0.5
      const n = columnInfo.reduce((acc, cur) => acc + (cur.type === 'single' ? 1 : 2), 0)
      
      if (isArray) {
        let spaceMiddle = 1
        const prevTop = columnInfos[i - 1]?.[n]
        const prevBottom = columnInfos[i - 1]?.[n + 1]

        if (prevTop?.type === 'double') {
          spaceTop = prevTop.spaceTop + prevTop.spaceMiddle * 0.5 + 2
          spaceMiddle += spaceTop - 0.5
        }
        if (prevBottom?.type === 'double') {
          spaceBottom = prevBottom.spaceTop + prevBottom.spaceMiddle * 0.5 + 2
          spaceMiddle += spaceBottom - 0.5
        }

        columnInfo.push({
          type: 'double',
          top: pair[0],
          bottom: pair[1],
          spaceTop,
          spaceBottom,
          spaceMiddle
        })
        continue
      }


      if (!pair.parent) {
        const prevTop = columnInfos[i - 1]?.[n]

        if (prevTop?.type === 'double') {
          spaceTop = prevTop.spaceTop + prevTop.spaceMiddle * 0.5 + 2
          spaceBottom = prevTop.spaceBottom + prevTop.spaceMiddle * 0.5 + 2
        }
      }
      columnInfo.push({
        type: 'single',
        bracket: pair,
        spaceTop,
        spaceBottom
      })
    }
  }

  return columnInfos
}
const pairUpColumn = (column: App.Bracket[]) => {
  const pairs: ([App.Bracket, App.Bracket] | App.Bracket)[] = []
  let i = 0
  while (i < column.length) {
    const bracket1 = column[i]

    if (!bracket1.parent || !brackets[bracket1.parent].right) {
      pairs.push(bracket1)
      i++
      continue
    }

    pairs.push([column[i], column[i + 1]])
    i += 2
  }
  return pairs
}


export const findFinale = () => {
  const allBrackets = Object.values(brackets)
  const finale = allBrackets.find(bracket => !bracket.parent)!
  return matches[finale.match]
}


const pairUpWithLuckyLoser = (winners: App.Id[][], luckyLoser: App.Id[], winnerPerGroup: number = settings.winnerPerGroup) => {
  const pairs: [App.Id, App.Id][] = []
  let luckyLoserIndex = 0

  const groupsCount = winners.length
  for (let i = 0; i < groupsCount; i++) {
    const temp: [App.Id, App.Id][] = []
    for (let j = 0; j < winnerPerGroup - 1; j += 2) {
      const left = winners[i][j]
      const right = winners[(i + 1) % groupsCount][j + 1]
      temp.push([left, right])
    }

    pairs.push(...temp)

    if (temp.length * 2 === winnerPerGroup)
      continue
    
    if (i % 2 === 1)
      continue
    
    const left = winners[i][winnerPerGroup - 1]
    const right = winners[i + 1]?.[winnerPerGroup - 1] ?? luckyLoser[luckyLoserIndex++]
    pairs.push([left, right])
  }

  if (luckyLoserIndex !== luckyLoser.length) {
    for (let i = luckyLoserIndex; i < luckyLoser.length; i += 2) {
      const left = luckyLoser[i]
      const right = luckyLoser[i + 1]
      pairs.push([left, right])
    }
  }

  return pairs
}
const pairUpNoLuckyLoser = (winners: App.Id[][], winnerPerGroup = settings.winnerPerGroup) => {
  const groupsCount = winners.length
  const winnersCount = winnerPerGroup * groupsCount
  const level0MatchesCount = winnersCount - (1 << log2(winnersCount))
  if (level0MatchesCount === 0)
    return {pairs: pairUpWithLuckyLoser(winners, [], winnerPerGroup), level1Starters: []}
  const level1StartersCount = winnersCount - level0MatchesCount * 2

  let groupIndex = 0
  const level1Starters: App.Id[] = []
  for (let i = 0; i < level1StartersCount; i++) {
    const group = winners[groupIndex++ % groupsCount]
    const level1Starter = group.shift()
    if (!level1Starter)
      throw new Error('level1Starter is undefined')
    level1Starters.push(level1Starter)
  }

  const newWinners: [App.Id, App.Id][] = []
  while (winners.length) {
    const group = winners.shift()!
    if (group.length === 0)
      continue
    if (group.length === 2) {
      newWinners.push([group[0], group[1]])
      continue
    }
    if (group.length === 1) {
      let opponent: App.Id | undefined = undefined
      let nextGroup: App.Id[]
      while (!opponent) {
        nextGroup = winners.shift()!
        opponent = nextGroup.shift()
        if (opponent)
          winners.unshift(nextGroup)
      }
      newWinners.push([group[0], opponent])
      continue
    }
    const left = group.shift()!
    const right = group.shift()!
    newWinners.push([left, right])
    winners.unshift(group)
  }
  const pairs = pairUpWithLuckyLoser(newWinners, [], 2)
  return {pairs, level1Starters}
}