import RunningMatch from './RunningMatch'
import {
  finishedMatches,
  pausedMatches,
  pinnedMatches,
  runningMatches,
  selectedMatch
} from '@/state/matches'
import {useSnapshot, subscribe} from 'valtio'
import {useEffect, useState, useRef} from 'react'
import {CloseSVG} from '@/components/svg'

const Matches = () => {
  const running = useSnapshot(runningMatches)
  const paused = useSnapshot(pausedMatches)
  const pinned = useSnapshot(pinnedMatches)
  const finished = useSnapshot(finishedMatches)
  const [selected, setSelected] = useState<App.Id>()
  const highlightMap = useRef(new Map<App.Id, () => void>())

  useEffect(() => {
    return subscribe(selectedMatch, () => {
      const {id} = selectedMatch
      if (!id)
        return setSelected(id)
      const highlight = highlightMap.current.get(id)
      if (!highlight)
        return setSelected(id)
      highlight()
      setSelected(undefined)
    })
  }, [])

  return <div className="card overflow-auto">
    <h2>Spiele</h2>
    <div className="p-2"/>
    {selected &&<>
      <h3 className="text-lg italic flex items-center gap-2">
        <button onClick={() => selectedMatch.id = undefined} className="btn btn-svg text-base"><CloseSVG/></button>
        Ausgewählt
      </h3>
      <RunningMatch highlight hightlightMap={highlightMap.current} id={selected}/>
    </>}
    
    {!pinned.length || <>
      <h3 className="text-lg italic">Angepinned</h3>
      {pinned.map(id => {
        return <RunningMatch hightlightMap={highlightMap.current} key={id} id={id}/>
      })}
    </>}

    {!running.length || <>
      <h3 className="text-lg italic">Im Gange</h3>
      {running.map(id => {
        return <RunningMatch hightlightMap={highlightMap.current} key={id} id={id}/>
      })}
    </>}
    
    {!paused.length || <>
      <h3 className="text-lg italic">Pausiert</h3>
      {paused.map(id => {
        return <RunningMatch hightlightMap={highlightMap.current} key={id} id={id}/>
      })}
    </>}
    
    {!finished.length || <>
      <h3 className="text-lg italic">Beendet</h3>
      {finished.map(id => {
        return <RunningMatch hightlightMap={highlightMap.current} key={id} id={id}/>
      })}
    </>}
  </div>
}

export default Matches