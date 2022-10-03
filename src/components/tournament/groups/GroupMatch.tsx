import MatchName from '../MatchName'
import {contestants} from '@/state/tournament'
import {PlaySVG, PauseSVG, PinSVG, CheckmarkSVG} from '@/components/svg'
import {useSnapshot} from 'valtio'
import {selectedMatch} from '@/state/matches'

interface GroupMatchProps {
  match: App.Match,
  editable: boolean
}

const stateIcons: Partial<Record<App.MatchState, typeof PlaySVG>> = {
  running: PlaySVG,
  paused: PauseSVG,
  pinned: PinSVG,
  finished: CheckmarkSVG
}

const GroupMatch = ({match, editable}: GroupMatchProps) => {
  const mtch = useSnapshot(match)

  const leftName = contestants[match.left].name
  const rightName = contestants[match.right].name

  const Icon = stateIcons[mtch.state]

  const select = () => {
    if (editable)
      selectedMatch.id = match.id
  }

  return <div className={`contents ${editable ? 'group' : ''}`} onClick={select}>
    <MatchName
      name={leftName}
      side="left"
      won={(a, b) => a > b}
      match={match}
      className="rounded-r-none"
    />
    <MatchName
      name={rightName}
      side="right"
      won={(a, b) => a < b}
      match={match}
      className="rounded-l-none"
    />
    <div>
      {Icon && <Icon/>}
    </div>
  </div>
}

export default GroupMatch