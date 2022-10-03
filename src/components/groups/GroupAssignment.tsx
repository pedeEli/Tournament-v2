import {useSnapshot} from 'valtio'
import {groups, contestants, state} from '@/state/tournament'
import {AddSVG} from '@/components/svg'
import {EditableList} from '@/components/input'
import {createId} from '@/utils/str'
import {useState} from 'react'
import {
  deleteMatchesOfContestant,
  createAndAssignMatches,
  deleteMatches
} from '@/utils/groups'

const addGroup = () => {
  const ids = new Set(Object.keys(groups))
  const id = createId(ids)
  groups[id] = {
    id,
    name: `Gruppe ${ids.size + 1}`,
    state: 'running',
    matches: [],
    members: [],
    winners: []
  }
}

const handleDeleteMember = (id: App.Id) => (index: number) => () => {
  const group = groups[id]
  const [member] = group.members.splice(index, 1)
  deleteMatchesOfContestant(member, group)
}

const handleDeleteGroup = (id: App.Id) => () => {
  deleteMatches(groups[id])
  delete groups[id]
  Object.values(groups).forEach((group, index) => {
    group.name = `Gruppe ${index + 1}`
  })
}

interface Drag {
  id: App.Id,
  left: number,
  top: number
}

const GroupAssignment = () => {
  const grps = useSnapshot(groups)
  const [drag, setDrag] = useState<Drag>()

  const assignedContestants = new Set(Object.values(grps).map(({members}) => members).flat())
  const unusedContestants = Object.values(contestants).filter(({id}) => !assignedContestants.has(id))

  const startDrag = (id: App.Id) => (event: React.MouseEvent<HTMLButtonElement>) => {
    setDrag({
      id,
      top: event.clientY,
      left: event.clientX
    })
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', handleMouseMove)
      setDrag(undefined)
    }, {once: true})
  }
  const handleMouseMove = (event: MouseEvent) => {
    setDrag(cur => ({...(cur as Drag), top: event.clientY, left: event.clientX}))
  }
  const handleDrop = (id: App.Id) => () => {
    if (!drag)
      return
    const group = groups[id]
    group.members.push(drag.id)
    createAndAssignMatches(group)
  }

  return <div className="flex gap-10">
    <div>
      <h2>Teams</h2>
      <div className="p-2"/>
      <div className="flex flex-col gap-2">
        {unusedContestants.map(({name, id}) => {
          return <button
            key={id}
            className="text-overflow max-w-[20ch] border border-white/30 rounded-md px-4 py-2 text-sm disabled:border-white/20 disabled:text-font/50"
            disabled={state.phase !== 'configure'}
            onMouseDown={startDrag(id)}
            title={name}
          >{name}</button>
        })}
      </div>
    </div>
    <div>
      <h2 className="flex items-center gap-2">
        Gruppen
        <button className="btn btn-svg text-base" disabled={state.phase !== 'configure'} onClick={addGroup}><AddSVG/></button>
      </h2>
      <div className="p-2"/>
      <div className="flex flex-wrap items-start max-w-2xl gap-2">
        {Object.values(grps).map(({members, id, name}) => {
          return <div key={id} onMouseUp={handleDrop(id)}>
            <EditableList
              heading={name}
              itemMapper={(id) => contestants[id].name}
              list={members}
              onItemDelete={handleDeleteMember(id)}
              onDelete={handleDeleteGroup(id)}
              disabled={state.phase !== 'configure'}
            />
          </div>
        })}
      </div>
    </div>
    {drag && <div
        className="fixed bg-background border text-ellipsis overflow-hidden border-white/30 rounded-md px-4 py-2 text-sm max-w-[30ch]"
        style={{left: drag.left, top: drag.top}}
      >{contestants[drag.id].name}</div>}
  </div>
}

export default GroupAssignment