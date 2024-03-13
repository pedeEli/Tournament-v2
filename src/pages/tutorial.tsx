import type {ActionContext, Step} from '@/utils/tutorial'
import {getBoundingBox, px, useApplyActions, listener, forward} from '@/utils/tutorial'
import {useRouter, Route} from '@/components/Router'
import {useEffect, useState, useMemo, useRef} from 'react'
import {routes} from '@/init/App'
import {contestants, groups} from '@/state/tournament'
import {createId} from '@/utils/str'
import {addContestantToGroup, addGroup, handleDeleteGroup, handleDeleteMember} from '@/components/groups/GroupAssignment'

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
      listener('#navbar-contestants, #navbar-groups, #navbar-tournament', 'click', ctx => event => {
        event.preventDefault()
        event.stopPropagation()
        if (event.target instanceof HTMLAnchorElement) {
          ctx.setRoute(event.target.pathname)
        }
      })
    ]
  },
  {
    route: '/groups',
    highlight: '#settings-groups, [for="settings-groups"]',
    text: `Hier kann man Gruppen komplett deaktivieren.
      Da wir mit Gruppen spielen wollen lassen wir den Hacken gesetzt.`,
    actions: [
      forward.setCheckbox('#settings-groups', true)
    ]
  },
  {
    route: '/groups',
    highlight: '#group-settings > :is(label, input[type="number"]):not([for="lucky-loser"])',
    text: `Das sind allgemaine Einstellungen die auf jede Gruppe zutreffen.
      Wir lassen sie so.`,
    actions: [
      forward.setInput('#winner-per-group', '2'),
      forward.setInput('#points-per-win', '3'),
      forward.setInput('#points-per-draw', '1')
    ]
  },
  {
    route: '/groups',
    highlight: '#lucky-loser, [for="lucky-loser"]',
    text: `Wenn man drei Gruppen hat mit jeweils zwei Siegern, kann Lucky Loser aktiviert werden,
      um statt sechs acht Sieger zu haben. Das funktioniert so in dem die besten Verlierer aus den
      Gruppen ebenfalls in die K.o Phase kommen. Wir benötigen kein Lucky Loser,
      da wir zwei Gruppen mit je vier Teilnehmern erstellen.`,
    actions: [
      forward.setCheckbox('#lucky-loser', false)
    ]
  },
  {
    route: '/groups',
    highlight: '#group-assignment > *',
    text: `Nun musst du noch die Gruppen erstellen. Das Plus neben Gruppen erstellt eine neue leere Gruppe.
      Dann kannst du entweder mit Drag and Drop die Teams auf die Gruppen verteilen,
      oder du drückst auf 'Zufällig verteilen'. Wir wollen mit zwei Gruppen spielen.`,
    actions: [
      {
        type: 'forward',
        fn: () => {
          let grps = Object.values(groups)

          while (grps.length < 2) {
            addGroup()
            grps = Object.values(groups)
          }

          while (grps.length > 2) {
            handleDeleteGroup(grps[grps.length - 1].id)()
            grps = Object.values(groups)
          }

          for (const group of grps) {
            while (group.members.length > 4) {
              handleDeleteMember(group.id)(4)()
            }
          }
          
          const assignedContestants = new Set(Object.values(grps).map(({members}) => members).flat())
          const unusedContestants = Object.values(contestants).filter(({id}) => !assignedContestants.has(id))

          for (const group of grps) {
            while (group.members.length < 4) {
              addContestantToGroup(group.id, unusedContestants[0].id)
              unusedContestants.splice(0, 1)
            }
          }
        }
      }
    ]
  },
  {
    route: '/groups',
    text: `test`
  }
]


const Tutorial = () => {
  const router = useRouter()

  const index = parseInt(router.route.searchParams.get('step') ?? '0')
  const step = steps[isNaN(index) ? 0 : index]
  const [route, setRoute] = useState(routes.find(({route}) => route.test(step.route)))
  const ctx: ActionContext = {
    setRoute: r => setRoute(routes.find(({route}) => route.test(r)))
  }
  const [box, setBox] = useState<DOMRect | null>(null)
  const {forwardActions} = useApplyActions(step, ctx)
  const ref = useRef<HTMLDivElement>(null)
  const allElements = useRef(new Map<HTMLElement, {tabIndex: number, pointerEvents: string}>())

  const resetNode = (node: Node) => {
    if (node instanceof HTMLElement) {
      const elementsInfo = allElements.current.get(node)
      if (elementsInfo != undefined) {
        node.tabIndex = elementsInfo.tabIndex
        node.style.pointerEvents = elementsInfo.pointerEvents
      }
    }
  }
  const resetAllNodes = () => {
    for (const [element, {tabIndex, pointerEvents}] of allElements.current) {
      element.tabIndex = tabIndex
      element.style.pointerEvents = pointerEvents
    }
  }

  useEffect(() => {
    setRoute(routes.find(({route}) => route.test(step.route)))
  }, [step])

  useEffect(() => {
    if (ref.current == null) {
      return
    }

    allElements.current.clear()
    const walker = document.createTreeWalker(ref.current, NodeFilter.SHOW_ELEMENT)

    while (walker.nextNode()) {
      for (const node of walker.currentNode.childNodes) {
        if (node instanceof HTMLButtonElement || node instanceof HTMLInputElement || node instanceof HTMLAnchorElement) {
          allElements.current.set(node, {
            tabIndex: node.tabIndex,
            pointerEvents: node.style.pointerEvents
          })
          node.style.pointerEvents = 'none'
          node.tabIndex = -1
        }
      }
    }

    if (step.highlight == undefined || ref.current == null) {
      setBox(null)
      return resetAllNodes
    }

    const {highlight} = step

    const elements: Element[] = []
    const observer = new ResizeObserver(() => {
      setBox(getBoundingBox(elements))
    })

    setTimeout(() => {
      for (const element of document.querySelectorAll(highlight)) {
        elements.push(element)
        observer.observe(element)

        const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT)
        resetNode(element)
        while (walker.nextNode()) {
          const currentNode = walker.currentNode
          resetNode(currentNode)
          for (const node of currentNode.childNodes) {
            resetNode(node)
          }
        }
      }
      setBox(getBoundingBox(elements))
    })

    return () => {
      observer.disconnect()
      resetAllNodes()
    }
  }, [step, route])

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
    <div className="contents" ref={ref}>
      <Route {...route}/>
    </div>
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