import {MinusSVG} from '@/components/svg'
import {EditableText} from '@/components/input'
import {state} from '@/state/tournament'

interface PersonsListProps {
  persons: string[],
  loadName: (id: App.Id) => () => string,
  saveName: (id: App.Id) => (value: string) => boolean,
  deleteName: (id: App.Id) => () => void
}

const PersonsList = ({persons, deleteName, loadName, saveName}: PersonsListProps) => {
  if (!persons.length)
    return <></>

  return <div className="flex flex-col">
    <h2>Personen</h2>
    <div className="p-1"/>
    {persons.map(id => {
      return <div key={id} className="flex items-center gap-1">
        <button className="btn btn-svg" onClick={deleteName(id)} disabled={state.phase !== 'configure'}><MinusSVG/></button>
        <EditableText disabled={state.phase === 'done'} className="text-overflow max-w-[20ch]" load={loadName(id)} save={saveName(id)}/>
      </div>
    })}
  </div>
}

export default PersonsList