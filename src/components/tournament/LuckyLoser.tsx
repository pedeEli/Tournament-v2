import {state, groups} from '@/state/tournament'
import {useSnapshot} from 'valtio'
import Tiebreaker from './Tiebreaker'
import {useSnapshotKey} from '@/utils/valtio'

const LuckyLoser = () => {
  const luckyLoser = useSnapshotKey(state, 'luckyLoser')
  const grps = useSnapshot(groups)

  const handleSubmit = (selection: App.Id[]) => {
    if (Array.isArray(state.luckyLoser))
      return
    state.luckyLoser.selection = selection
    if (state.phase === 'groupsFinished')
      state.phase = 'groups'
    state.phase = 'groupsFinished'
  }

  const show = Object.values(grps).reduce<boolean>((acc, group) => acc && group.state === 'finished', true)

  if (!show || Array.isArray(luckyLoser))
    return <></>

  return <Tiebreaker tiebreaker={luckyLoser as App.Tiebreaker} heading="Lucky Loser" onSubmit={handleSubmit}/>
}

export default LuckyLoser