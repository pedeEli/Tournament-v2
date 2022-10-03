import {useState, useEffect} from 'react'
import {contestants, state} from '@/state/tournament'

interface TiebreakerProps {
  tiebreaker: App.Tiebreaker,
  heading?: string,
  onSubmit: (selection: App.Id[]) => void
}

const Tiebreaker = ({tiebreaker, heading = 'Tiebreaker', onSubmit}: TiebreakerProps) => {
  const [originalSelection, setOriginalSelection] = useState([...tiebreaker.selection])
  const [selection, setSelection] = useState(originalSelection)
  const diff = tiebreaker.remaining - selection.length
  const prompt = `Es ${diff === 1 ? 'muss' : 'müssen'} ${diff === 0 ? 'keine mehr' : `noch ${diff === 1 ? 'einer' : diff}`} ausgewählt werden.`

  useEffect(() => {
    const originalSelection = [...tiebreaker.selection]
    setOriginalSelection(originalSelection)
  }, [tiebreaker.selection])

  useEffect(() => {
    setSelection(originalSelection)
  }, [originalSelection])

  const toggle = (id: App.Id) => () => {
    const index = selection.indexOf(id)
    if (index === -1)
      return setSelection([...selection, id])
    setSelection([...selection.slice(0, index), ...selection.slice(index + 1)])
  }

  const handleSubmit = () => {
    onSubmit(selection)
    setOriginalSelection([...selection])
  }

  return <div className="card max-w-xl">
    <h3 className="flex items-center gap-3">
      <span className="text-xl">{heading}</span>
      <button onClick={handleSubmit} className="btn" disabled={diff !== 0 || (originalSelection.length !== 0 && originalSelection.every(mid => selection.includes(mid)))}>
        {originalSelection.length === 0 ? 'Bestätigen' : 'Ändern'}
      </button>
    </h3>
    <div className="p-1"/>
    <div>{prompt}</div>
    <div className="p-2"/>
    <div className="flex flex-wrap gap-1">
      {tiebreaker.options.map(id => {
        const {name} = contestants[id]
        const active = selection.includes(id)
        return <button key={id} disabled={diff === 0 && !active || state.phase === 'brackets' || state.phase === 'done'} className={`btn text-overflow max-w-[20ch] ${active ? 'btn-raised' : ''}`} title={name} onClick={toggle(id)}>{name}</button>
      })}
    </div>
  </div>
}

export default Tiebreaker