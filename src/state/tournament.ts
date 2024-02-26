import {proxy, subscribe, snapshot} from 'valtio'
import {IS_SAVED_KEY} from '@/utils/loadSave'
import {version} from '@/../package.json' assert {type: 'json'}

export const createEmptyTournament = (): App.Tournament => {
  return {
    version,
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
      name: 'Turnier',
      luckyLoser: true,
      groups: true,
      winnerPerGroup: 2,
      defaultTime: 15 * 60,
      pointsPerWin: 3,
      pointsPerDraw: 1
    },
    contestants: {},
    matches: {},
    groups: {},
    brackets: {}
  }
}

const TOURNAMENT_KEY = 'tournament'

const loadTournament = (): App.Tournament => {
  const str = localStorage.getItem(TOURNAMENT_KEY)
  const tournament = str ? JSON.parse(str) as App.Tournament : createEmptyTournament()
  return proxy(tournament)
}


const tournament = loadTournament()

subscribe(tournament, () => {
  const t = snapshot(tournament)
  const str = JSON.stringify(t)
  localStorage.setItem(TOURNAMENT_KEY, str)
  localStorage.setItem(IS_SAVED_KEY, 'false')
})


export default tournament
const {contestants, brackets, groups, matches, settings, state} = tournament
export {contestants, brackets, groups, matches, settings, state}