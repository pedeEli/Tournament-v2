import {state} from '@/state/tournament'
import {useRouter} from '@/components/Router'
import {clearTournament, load, handleLoadFile} from '@/utils/loadSave'
import {useEffect} from 'react'
import {ipcRenderer} from 'electron'

const Index = () => {
  const router = useRouter()
  
  const handleLoadFile2 = handleLoadFile(() => {
    router.goto(state.page)
  })

  useEffect(() => {
    ipcRenderer.on('loadfile', handleLoadFile2)
    return () => {ipcRenderer.off('loadfile', handleLoadFile2)}
  })

  if (process.env['OPENED_FILE'] !== '.') {
    handleLoadFile2(undefined, process.env['OPENED_FILE'])
  }

  return (
    <main className="h-full flex flex-col items-center justify-center text-6xl">
      <h1 className="text-9xl">Turnier</h1>
      <div className="p-4"/>
      <div className="w-fit flex flex-col">
        {state.page !== '/' && <>
          <a href={`${state.page}`} className="btn btn-raised w-full">Weiter</a>
          <div className="p-2"/>
        </>}
        <a href="/contestants" className="btn btn-raised w-full" onClick={clearTournament}>Neu</a>
        <div className="p-2"/>
        <button className="btn btn-raised w-full" onClick={load}>Laden</button>
        <div className="p-2"/>
        <a href="/tutorial" onClick={clearTournament} className="btn btn-raised w-full">Tutorial</a>
      </div>
    </main>
  )
}

export default Index