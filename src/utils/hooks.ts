import {useRef, useEffect} from 'react'

export const useDoubleClick = <Ref extends HTMLElement = HTMLElement>(callback: (event: MouseEvent) => void) => {
  const ref = useRef<Ref>(null)
  
  let clicks = 0
  let timeout: NodeJS.Timeout

  const handleClick = (event: MouseEvent) => {
    if (clicks === 1) {
      clicks = 0
      clearTimeout(timeout)
      callback(event)
      return
    }
    clicks++
    timeout = setTimeout(() => {
      clicks = 0
    }, 1000)
  }


  useEffect(() => {
    const element = ref.current
    if (!element)
      return

    element.addEventListener('click', handleClick)
    return () => element.removeEventListener('click', handleClick)
  }, [ref.current])

  return ref
}


export const useClickOutside = <Ref extends HTMLElement = HTMLElement>(callback: (event: MouseEvent) => void, outside: HTMLElement = document.documentElement) => {
  const ref = useRef<Ref>(null)

  const outsideClickHandler = (event: MouseEvent) => {
    if (ref.current)
      callback(event)
  }

  useEffect(() => {
    const o = outside
    o.addEventListener('click', outsideClickHandler)
    return () => o.removeEventListener('click', outsideClickHandler)
  }, [outside])

  const insideClickHandler = (event: MouseEvent) => {
    event.stopPropagation()
  }

  useEffect(() => {
    const element = ref.current
    if (!element)
      return
    
    element.addEventListener('click', insideClickHandler)
    return () => element.removeEventListener('click', insideClickHandler)
  })

  return ref
}