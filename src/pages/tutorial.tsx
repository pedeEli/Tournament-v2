import {useRouter, Route, type RouterProps} from '@/components/Router'
import {useEffect, useState, useMemo, useRef} from 'react'
import {routes} from '@/init/App'
import {contestants} from '@/state/tournament'
import {createId} from '@/utils/str'

const contestantsPool: App.Contestant[] = [
  {
    id: '',
    type: 'person',
    name: 'Elias'
  },
  {
    id: '',
    type: 'team',
    name: 'Dream Team',
    members: ['Simon', 'Ruben']
  },
  {
    id: '',
    type: 'person',
    name: 'Nicolas'
  },
  {
    id: '',
    type: 'team',
    name: 'Sisters',
    members: ['Sarah', 'Rebecca']
  },
  {
    id: '',
    type: 'person',
    name: 'Rico'
  },
  {
    id: '',
    type: 'team',
    name: 'Sieger',
    members: ['Jakob', 'Jan']
  },
  {
    id: '',
    type: 'person',
    name: 'Emma'
  },
  {
    id: '',
    type: 'team',
    name: 'Beste Team',
    members: ['Erik', 'Bennet']
  }
]

type ActionContext = {
  setRoute: (route: string) => void
}

type Action = {
  type: 'listener',
  target: string,
  event: keyof HTMLElementEventMap,
  fn: (ctx: ActionContext) => (event: Event) => void
} | {
  type: 'forward',
  fn: (ctx: ActionContext) => void
}

type Step = {
  route: string,
  highlight?: string,
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
    highlight: '#settings-name',
    text: `Als Erstes ändern wir den Namen unseres Tuniers. Dazu machst du einen Doppelklick auf den Turnier.
      Um den Namen zu bestätigen drückst du Enter. Mit Escape kannst du auch abbrechen.
      Auf diese Weise kannst du die meisten Infos in der App bearbeiten. Du erkennst ob man etwas bearbeiten kann daran,
      dass sich dein Mauszeiger zu einer Hand verändert. Probier es während dem Tutorial einfach mal überall aus.`
  },
  {
    route: '/contestants',
    highlight: '#new-contestant > *, #list',
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
      fügen wir noch ein paar hinzu.`,
    actions: [
      {
        type: 'forward',
        fn: () => {
          const ids = new Set(Object.keys(contestants))
          
          const conts = Object.values(contestants)
          let i = 0
          while (conts.length < 8) {
            const contsFromPool = contestantsPool[i]
            if (conts.find(c => c.name === contsFromPool.name)) {
              i++
              continue
            }
            const id = createId(ids)
            ids.add(id)
            contestants[id] = {...contsFromPool, id}
            conts.push(contestants[id])
          }

          while (conts.length > 8) {
            const cont = conts.pop()!
            delete contestants[cont.id]
          }
        }
      }
    ]
  },
  {
    route: '/contestants',
    highlight: '#navbar-groups, #navbar-contestants, #navbar-tournament',
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
  },
  {
    route: '/groups',
    highlight: '#settings-group',
    text: `Hier kann man Gruppen komplett deaktivieren.
      Da wir mit Gruppen spielen wollen lassen wir den Hacken gesetzt.`,
    actions: [
      {
        type: 'forward',
        fn: () => {
          const checkbox = document.querySelector('#settings-group input[type="checkbox"]') as HTMLInputElement
          if (!checkbox.checked) {
            checkbox.click()
          }
        }
      }
    ]
  },
  {
    route: '/groups',
    text: `temp`
  }
]



const Tutorial = () => {
  const router = useRouter()

  const index = parseInt(router.route.searchParams.get('step') ?? '0')
  const step = steps[isNaN(index) ? 0 : index]
  const [route, setRoute] = useState(routes.find(({route}) => route.test(step.route)))
  const [box, setBox] = useState<DOMRect | null>(null)
  const forwardActions = useRef(new Set<(ctx: ActionContext) => void>())

  useEffect(() => {
    setRoute(routes.find(({route}) => route.test(step.route)))
  }, [step])

  const ctx: ActionContext = {
    setRoute: r => setRoute(routes.find(({route}) => route.test(r)))
  }

  useEffect(() => {
    if (step.highlight == undefined) {
      setBox(null)
      return
    }

    const elements: Element[] = []
    const observer = new ResizeObserver(() => {
      setBox(getBoundingBox(elements))
    })

    for (const element of document.querySelectorAll(step.highlight)) {
      elements.push(element)
      observer.observe(element)
    }
    setBox(getBoundingBox(elements))

    return () => observer.disconnect()
  }, [step, route])

  
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
          break;
        case 'forward':
          forwardActions.current.add(action.fn)
          break;
      }
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup()
      }
      forwardActions.current.clear()
    }
  }, [step])

  const forward = () => {
    for (const action of forwardActions.current) {
      action(ctx)
    }
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
  
  if (route == undefined) {
    return <div>Unbekannte Route: {step.route}</div>
  }


  return <>
    <Route {...route}/>
    <Overlay {...{step, index, box, forward, back}}/>
  </>
}

export default Tutorial


type OverlayProps = {
  step: Step,
  index: number,
  box: DOMRect | null,
  back: () => void,
  forward: () => void
}

const Overlay = ({step, index, box, forward, back}: OverlayProps) => {
  const padding = step.padding ?? 10

  const text = useMemo(() => {
    return <Text {...{box, padding, step, index, forward, back}}/>
  }, [box])

  return <div className="fixed inset-0 pointer-events-none grid">
    <Highlight {...{box, padding}}/>
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
  index: number,
  back: () => void,
  forward: () => void
}

const Text = ({box, padding, step, back, forward, index}: TextProps) => {
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