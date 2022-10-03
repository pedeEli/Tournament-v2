import {state, brackets, settings} from '@/state/tournament'
import {generateColumns} from '@/utils/brackets'
import {BracketRow} from '@/components/tournament/brackets'
import {useSnapshotKey} from '@/utils/valtio'
import {useSnapshot} from 'valtio'

const TournamentBrackets = () => {
  const phase = useSnapshotKey(state, 'phase')
  const brckts = useSnapshot(brackets)

  if ((phase === 'configure' || phase === 'groups') && settings.groups)
    return <div className="w-full h-full grid place-items-center text-5xl">
      Gruppen Phase muss zuerst beendet werden
    </div>

  const columns = generateColumns(brckts)

  return <div style={{'--cell': '1.3rem'}} className="flex gap-[1rem] items-start">
    {columns.map((brackets, index) => {
      return <BracketRow key={index} column={index} columnInfos={brackets}/>
    })}
  </div>
}

export default TournamentBrackets