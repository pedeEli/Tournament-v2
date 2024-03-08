import {useRouter, Route} from '@/components/Router'
import {useEffect, useState, useMemo} from 'react'
import {routes} from '@/init/App'


type Step = {
  route: string,
  highlight?: string[],
  text: string,
  padding?: number,
  position?: 'up' | 'left' | 'down' | 'right'
}

const steps: Step[] = [
  {
    route: '/contestants',
    text: 'Wilkommen im Tutorial. Hier werden wir alles durch gehen was du über dies App wissen musst'
  },
  {
    route: '/contestants',
    highlight: ['settings-name'],
    text: 'Doppel click um den Namen zu ändern'
  },
  {
    route: '/contestants',
    highlight: ['select-team', 'select-person'],
    text: 'Hier kannst du auswählen ob du ein ganzes team oder nur eine enzelne person hinzufüegen möchtest'
  }
]



const Tutorial = () => {
  const router = useRouter()

  const index = parseInt(router.route.searchParams.get('step') ?? '0')
  const step = steps[isNaN(index) ? 0 : index]

  const route = routes.find(({route}) => route.test(step.route))
  if (route == undefined) {
    return <div>Unbekannte Route: {step.route}</div>
  }

  return <div>
    <Route {...route}/>
    <Overlay step={step} index={index}/>
  </div>
}

export default Tutorial


type OverlayProps = {
  step: Step,
  index: number
}

const Overlay = ({step, index}: OverlayProps) => {
  const [box, setBox] = useState<DOMRect | null>(null)
  const padding = step.padding ?? 10

  useEffect(() => {
    if (step.highlight == undefined || step.highlight.length === 0) {
      setBox(null)
      return
    }

    const elements: HTMLElement[] = []
    const observer = new ResizeObserver(() => {
      setBox(getBoundingBox(elements))
    })

    for (const id of step.highlight) {
      const element = document.getElementById(id)
      if (element != null) {
        elements.push(element)
        observer.observe(element)
      }
    }
    setBox(getBoundingBox(elements))

    return () => observer.disconnect()
  }, [step])

  const text = useMemo(() => <Text
    box={box}
    padding={padding}
    step={step}
    index={index}/>, [box])

  return <div className="fixed inset-0 pointer-events-none grid">
    <Highlight box={box} padding={padding}/>
    {text}
  </div>
}

const getBoundingBox = (elements: HTMLElement[]): DOMRect => {
  let left = Number.MAX_VALUE
  let top = Number.MAX_VALUE
  let right = 0
  let bottom = 0

  for (const element of elements) {
    const box = element.getBoundingClientRect()

    left = Math.min(left, box.x)
    top = Math.min(top, box.y)
    right = Math.max(right, box.x + box.width)
    bottom = Math.max(bottom, box.y + box.height)
  }

  return new DOMRect(left, top, right - left, bottom - top)
}


type HighlightProps = {
  box: DOMRect | null,
  padding: number
}

const Highlight = ({box, padding}: HighlightProps) => {
  if (box == null) {
    return <div className="pointer-events-auto fixed inset-0 bg-black/50"/>
  }

  const width = box.width + 2 * padding
  const x = box.x - padding
  const y = box.y - padding
  const height = box.height + 2 * padding

  return <>
    <div className="pointer-events-auto fixed inset-0 bg-black/50" style={{width: px(x)}}/>
    <div className="pointer-events-auto fixed top-0 bg-black/50" style={{left: px(x), width: px(width), height: px(y)}}/>
    <div className="pointer-events-auto fixed inset-0 bg-black/50" style={{left: px(x + width)}}/>
    <div className="pointer-events-auto fixed bottom-0 bg-black/50" style={{left: px(x), width: px(width), top: px(y + height)}}/>
  </>
}

type TextProps = {
  box: DOMRect | null,
  padding: number,
  step: Step,
  index: number
}

const Text = ({box, padding, step, index}: TextProps) => {
  const router = useRouter()

  const forward = () => {
    if (index === steps.length - 1) {
      router.goto('/')
    } else {
      router.goto(`/tutorial?step=${index + 1}`)
    }
  }
  const back = () => {
    if (index === 0) {
      router.goto('/')
    } else {
      router.goto(`/tutorial?step=${index - 1}`)
    }
  }

  return <div {...textProps(box, padding)}>
    <div>{step.text}</div>
    <div className="p-1"/>
    <div className="flex gap-2">
      <button className="btn btn-raised" onClick={back}>Zurück</button>
      <button className="btn btn-raised" onClick={forward}>
        {index === steps.length - 1 ? 'Beenden' : 'Weiter'}
      </button>
    </div>
  </div>
}

const textProps = (box: DOMRect | null, padding: number): {className: string, style: React.CSSProperties} => {
  const className = 'max-w-md pointer-events-auto z-50 bg-background px-4 py-2 rounded shadow-2xl'
  if (box == null) {
    return {
      className: `${className} place-self-center`,
      style: {}
    }
  }

  return {
    className: `${className} fixed`,
    style: {
      top: `${box.y + box.height + 2 * padding}px`,
      left: `${Math.max(box.x - padding, padding)}px`
    }
  }
}

const px = (n: number) => `${Math.max(n, 0)}px`