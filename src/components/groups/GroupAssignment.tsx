import {useSnapshot} from 'valtio'
import {groups, contestants, state, settings, matches} from '@/state/tournament'
import {AddSVG} from '@/components/svg'
import {EditableList} from '@/components/input'
import {createId} from '@/utils/str'
import {groupsValidSettings} from '@/utils/groups'
import {useState} from 'react'
import {
  deleteMatchesOfContestant,
  createAndAssignMatches,
  deleteMatches
} from '@/utils/groups'

export const addGroup = () => {
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

export const handleDeleteMember = (id: App.Id) => (index: number) => () => {
  const group = groups[id]
  const [member] = group.members.splice(index, 1)
  deleteMatchesOfContestant(member, group)
}

export const handleDeleteGroup = (id: App.Id) => () => {
  deleteMatches(groups[id])
  delete groups[id]
  Object.values(groups).forEach((group, index) => {
    group.name = `Gruppe ${index + 1}`
  })
}

export const assignRandomly = () => {
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

  // reassign matches
  const gs = Object.values(groups)
  const oldMatches = gs.map(({matches}) => matches).flat(1)
  gs.forEach(group => {
    createAndAssignMatches(group)
  })
  const newMatches = gs.map(({matches}) => matches).flat(1)
  newMatches.forEach(id => {
    const index = oldMatches.findIndex(_id => _id === id)
    if (index === -1) return
    oldMatches.splice(index, 1)
  })
  oldMatches.forEach(id => delete matches[id])
}

export const addContestantToGroup = (group: App.Id, contestant: App.Id) => {
  groups[group].members.push(contestant)
  createAndAssignMatches(groups[group])
}

interface Drag {
  hidden: boolean,
  id: App.Id,
  left: number,
  top: number
}

const GroupAssignment = () => {
  const grps = useSnapshot(groups)
  const sttngs = useSnapshot(settings)
  const [drag, setDrag] = useState<Drag>({
    hidden: true,
    id: '',
    left: 0,
    top: 0
  })

  const assignedContestants = new Set(Object.values(grps).map(({members}) => members).flat())
  const unusedContestants = Object.values(contestants).filter(({id}) => !assignedContestants.has(id))

  const startDrag = (id: App.Id) => (event: React.MouseEvent<HTMLButtonElement>) => {
    setDrag({
      hidden: false,
      id,
      top: event.clientY,
      left: event.clientX
    })
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', handleMouseMove)
      setDrag(cur => ({...cur, hidden: true}))
    }, {once: true})
  }
  const handleMouseMove = (event: MouseEvent) => {
    setDrag(cur => ({...cur, top: event.clientY, left: event.clientX}))
  }
  const handleDrop = (id: App.Id) => () => {
    if (drag.hidden)
      return
    addContestantToGroup(id, drag.id)
  }

  const groupsCount = Object.keys(grps).length
  const validSettings = groupsValidSettings(grps, groupsCount, sttngs)

  return <div id="group-assignment" className="contents">
    <div className="p-1"/>
    <button
      className="btn col-span-2 justify-self-center"
      disabled={state.phase !== 'configure' || groupsCount === 0}
      onClick={assignRandomly}
    >Zufällig verteilen</button>
    <div hidden={validSettings.status !== 'invalid'}>
      <div className="p-1"/>
      <div className="card border-none bg-red-600">{validSettings.message ?? ''}</div>
    </div>
    <div className="p-1"/>
    <div className="flex gap-10">
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
      <div
        className="fixed bg-background border text-ellipsis overflow-hidden border-white/30 rounded-md px-4 py-2 text-sm max-w-[30ch]"
        style={{left: drag.left, top: drag.top}}
        hidden={drag.hidden}>
        {drag.hidden || contestants[drag.id].name}
      </div>
    </div>
  </div>
}

export default GroupAssignment