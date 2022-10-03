import {useSnapshot} from 'valtio'
import {contestants, settings} from '@/state/tournament'
import {NewContestant, PersonsList, TeamsList} from '@/components/contestants'
import {capitalizeWords} from '@/utils/str'
import popupQueue from '@/state/popup'
import {deleteFromGroups} from '@/utils/groups'
import {createNoGroupsBrackets} from '@/utils/brackets'

const saveName = (id: App.Id) => (value: string) => {
  if (!value)
    return false
  value = capitalizeWords(value)
  if (value === contestants[id].name)
    return false
  if (Object.values(contestants).find(({name}) => name === value)) {
    popupQueue.push({message: 'Exisitiert bereits', error: true})
    return false
  }
  contestants[id].name = value
  return true
}

const loadName = (id: App.Id) => () => {
  return contestants[id].name
}

const deleteName = (id: App.Id) => () => {
  delete contestants[id]
  deleteFromGroups(id)
  if (!settings.groups)
    createNoGroupsBrackets()
}

const Contestants = () => {
  const conts = useSnapshot(contestants)

  const {persons, teams} = Object.values(conts).reduce<{persons: string[], teams: string[]}>((acc, cur) => {
    acc[`${cur.type}s`].push(cur.id)
    return acc
  }, {persons: [], teams: []})

  return <div className="flex flex-col items-center">
    <div className="p-2"/>
    <h1>Teams</h1>
    <div className="p-2"/>
    <NewContestant/>
    <div className="p-2"/>
    <div className="flex gap-4">
      <PersonsList persons={persons} saveName={saveName} loadName={loadName} deleteName={deleteName}/>
      <TeamsList teams={teams} saveName={saveName} loadName={loadName} deleteName={deleteName}/>
    </div>
  </div>
}

export default Contestants