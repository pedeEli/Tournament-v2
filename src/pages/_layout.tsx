import {Layout} from '@/components/Router'
import Navbar from '@/components/Navbar'
import Popup from '@/components/Popup'
import {useEffect, useState} from 'react'
import {state} from '@/state/tournament'
import {
  managePhaseChangeFromConfigure,
  manageTimeAndState
} from '@/utils/matches'
import {manageGroupState} from '@/utils/groups'
import {
  manageBracketsMatches,
  managePhaseChangeToBrackets,
  propagateBracketsWinners
} from '@/utils/brackets'
import {subscribeKey} from 'valtio/utils'
import {
  handleSaveFile,
  handleLoadFile,
  save,
  load,
  saveUnder,
  IS_SAVED_KEY
} from '@/utils/loadSave'
import {ipcRenderer} from 'electron'
import {useRouter} from '@/components/Router'

const OuterLayout: Layout = ({children}) => {
  const [menu, setMenu] = useState(false)
  const [savePrompt, setSavePrompt] = useState<{action: () => void}>()
  const router = useRouter()

  if (state.page !== router.route.pathname) {
    state.page = router.route.pathname
  }

  const handleLoadFile2 = handleLoadFile(() => setMenu(false))
  const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setMenu(false)

  useEffect(() => {
    if (menu) {
      ipcRenderer.on('savefile', handleSaveFile)
      ipcRenderer.on('loadfile', handleLoadFile2)
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        ipcRenderer.off('savefile', handleSaveFile)
        ipcRenderer.off('loadfile', handleLoadFile2)
        window.removeEventListener('keydown', handleKeyDown)
      }
    }

    let cleanUp1: () => void
    if (state.phase === 'configure') {
      const unsub1 = managePhaseChangeFromConfigure()
      const unsub2 = subscribeKey(state, 'phase', phase => phase !== 'configure' && cleanUp1())
      cleanUp1 = () => {
        unsub1()
        unsub2()
      }
    }

    const cleanUp2 = manageTimeAndState()

    let cleanUp3: () => void
    if (state.phase !== 'brackets' && state.phase !== 'done') {
      const unsub1 = manageGroupState()
      const unsub2 = manageBracketsMatches()
      const unsub3 = managePhaseChangeToBrackets()
      const unsub4 = subscribeKey(state, 'phase', phase => phase === 'brackets' && cleanUp3())
      cleanUp3 = () => {
        unsub1()
        unsub2()
        unsub3()
        unsub4()
      }
    }

    const cleanUp4 = propagateBracketsWinners()

    return () => {
      cleanUp1?.()
      cleanUp2()
      cleanUp3?.()
      cleanUp4()
    }
  }, [menu])

  const handleClose = () => {
    const isSaved = JSON.parse(localStorage.getItem(IS_SAVED_KEY) ?? 'false') as boolean
    if (isSaved)
      return router.goto('/')
    
    setSavePrompt({action: () => {
      router.goto('/')
    }})
  }

  const handleLoad = () => {
    const isSaved = JSON.parse(localStorage.getItem(IS_SAVED_KEY) ?? 'false') as boolean
    if (isSaved)
      return load()
    
    setSavePrompt({action: load})
  }

  const handlePromptSave = async () => {
    if (await save())
      savePrompt?.action()
    setSavePrompt(undefined)
  }
  const handlePromptCancel = () => {
    setSavePrompt(undefined)
  }
  const handlePromptContinue = () => {
    savePrompt?.action()
    setSavePrompt(undefined)
  }

  return <>
    <div className="grid grid-rows-[5rem_1fr] grid-cols-[1fr] h-full">
      <Navbar onMenu={() => {
        setMenu(true)
        if (savePrompt)
          setSavePrompt(undefined)
      }}/>
      <main className="h-full overflow-auto">
        {children}
      </main>
      <Popup/>
    </div>
    {menu && <div onClick={() => setMenu(false)} className="fixed inset-0 flex flex-col justify-center gap-3 items-center bg-black/20">
      <div onClick={e => e.stopPropagation()} className="card bg-background border-none flex flex-col text-lg">
        <div className="text-3xl text-center">Menu</div>
        <div className="p-1"/>
        <button className="btn text-left" onClick={() => setMenu(false)}>Weiter</button>
        <button className="btn text-left" onClick={save}>Speichern</button>
        <button className="btn text-left" onClick={saveUnder}>Speichern unter</button>
        <button className="btn text-left" onClick={handleLoad}>Laden</button>
        <button className="btn text-left" onClick={handleClose}>Beenden</button>
      </div> 
      {savePrompt && <div onClick={e => e.stopPropagation()} className="card bg-red-600 col-start-1 row-start-1 border-none">
        <div className="text-lg text-center">Turnier ist nicht gespeichert</div>
        <div className="p-1"/>
        <div className="flex gap-2">
          <button className="btn btn-raised" onClick={handlePromptSave}>Speichern</button>
          <button className="btn btn-raised" onClick={handlePromptContinue}>Egal</button>
          <button className="btn btn-raised" onClick={handlePromptCancel}>Zurück</button>
        </div>
      </div>}
    </div>}
  </>
}

export default OuterLayout