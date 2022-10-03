import {EditableList} from '@/components/input'
import {state, contestants} from '@/state/tournament'
import {useSnapshot} from 'valtio'
import {capitalizeWords} from '@/utils/str'
import popupQueue from '@/state/popup'

interface TeamsListProps {
  teams: string[],
  loadName: (id: App.Id) => () => string,
  saveName: (id: App.Id) => (value: string) => boolean,
  deleteName: (id: App.Id) => () => void
}

const handleMemberAdd = (id: App.Id) => (item: string) => {
  if (!item)
    return false
  item = capitalizeWords(item)
  const {members} = contestants[id] as App.Team
  if (members.find(i => i === item)) {
    popupQueue.push({message: 'Exisitiert bereits', error: true})
    return false
  }
  members.push(item)
  return true
}

const handleMemberRename = (id: App.Id) => (index: number) => (item: string) => {
  if (!item) {
    handleMemberDelete(id)(index)()
    return false
  }
  item = capitalizeWords(item)
  const {members} = contestants[id] as App.Team
  if (item === members[index])
    return false
  if (members.find(i => i === item)) {
    popupQueue.push({message: 'Existiert bereits', error: true})
    return false
  }
  members[index] = item
  return true
}

const handleMemberDelete = (id: App.Id) => (index: number) => () => {
  const {members} = contestants[id] as App.Team
  members.splice(index, 1)
}

const TeamsList = ({teams, deleteName, loadName, saveName}: TeamsListProps) => {
  const conts = useSnapshot(contestants)

  if (!teams.length)
    return <></>

  return <div className="flex flex-col">
    <h2>Teams</h2>
    <div className="p-1"/>
    <div className="flex flex-wrap max-w-2xl gap-2 items-start">
      {teams.map(id => {
        const {members} = conts[id] as App.Team
        return <EditableList
          key={id}
          loadHeading={loadName(id)}
          saveHeading={saveName(id)}
          onAdd={handleMemberAdd(id)}
          onDelete={deleteName(id)}
          disableDelete={state.phase !== 'configure'}
          onRename={handleMemberRename(id)}
          list={members}
          onItemDelete={handleMemberDelete(id)}
          disableItemDelete={members.length <= 2}
          disabled={state.phase === 'done'}
        />
      })}
    </div>
  </div>
}

export default TeamsList