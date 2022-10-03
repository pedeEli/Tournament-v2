import {useState, useEffect} from 'react'
import {groups, matches, settings, state} from '@/state/tournament'
import {GroupInfo, GroupMatch} from '@/components/tournament/groups'
import {subscribeKey} from 'valtio/utils'
import Tiebreaker from '@/components/tournament/Tiebreaker'
import LuckyLoser from '@/components/tournament/LuckyLoser'
import {useSnapshotKey} from '@/utils/valtio'
import {groupsValidSettings} from '@/utils/groups'

const TournamentGroups = () => {
  const [selected, setSelected] = useState<App.Id>()
  const [group, setGroup] = useState<App.Group>()
  const [tiebreaker, setTiebreaker] = useState<App.Tiebreaker>()
  const phase = useSnapshotKey(state, 'phase')

  useEffect(() => {
    if (!selected)
      return

    const group = groups[selected]
    setGroup(group)
    if (Array.isArray(group.winners))
      setTiebreaker(undefined)
    else
      setTiebreaker(group.winners)
    
    return subscribeKey(group, 'winners', winners => {
      if (Array.isArray(winners))
        return setTiebreaker(undefined)  
      setTiebreaker(winners)
    })
  }, [selected])

  const handleSubmit = (selection: App.Id[]) => {
    if (group!.state === 'finished')
      group!.state = 'tie'
    setTimeout(() => {
      group!.state = 'finished'
      const tiebreaker = group!.winners as App.Tiebreaker
      tiebreaker.selection = selection
    })
  }

  if (!settings.groups)
    return <div className="w-full h-full grid place-items-center text-5xl">
      Gruppen sind deaktiviert
    </div>
  
  const validSettings = groupsValidSettings(groups, Object.keys(groups).length, settings)
  if (validSettings.status === 'invalid')
    return <div className="w-full h-full grid place-items-center text-5xl">
      {validSettings.message}
    </div>

  return <div className="grid grid-cols-[35ch_1fr] gap-4 h-full">
    <div className="overflow-auto flex flex-col gap-2 pr-2">
      {Object.keys(groups).map(id => {
        return <GroupInfo id={id} key={id} onSelect={setSelected}/>
      })}
    </div>
    <div className="overflow-auto pr-1">
      {settings.luckyLoser && <>
        <LuckyLoser/>
        <div className="p-2"/>
      </>}
      {group && <>
        <h2>{group.name}</h2>
        <div className="p-2"/>
        {tiebreaker && <>
          <Tiebreaker onSubmit={handleSubmit} tiebreaker={tiebreaker}/>
          <div className="p-2"/>
        </>}
        <div className="grid auto-rows-[4em] grid-cols-[1fr_1fr_2rem] min-w-[40ch] max-w-3xl items-center">
          {group.matches.map(id => {
            const match = matches[id]
            return <GroupMatch
              key={id}
              match={match}
              editable={phase !== 'brackets' && phase !== 'done'}
            />
          })}
        </div>
      </>}
    </div>
  </div>
}

export default TournamentGroups