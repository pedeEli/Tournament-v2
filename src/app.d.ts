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
    winnerPerGroup: number
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

declare interface Match {
    id: string,
    state: 'waiting' | 'running' | 'paused' | 'leftWon' | 'rightWon',
    left: string,
    right: string
    leftScore: number,
    rightScore: number
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


declare namespace svelte.JSX {
    interface HTMLProps<T> {
        onclickoutside?: (event: CustomEvent) => void,
        ondoubleclick?: (event: CustomEvent) => void
    }
}