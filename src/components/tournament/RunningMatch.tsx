import {matches, contestants, settings} from '@/state/tournament'
import {useSnapshot} from 'valtio'
import {EditableText} from '@/components/input'
import {useState, useRef, useEffect} from 'react'
import {CloseSVG, PinSVG, PauseSVG, PlaySVG} from '@/components/svg'
import {selectedMatch} from '@/state/matches'
import popupQueue from '@/state/popup'

interface RunningMatchProps {
  id: App.Id,
  hightlightMap: Map<App.Id, () => void>,
  highlight?: boolean
}

const selectAll = (event: React.FormEvent<HTMLInputElement>) => {
  event.currentTarget.select()
}

const RunningMatch = ({id, hightlightMap, highlight: _hightlight = false}: RunningMatchProps) => {
  const match = matches[id]
  const mtch = useSnapshot(match)
  const [editing, setEditing] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const highlight = () => {
    const div = ref.current!
    div.classList.remove('running-match-highlight')
    div.getBoundingClientRect()
    div.scrollIntoView()
    div.classList.add('running-match-highlight')
  }

  useEffect(() => {
    hightlightMap.set(id, highlight)
    if (editing)
      setEditing(false)
    if (_hightlight)
      highlight()
    return () => {
      hightlightMap.delete(id)
    }
  }, [id])
  
  const leftName = contestants[match.left].name
  const rightName = contestants[match.right].name
  const {state} = mtch
  const time = mtch.time ?? settings.defaultTime

  const hours = Math.floor(time / 3600)
  const minutes = Math.floor(time / 60) - hours * 60
  const seconds = time - hours * 3600 - minutes * 60

  const saveHours = (value: string) => {
    const numeric = parseInt(value)
    const clamped = clamp(numeric, 0, 59)
    settings.defaultTime = match.time = clamped * 3600 + minutes * 60 + seconds
    return true
  }
  const saveMinutes = (value: string) => {
    const numeric = parseInt(value)
    const clamped = clamp(numeric, 0, 59)
    settings.defaultTime = match.time = hours * 3600 + clamped * 60 + seconds
    return true
  }
  const saveSeconds = (value: string) => {
    const numeric = parseInt(value)
    const clamped = clamp(numeric, 0, 59)
    settings.defaultTime = match.time = hours * 3600 + minutes * 60 + clamped
    return true
  }
  const clamp = (value: number, min: number, max: number) => {
    if (value < min) return min
    if (value > max) return max
    return value
  }
  const addZeros = (number: number) => {
    if (number >= 0 && number <= 9) return `0${number}`
    return '' + number
  }

  let leftScore = editing ? match.leftScore.toString() : ''
  let rightScore = editing ? match.rightScore.toString() : ''

  const startMatch = () => {
    if (time === 0)
      return popupQueue.push({message: 'Dauer muss größer als 0 sein', error: true})
    match.state = 'running'
    match.time = time
    selectedMatch.id = undefined
  }

  const closeMatch = () => {
    const ls = parseInt(leftScore) || 0
    const rs = parseInt(rightScore) || 0
    if (!match.drawable && ls === rs) {
      popupQueue.push({
        message: 'Es muss einenen eindeutigen Gewinner geben',
        error: true
      })
      return
    }

    match.state = 'closed'
    match.leftScore = ls
    match.rightScore = rs

    if (editing)
      setEditing(false)
  }
  
  return <div ref={ref} className={`${state === 'finished' && time === 0 ? 'text-red-500' : ''} grid grid-cols-[8ch_11ch_8ch] items-center justify-center text-2xl gap-1`}>
    <div className="text-overflow" title={leftName}>{leftName}</div>
    <div className="flex items-center justify-center gap-1">
      {state === 'waiting' || state === 'pinned'
        ? <>
          <EditableText load={() => addZeros(hours)} save={saveHours} style={{width: '1.6em', padding: '.2em'}}/> :
          <EditableText load={() => addZeros(minutes)} save={saveMinutes} style={{width: '1.6em', padding: '.2em'}}/> :
          <EditableText load={() => addZeros(seconds)} save={saveSeconds} style={{width: '1.6em', padding: '.2em'}}/>
        </>
        : <>{addZeros(hours)} : {addZeros(minutes)} : {addZeros(seconds)}</>}
    </div>
    <div className="text-overflow text-right" title={rightName}>{rightName}</div>
    {state === 'waiting' || state === 'pinned'
      ? <span className="col-span-3 flex items-center justify-center">
        {state === 'pinned'
          ? <button onClick={() => match.state = 'waiting'} className="btn btn-svg text-base"><CloseSVG/></button>
          : <button onClick={() => {
            match.state = 'pinned'
            selectedMatch.id = undefined
          }} className="btn btn-svg text-base"><PinSVG/></button>}
        <button onClick={startMatch} className="btn text-base">Start</button>
      </span>
    : state === 'running' || state === 'paused'
      ? <span className="col-start-2 flex items-center">
        {state === 'running'
          ? <button onClick={() => match.state = 'paused'} className="btn btn-svg text-base"><PauseSVG/></button>
          : <button onClick={() => match.state = 'running'} className="btn btn-svg text-base"><PlaySVG/></button>}
        <button onClick={() => match.state = 'finished'} className="btn text-base">Beenden</button>
      </span>
    : state === 'finished' || editing
      ? <>
        <input onInput={e => leftScore = e.currentTarget.value} className="text-base" type="text" defaultValue={match.leftScore} onFocus={selectAll}/>
        <button onClick={closeMatch} className="btn text-base">Speichern</button>
        <input onInput={e => rightScore = e.currentTarget.value} type="text" className="text-right text-base" defaultValue={match.rightScore} onFocus={selectAll}/>
      </>
      : <>
        <div className="text-base">{leftScore}</div>
        <button onClick={() => setEditing(true)} className="btn text-base">Bearbeiten</button>
        <div className="text-right text-base">{rightScore}</div>
      </>}
  </div>
}

export default RunningMatch