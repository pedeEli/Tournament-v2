import {Layout} from '@/components/Router'
import Matches from '@/components/tournament/Matches'
import {selectedMatch} from '@/state/matches'
import {state} from '@/state/tournament'
import {useSnapshotKey} from '@/utils/valtio'
import {useEffect, useState} from 'react'
import {subscribeKey} from 'valtio/utils'
import {findFinale} from '@/utils/brackets'
import Winner from '@/components/tournament/Winner'

const InnerLayout: Layout = ({children}) => {
  selectedMatch.id = undefined
  const page = useSnapshotKey(state, 'page')
  const phase = useSnapshotKey(state, 'phase')
  const [terminable, setTerminable] = useState(state.phase === 'brackets' ? findFinale().state === 'closed' : false)
  const [showWinner, setShowWinner] = useState(false)

  useEffect(() => {
    if (phase !== 'brackets')
      return

    const match = findFinale()
    return subscribeKey(match, 'state', state => state === 'closed' && setTerminable(true))
  }, [phase])

  const terminate = () => {
    if (state.phase !== 'done')
      state.phase = 'done'
    setShowWinner(true)
  }

  return <>
    <div className="grid grid-rows-[auto_auto_1fr] grid-cols-[1fr_auto] h-full p-4 gap-x-3">
      <h1 className="mb-4 col-span-2">Turnier</h1>
      <div className="flex gap-2 mb-2  col-span-2">
        <a href="#/tournament/groups" className={`btn ${page.endsWith('groups') ? 'btn-raised' : ''}`}>Gruppen Phase</a>
        <a href="#/tournament/brackets" className={`btn ${page.endsWith('brackets') ? 'btn-raised' : ''}`}>K.o Phase</a>
        <button onClick={terminate} disabled={!terminable && phase !== 'done'} className="btn">
          {phase === 'done' ? 'Gewinner anzeigen' : 'Turnier beenden'}
        </button>
      </div>
      <div className="card overflow-hidden pr-3">
        <div className="overflow-auto h-full">
          {children}
        </div>
      </div>
      <Matches/>
    </div>
    {showWinner && <Winner onClose={() => setShowWinner(false)}/>}
  </>
}

export default InnerLayout