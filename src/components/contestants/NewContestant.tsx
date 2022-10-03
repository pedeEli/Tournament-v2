import {AddSVG} from '@/components/svg'
import {state, contestants, settings} from '@/state/tournament'
import {useSnapshot} from 'valtio'
import {EditableList} from '@/components/input'
import popupQueue from '@/state/popup'
import {capitalizeWords, createId} from '@/utils/str'
import {createNoGroupsBrackets} from '@/utils/brackets'
import {useRef, useEffect} from 'react'
const {addingContestant} = state

const createContestant = (id: string): App.Contestant => {
  if (addingContestant.addingType === 'team')
    return {
        id,
        type: 'team',
        name: capitalizeWords(addingContestant.teamName.trim()),
        members: [...addingContestant.members]
      }
  return {
      id,
      type: 'person',
      name: capitalizeWords(addingContestant.personName.trim())
    }
}

const addContestant = () => {
  if (state.phase !== 'configure')
    return

  const id = createId(new Set(Object.keys(contestants)))
  const contestant = createContestant(id)

  if (contestant.name === '')
    return popupQueue.push({message: 'Name benötigt', error: true})
  if (Object.values(contestants).find(({name}) => name === contestant.name))
    return popupQueue.push({message: `${contestant.name} existiert bereits`, error: true})
  if (contestant.type === 'team' && contestant.members.length < 2)
    return popupQueue.push({message: 'Es müssen mindestens zwei Teammitglieder sein', error: true})

  contestants[id] = contestant
  if (!settings.groups)
    createNoGroupsBrackets()

  addingContestant.teamName = ''
  addingContestant.personName = ''
  addingContestant.members = []
}


const handleMemberAdd = (item: string) => {
  if (!item)
    return false
  item = capitalizeWords(item)
  const {members} = addingContestant
  if (members.find(i => i === item)) {
    popupQueue.push({message: 'Exisitiert bereits', error: true})
    return false
  }
  members.push(item)
  return true
}

const handleMemberDelete = (index: number) => () => {
  addingContestant.members.splice(index, 1)
}

const handleMemberRename = (index: number) => (item: string) => {
  if (!item) {
    handleMemberDelete(index)
    return false
  }
  item = capitalizeWords(item)
  const {members} = addingContestant
  if (item === members[index])
    return false
  if (members.find(i => i === item)) {
    popupQueue.push({message: 'Existiert bereits', error: true})
    return false
  }
  members[index] = item
  return true
}

const NewContestant = () => {
  const ac = useSnapshot(addingContestant)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ac.addingType === 'person') {
      inputRef.current!.value = ac.personName
      return
    }
    inputRef.current!.value = ac.teamName
  }, [ac.addingType])

  const handleInput = (event: React.MouseEvent<HTMLInputElement>) => {
    if (addingContestant.addingType === 'person') {
      addingContestant.personName = event.currentTarget.value
      return
    }
    addingContestant.teamName = event.currentTarget.value
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter')
      return
    addContestant()
    inputRef.current!.value = ''
  }

  return <>
    <h2>Teams oder einzelne Personen hinzufügen</h2>
    <div className="p-1"/>
    <div className="flex items-center gap-2">
      <button className={`btn ${ac.addingType === 'team' ? 'btn-raised' : ''}`} onClick={() => addingContestant.addingType = 'team'}>Team</button>
      <button className={`btn ${ac.addingType === 'person' ? 'btn-raised' : ''}`} onClick={() => addingContestant.addingType = 'person'}>Person</button>
      <button className="btn btn-svg" disabled={state.phase !== 'configure'} onClick={addContestant}><AddSVG/></button>
    </div>
    <div className="p-1"/>
    <div className="flex gap-2 items-center">
      <label htmlFor="name">Name</label>
      <input
        onKeyDown={handleKeyDown}
        type="text"
        id="name"
        ref={inputRef}
        onInput={handleInput}
      />
    </div>
    <div className="p-1"/>
    {ac.addingType === 'team' &&
      <div>
        <EditableList
          disabled={state.phase !== 'configure'}
          heading="Team Mitglieder"
          onAdd={handleMemberAdd}
          onItemDelete={handleMemberDelete}
          list={ac.members}
          onRename={handleMemberRename}
        />
      </div>}
  </>
}

export default NewContestant