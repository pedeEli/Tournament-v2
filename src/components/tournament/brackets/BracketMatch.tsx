import {contestants, matches, brackets, state} from '@/state/tournament'
import {useSnapshot} from 'valtio'
import {subscribeKey} from 'valtio/utils'
import {useEffect, useState} from 'react'
import {selectedMatch} from '@/state/matches'
import MatchName from '../MatchName'
import {useSnapshotKey} from '@/utils/valtio'

type BracketMatchProps = {
  bracket: App.Bracket
} & ({
  topStyle?: undefined,
  bottomStyle?: undefined
} | {
  topStyle: React.CSSProperties,
  bottomStyle: React.CSSProperties
})

const initialEditable = (parent?: App.Id) => {
  if (!parent)
    return true
  const {state} = matches[brackets[parent].match]
  return state === 'waiting' || state === 'pinned'
}

const BracketMatch = ({bracket, topStyle, bottomStyle}: BracketMatchProps) => {
  const match = matches[bracket.match]
  const mtch = useSnapshot(match)
  const phase = useSnapshotKey(state, 'phase')
  const [editable, setEditable] = useState(initialEditable(bracket.parent))

  useEffect(() => {
    if (!bracket.parent)
      return
    
    const match = matches[brackets[bracket.parent].match]
    return subscribeKey(match, 'state', state => {
      setEditable(state === 'waiting' || state === 'pinned')
    })
  }, [])

  const leftName = contestants[mtch.left]?.name ?? ''
  const rightName = contestants[mtch.right]?.name ?? ''
  const selectable = leftName && rightName && editable && phase !== 'done'

  const select = () => {
    if (selectable)
      selectedMatch.id = bracket.match
  }

  return <div onClick={select} className={`contents ${selectable ? 'group' : ''}`}>
    <MatchName
      name={leftName}
      side="left"
      won={(a, b) => a > b}
      match={match}
      className="row-span-2 col-start-1 rounded-b-none"
      style={topStyle}
    />
    <MatchName
      name={rightName}
      side="right"
      orientation="left"
      won={(a, b) => a < b}
      match={match}
      className="row-span-2 col-start-1 rounded-t-none"
      style={bottomStyle}
    />
  </div>
}

export default BracketMatch