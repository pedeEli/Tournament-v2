/// <reference types="@sveltejs/kit"/>


declare interface Tournament {
    settings: Settings,
    state: State,
    contestants: Contestants,
    matches: Matches,
    groups: Groups,
    finales: Finales
}

declare type Phase = 'configure' | 'groups' | 'groupsFinished' | 'finale'
declare interface State {
    page: string,
    addingContestant: {
        addingType: 'person' | 'team',
        teamName: string,
        personName: string,
        members: string[]
    }
    phase: Phase,
    luckyLoser: GroupWinners
}

declare interface Settings {
    name: string,
    haveGroups: boolean,
    luckyLoser: boolean,
    winnerPerGroup: number,
    defaultTime: number
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

declare type GroupState = 'running' | 'tie' | 'finished'
declare interface Tiebreaker {
    definite: string[],
    options: string[],
    selection: string[],
    remaining: number
}
declare type GroupWinners = string[] | Tiebreaker
declare interface Group {
    id: string,
    name: string,
    state: GroupState,
    members: string[],
    matches: string[],
    winners: GroupWinners
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