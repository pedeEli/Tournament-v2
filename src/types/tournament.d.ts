declare namespace App {

  declare interface Tournament {
    version: string,
    settings: Settings,
    state: State,
    contestants: Contestants,
    matches: Matches,
    groups: Groups,
    brackets: Brackets
  }

  declare type Phase = 'configure' | 'groups' | 'groupsFinished' | 'brackets' | 'done'
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
    luckyLoser: boolean,
    groups: boolean,
    winnerPerGroup: number,
    defaultTime: number
  }
  
  declare type Id = string

  declare type Contestants = Record<string, Contestant>
  declare type Contestant = Person | Team

  declare interface Person {
    id: Id,
    type: 'person',
    name: string
  }

  declare interface Team {
    id: Id,
    type: 'team',
    name: string,
    members: string[]
  }

  declare type Matches = Record<Id, Match>
  declare type MatchState = 'waiting' | 'pinned' | 'running' | 'paused' | 'finished' | 'closed'
  declare interface Match {
    id: Id,
    state: MatchState,
    left: Id,
    right: Id,
    leftScore: number,
    rightScore: number,
    time?: number,
    drawable: boolean
  }

  declare type Groups = Record<Id, Group>

  declare type GroupState = 'running' | 'tie' | 'finished'
  declare interface Tiebreaker {
    definite: Id[],
    options: Id[],
    selection: Id[],
    remaining: number
  }
  declare type GroupWinners = string[] | Tiebreaker
  declare interface Group {
    id: Id,
    name: string,
    state: GroupState,
    members: Id[],
    matches: Id[],
    winners: GroupWinners
  }

  declare type Brackets = Record<Id, Bracket>
  declare interface Bracket {
    id: Id,
    level: number,
    match: Id,
    parent?: Id,
    left?: Id,
    right?: Id
  }

  declare interface GroupMemberInfo {
    id: Id,
    wins: number,
    diff: number
  }

  declare type ColumnInfo = {
    spaceTop: number,
    spaceBottom: number
  } & ({
    type: 'single',
    bracket: App.Bracket
  } | {
    type: 'double',
    top: App.Bracket,
    bottom: App.Bracket,
    spaceMiddle: number
  })
}