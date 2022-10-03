import {useSnapshot, subscribe, snapshot} from 'valtio'
import popupQueue from '@/state/popup'
import {useState, useEffect, useRef} from 'react'



const Popup = () => {
  const [message, setMessage] = useState<Popup.Message>()
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined
    const unsub = subscribe(popupQueue, () => {
      const queue = snapshot(popupQueue)
      const message = queue[0]
      if (timeout !== undefined || !message)
        return
      setShow(true)
      setMessage(message)

      timeout = setTimeout(() => {
        setShow(false)
        timeout = undefined
      }, 2000)
    })
    return () => {
      unsub()
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    if (!message)
      return
    const div = ref.current!
    div.getBoundingClientRect()
    div.style.transform = 'translateY(0%)'
  }, [message])

  useEffect(() => {
    if (!message || show)
      return
    const div = ref.current!
    div.style.transform = 'translateY(110%)'
  }, [show])

  const handleTransitionEnd = () => {
    if (show)
      return
    setMessage(undefined)
    setTimeout(() => popupQueue.splice(0, 1))
  }

  if (!message)
    return <></>

  return <div ref={ref} onTransitionEnd={handleTransitionEnd} className="fixed pb-3 bottom-0 w-full flex justify-center transition-transform translate-y-[110%]">
    <div className={`${message.error ? 'bg-red-600' : 'bg-lime-700'} rounded-md px-4 py-2 text-lg`}>{message.message}</div>
  </div>
}


export default Popup

