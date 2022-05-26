import {toStoreKey, createId, toCommonSmartStore} from '$lib/tournament'

export const manageFinaleMatches = (matches: Matches, groups: Groups, finale: Finales, state: State, settings: Settings) => {
    return toStoreKey(state, 'phase').subscribe(phase => {
        if (phase !== 'groupsFinished')
            return
        
        if (!settings.haveGroups)
            throw new Error('No groups are not supported yet!')
        
        if (settings.luckyLoser)
            throw new Error('Lucky Loser is not supported yet!')

        Object.values(finale).forEach(({match, id}) => {
            delete matches[match]
            delete finale[id]
        })

       const winners = Object.values(groups).map(group => {
            const {winners} = group
            if (Array.isArray(winners))
                return winners
            return [...winners.definite, ...winners.selection]
        })
        const pairs = pairUp(winners)

        const mids = Object.keys(matches)
        let fmatches = pairs.map(createMatch(mids))
        const allMatches = [...fmatches]

        const fids = []
        let finales = fmatches.map(createFinale(fids))
        const allFinales = [...finales]

        while (finales.length > 1) {
            [finales, fmatches] = createNextFinale(finales, fids, mids)
            allFinales.push(...finales)
            allMatches.push(...fmatches)
        }

        allMatches.forEach(m => matches[m.id] = m)
        allFinales.forEach(f => finale[f.id] = f)
    })
}

const pairUp = (winners: string[][]) => {
    const pairs: [string, string][] = []
    const numberOfGroups = winners.length
    for (let i = 0; i < numberOfGroups; i++) {
        const left = winners[i][0]
        const right = winners[(i + 1) % numberOfGroups][1]
        pairs.push([left, right])
    }
    return pairs
}

const createFinale = (fids: string[]) => (match: Match): Finale => {
    const id = createId(fids)
    fids.push(id)
    return {
        id,
        level: 0,
        match: match.id
    }
}

const createMatch = (mids: string[]) => ([left, right]: [string, string]): Match => {  
    const id = createId(mids)
    mids.push(id)
    return {
        id, left, right,
        leftScore: 0,
        rightScore: 0,
        state: 'waiting',
        time: 0
    }
}

const createNextFinale = (finales: Finale[], fids: string[], mids: string[]) => {
    const nextFinales: Finale[] = []
    const finaleMatches: Match[] = []
    for (let i = 0; i < finales.length; i += 2) {
        const left = finales[i]
        const right = finales[i + 1]

        const match = createMatch(mids)(['', ''])
        finaleMatches.push(match)

        const fid = createId(fids)
        fids.push(fid)
        left.parent = fid
        right.parent = fid
        nextFinales.push({
            id: fid,
            level: left.level + 1,
            match: match.id,
            left: left.id,
            right: right.id
        })
    }
    return [nextFinales, finaleMatches] as const
}


export const managePhaseChangeToFinale = (matches: Matches, finales: Finales, gameState: State) => {
    return toCommonSmartStore<Finale>(finales, finale => {
        const match = matches[finale.match]
        return toStoreKey(match, 'state').subscribe(state => {
            if (state === 'waiting')
                return
            
            gameState.phase = 'finale'
        })
    })
}


export const generateColumns = (finales: Finale[]) => {
    const grandFinale = finales.find(finale => !finale.parent)
    let column: Finale[] = [grandFinale]
    const columns: Finale[][] = []

    while (column.length) {
        columns.unshift(column)
        column = column.map(parent => finales.filter(finale => finale.parent === parent.id)).flat()
    }

    return columns
}