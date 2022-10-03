import {groups, contestants, matches, state, settings} from '@/state/tournament'
import {useState, useEffect} from 'react'
import {getMatchesOf, calcInfo, sortInfos} from '@/utils/groups'
import {subscribeKey} from 'valtio/utils'
import {useSnapshotKey} from '@/utils/valtio'

interface GroupInfoProps {
  id: App.Id,
  onSelect: (id: App.Id) => void
}

const isWinner = (winners: App.GroupWinners, id: App.Id) => {
  if (Array.isArray(winners))
    return winners.includes(id)
  const {definite, selection} = winners
  return definite.includes(id) || selection.includes(id)
}

const isLuckyLoser = (id: App.Id, luckyLoser: App.GroupWinners, phase: App.Phase) => {
  if (!settings.luckyLoser || phase === 'groups')
    return false
  if (Array.isArray(luckyLoser))
    return luckyLoser.includes(id)
  const {definite, selection} = luckyLoser
  return definite.includes(id) || selection.includes(id)
}

const GroupInfo = ({id, onSelect}: GroupInfoProps) => {
  const group = groups[id]
  const [infos, setInfos] = useState<App.GroupMemberInfo[]>(group.members.map(id => {
    const ms = getMatchesOf(group, id)
    return calcInfo(ms, id)
  }))
  const groupState = useSnapshotKey(group, 'state')
  const winners = useSnapshotKey(group, 'winners')
  const luckyLoser = useSnapshotKey(state, 'luckyLoser')
  const phase = useSnapshotKey(state, 'phase')

  useEffect(() => {
    const unsubs = group.matches.map(id => {
      const match = matches[id]
      const callback = () => {
        updateInfo(match.left)
        updateInfo(match.right)
      }
      const unsub1 = subscribeKey(match, 'leftScore', callback)
      const unsub2 = subscribeKey(match, 'rightScore', callback)
      return [unsub1, unsub2]
    }).flat()

    return () => unsubs.forEach(unsub => unsub())
  }, [])

  const updateInfo = (id: App.Id) => {
    const ms = getMatchesOf(group, id)
    const {wins, diff} = calcInfo(ms, id)
    setInfos(cur => {
      const info = cur.find(info => info.id === id)!
      info.wins = wins
      info.diff = diff
      return [...cur]
    })
  }

  infos.sort(sortInfos)

  return <div className={`card ${groupState === 'tie' ? 'border-draw' : ''}`} onClick={() => onSelect(id)}>
    <div className="font-bold">{group.name}</div>
    <div className="grid grid-cols-[1fr_auto_auto] w-full gap-2 ">
        <span className="italic text-left">Teilnehmer</span>
        <span className="italic text-right">Siege</span>
        <span className="italic text-right">Diff</span>
        {infos.map(({id, diff, wins}) => {
          const {name} = contestants[id]
          return <div key={id} className={`contents ${isWinner(winners, id) ? 'text-win' : ''} ${isLuckyLoser(id, luckyLoser, phase) ? 'text-draw' : ''}`}>
            <span className="text-left text-overflow" title={name}>{name}</span>
            <span className="text-right">{wins}</span>
            <span className="text-right">{diff}</span>
          </div>
        })}
    </div>
  </div>
}

export default GroupInfo