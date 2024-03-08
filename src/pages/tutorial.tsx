import {useRouter, Route} from '@/components/Router'
import {useEffect, useState, useMemo} from 'react'
import {routes} from '@/init/App'


type ActionContext = {
  setRoute: (route: string) => void
}

type Action = {
  type: 'listener',
  target: string,
  event: keyof HTMLElementEventMap,
  fn: (ctx: ActionContext) => (event: Event) => void
}

type Step = {
  route: string,
  highlight?: string[],
  text: string,
  padding?: number,
  position?: 'up' | 'left' | 'down' | 'right',
  actions?: Action[]
}

const steps: Step[] = [
  {
    route: '/contestants',
    text: 'Wilkommen im Tutorial. Hier werden wir ein kleines Tunier simulieren, um zu verstehen wie alles funktioniert.'
  },
  {
    route: '/contestants',
    highlight: ['#settings-name'],
    text: `Als Erstes ändern wir den Namen unseres Tuniers. Dazu machst du einen Doppelklick auf den Turnier.
      Um den Namen zu bestätigen drückst du Enter. Mit Escape kannst du auch abbrechen.
      Auf diese Weise kannst du die meisten Infos in der App bearbeiten. Du erkennst ob man etwas bearbeiten kann daran,
      dass sich dein Mauszeiger zu einer Hand verändert. Probier es während dem Tutorial einfach mal überall aus.`
  },
  {
    route: '/contestants',
    highlight: ['#new-contestant > *', '#list'],
    text: `Nun müssen wir Mitspieler hinzufügen. Die App unterscheidet zwischen Teams und Personen.
      Sowohl Teams als auch Personen benötigen einen eindeutigen Namen.
      Um ein Mitglied hinzu zufügen einfach auf das obere Plus oder Enter drücken.
      Ein Team besteht immer aus zwei oder mehr Mitgliedern. Diese fügt man hinzu indem man erst auf
      das Plus neben 'Team Mitglieder' drückt, einen Namen ein gibt und dann mit Enter bestatigt.
      Probiers einfach mal ein wenig aus. Wie du siehst kannst du die Personen, Teams und Team
      Mitglieder im Nachhinein nochmals bearbeiten.`
  },
  {
    route: '/contestants',
    text: `Als Nächstes wollen wir die Gruppen für unser Tunier erstellen.
      Falls es noch nicht genug Mitspieler für eine sinnvolle Gruppenphase sind,
      fügen wir noch ein paar hinzu.`
  },
  {
    route: '/contestants',
    highlight: ['#navbar-groups', '#navbar-contestants', '#navbar-tournament'],
    text: `Hier kannst du zwischen den verschiedenen Seiten wechseln. Wir wollen zu den Gruppen.`,
    actions: [
      {
        type: 'listener',
        target: '#navbar-contestants, #navbar-groups, #navbar-tournament',
        event: 'click',
        fn: ctx => event => {
          event.preventDefault()
          event.stopPropagation()
          if (event.target instanceof HTMLAnchorElement) {
            ctx.setRoute(event.target.pathname)
          }
        }
      }
    ]
  }
]



const Tutorial = () => {
  const router = useRouter()

  const index = parseInt(router.route.searchParams.get('step') ?? '0')
  const step = steps[isNaN(index) ? 0 : index]
  const [route, setRoute] = useState(routes.find(({route}) => route.test(step.route)))

  useEffect(() => {
    setRoute(routes.find(({route}) => route.test(step.route)))
  }, [step])

  const ctx: ActionContext = {
    setRoute: r => setRoute(routes.find(({route}) => route.test(r)))
  }
  
  if (route == undefined) {
    return <div>Unbekannte Route: {step.route}</div>
  }


  return <>
    <Route {...route}/>
    <Overlay step={step} index={index} ctx={ctx}/>
  </>
}

export default Tutorial


type OverlayProps = {
  step: Step,
  index: number,
  ctx: ActionContext
}

const Overlay = ({step, index, ctx}: OverlayProps) => {
  const [box, setBox] = useState<DOMRect | null>(null)
  const padding = step.padding ?? 10

  useEffect(() => {
    if (step.highlight == undefined || step.highlight.length === 0) {
      setBox(null)
      return
    }

    const elements: Element[] = []
    const observer = new ResizeObserver(() => {
      setBox(getBoundingBox(elements))
    })

    for (const selector of step.highlight) {
      for (const element of document.querySelectorAll(selector)) {
        elements.push(element)
        observer.observe(element)
      }
    }
    setBox(getBoundingBox(elements))

    return () => observer.disconnect()
  }, [step])

  useEffect(() => {
    const {actions} = step
    if (actions == undefined || actions.length === 0) {
      return
    }

    const cleanups: Array<() => void> = []
    for (const action of actions) {
      switch (action.type) {
        case 'listener':
          const elements = document.querySelectorAll(action.target)
          const fn = action.fn(ctx)
          for (const element of elements) {
            element.addEventListener(action.event, fn)
            cleanups.push(() => element.removeEventListener(action.event, fn))
          }
      }
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup()
      }
    }
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

const getBoundingBox = (elements: Element[]): DOMRect => {
  let left = Number.MAX_VALUE
  let top = Number.MAX_VALUE
  let right = 0
  let bottom = 0

  for (const element of elements) {
    const box = element.getBoundingClientRect()
    if (box.width === 0 && box.height === 0) {
      continue
    }

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