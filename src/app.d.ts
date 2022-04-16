/// <reference types="@sveltejs/kit"/>


declare interface Tournament {
    settings: Settings,
    contestants: Contestants,
    matches: Matches,
    groups: Groups,
    finales: Finales
}

declare interface Settings {
    name: string,
    state: string,
    haveGroups: boolean,
    luckyLoser: boolean,
    winnerPerGroup: number,
    defaultTime: number,
    addingContestant: {
        addingType: 'person' | 'team',
        teamName: string,
        personName: string,
        members: string[]
    }
}

declare interface Contestants {
    [id: string]: Contestant
}

declare type Contestant = Person | Team

declare interface Person {
    id: string,
    type: 'person',
    name: string
}

declare interface Team {
    id: string,
    type: 'team',
    name: string,
    members: string[]
}

declare interface Matches {
    [id: string]: Match
}

type MatchState = 'waiting' | 'pinned' | 'running' | 'paused' | 'finished' | 'closed'
declare interface Match {
    id: string,
    state: MatchState,
    left: string,
    right: string
    leftScore: number,
    rightScore: number,
    time: number
}

declare interface Groups {
    [id: string]: Group
}

declare interface Group {
    id: string,
    name: string
    members: string[],
    matches: string[]
}

declare interface Finales {
    [id: string]: Finale
}

declare interface Finale {
    id: string
    parentId: string,
    matchId: string
}

declare type Writable<T> = import('svelte/store').Writable<T>
declare type Readable<T> = import('svelte/store').Readable<T>

declare type Popup = (msg: string, duration?: number) => void


declare interface ContestantsContext {
    removeContestant: (id: string) => () => void,
    renameContestant: (id: string) => (name: string) => void,
    getContestantName: (id: string) => () => string
}

declare interface GroupMemberInfo {
    id: string,
    wins: number,
    diff: number
}


declare namespace svelte.JSX {
    interface HTMLProps<T> {
        onclickoutside?: (event: CustomEvent) => void,
        ondoubleclick?: (event: CustomEvent) => void
    }
}