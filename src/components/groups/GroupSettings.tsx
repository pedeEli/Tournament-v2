import {useSnapshot} from 'valtio'
import {settings, groups, state, contestants} from '@/state/tournament'
import {Checkbox} from '@/components/input'
import {reassignMatchesAfterRandomize, groupsValidSettings} from '@/utils/groups'
import {log2} from '@/utils/math'

const assignRandomly = () => {
  const groupsIds = Object.keys(groups)
  if (!groupsIds.length) return
  groupsIds.forEach(id => groups[id].members.splice(0))

  let index = 0
  const contestantsIds = Object.keys(contestants)
  const unassigned = [...contestantsIds]
  for (let i = 0; i < contestantsIds.length; i++) {
      const randomIndex = Math.floor(Math.random() * unassigned.length)
      const contestant = unassigned[randomIndex]
      const group = groups[groupsIds[index]]
      group.members.push(contestant)
      unassigned.splice(randomIndex, 1)
      index = (index + 1) % groupsIds.length
  }
  reassignMatchesAfterRandomize()
}

const GroupSettings = () => {
  const sttngs = useSnapshot(settings)
  const grps = useSnapshot(groups)

  const groupsCount = Object.keys(grps).length
  const winnersCount = sttngs.winnerPerGroup * groupsCount
  const luckyLoserPossible = 1 << log2(winnersCount) !== winnersCount

  const validSettings = groupsValidSettings(grps, groupsCount, sttngs)

  return <>
    <div className="grid grid-cols-[auto_auto] grid-rows-[2.5rem_2.5rem_2.5rem] gap-x-4 gap-y-2 items-center">
      <label htmlFor="winner-per-group" className="justify-self-end">Gewinner pro Gruppe</label>
      {state.phase === 'configure'
        ? <input type="number" id="winner-per-group" onInput={e => settings.winnerPerGroup = parseInt(e.currentTarget.value)} defaultValue={settings.winnerPerGroup}/>
        : <div>{settings.winnerPerGroup}</div>}
      {luckyLoserPossible && <>
        <label htmlFor="lucky-loser" className="justify-self-end">Lucky Loser</label>
        <Checkbox disabled={state.phase !== 'configure'} onInput={e => settings.luckyLoser = e.currentTarget.checked} defaultChecked={settings.luckyLoser}/>
      </>}
      <button
        className="btn col-span-2 row-start-3 justify-self-center"
        disabled={state.phase !== 'configure' || groupsCount === 0}
        onClick={assignRandomly}
      >Zufällig verteilen</button>
    </div>
    {validSettings.status === 'invalid' && <>
      <div className="p-1"/>
      <div className="card border-none bg-red-600">{validSettings.message}</div>
      <div className="p-2"/>
    </>}
  </>
}

export default GroupSettings