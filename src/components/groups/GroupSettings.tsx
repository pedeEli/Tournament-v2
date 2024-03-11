import {useSnapshot} from 'valtio'
import {settings, groups, state} from '@/state/tournament'
import {Checkbox} from '@/components/input'
import {log2} from '@/utils/math'


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

  return <>
    <div id="group-settings" className="grid grid-cols-[auto_auto] auto-rows-[2.5rem] gap-x-4 gap-y-2 items-center">
      <GroupSettingsValue/>
      <div className={luckyLoserPossible ? 'contents' : 'hidden'}>
        <label htmlFor="lucky-loser" className="justify-self-end">Lucky Loser</label>
        <Checkbox id="lucky-loser" disabled={state.phase !== 'configure'} onInput={e => settings.luckyLoser = e.currentTarget.checked} defaultChecked={settings.luckyLoser}/>
      </div>
    </div>
  </>
}

export default GroupSettings