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

const GroupSettingsValue = () => {
  if (state.phase === 'configure') {
    return <>
      <label htmlFor="winner-per-group" className="justify-self-end">Gewinner pro Gruppe</label>
      <input type="number" id="winner-per-group" onInput={e => settings.winnerPerGroup = parseInt(e.currentTarget.value)} defaultValue={settings.winnerPerGroup}/>
      <label htmlFor="points-per-win" className="justify-self-end">Punkte für Sieg</label>
      <input type="number" id="points-per-win" onInput={e => settings.pointsPerWin = parseInt(e.currentTarget.value)} defaultValue={settings.pointsPerWin}/>
      <label htmlFor="points-per-draw" className="justify-self-end">Punkte für Unentschieden</label>
      <input type="number" id="points-per-draw" onInput={e => settings.pointsPerDraw = parseInt(e.currentTarget.value)} defaultValue={settings.pointsPerDraw}/>
    </>
  }

  return <>
    <div className="justify-self-end">Gewinner pro Gruppe</div>
    <div>{settings.winnerPerGroup}</div>
    <div className="justify-self-end">Punkte für Sieg</div>
    <div>{settings.pointsPerWin}</div>
    <div className="justify-self-end">Punkte für Unentschieden</div>
    <div>{settings.pointsPerDraw}</div>
  </>
}

const GroupSettings = () => {
  const sttngs = useSnapshot(settings)
  const grps = useSnapshot(groups)

  const groupsCount = Object.keys(grps).length
  const winnersCount = sttngs.winnerPerGroup * groupsCount
  const luckyLoserPossible = 1 << log2(winnersCount) !== winnersCount

  const validSettings = groupsValidSettings(grps, groupsCount, sttngs)

  return <>
    <div id="group-settings" className="grid grid-cols-[auto_auto] auto-rows-[2.5rem] gap-x-4 gap-y-2 items-center">
      <GroupSettingsValue/>
      {luckyLoserPossible && <>
        <label htmlFor="lucky-loser" className="justify-self-end">Lucky Loser</label>
        <Checkbox disabled={state.phase !== 'configure'} onInput={e => settings.luckyLoser = e.currentTarget.checked} defaultChecked={settings.luckyLoser}/>
      </>}
      <button
        className="btn col-span-2 justify-self-center"
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