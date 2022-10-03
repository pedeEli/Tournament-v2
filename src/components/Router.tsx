import React, {useEffect, useState, createContext, useContext} from 'react'
import NotFound from '@/pages/_notFound'
import {state} from '@/state/tournament'

interface RouterProps {
  routes: Array<{
    route: RegExp,
    components: [
      () => JSX.Element,
      ...Array<Layout>
    ]
  }>
}

interface RouterContext {
  goto: (url: string) => void
}

const RouterContext = createContext<RouterContext>({goto: () => {}})
export const useRouter = () => useContext(RouterContext)

const Router = ({routes}: RouterProps) => {
  const [activeRoute, setActiveRoute] = useState('/')
  useEffect(() => {
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [])

  if (activeRoute !== '/')
    state.page = activeRoute

  const handleClick = (event: MouseEvent) => {
    if (!(event.target instanceof HTMLAnchorElement))
      return
    
    event.preventDefault()
    const {hash, href} = event.target
    history.pushState(undefined, '', href)
    setActiveRoute(hash.slice(1))
  }

  const route = routes.find(({route}) => route.test(activeRoute))

  if (!route)
    return <NotFound/>

  const Page = route.components[0]

  return <RouterContext.Provider value={{goto: url => setActiveRoute(url)}}>{
    getLayouts(route).reduce((acc, Com) => {
      return <Com>
        {acc}
      </Com>
    }, <Page/>)
  }</RouterContext.Provider>
}

export default Router

const getLayouts = (route: RouterProps['routes'][number]) => {
  return route.components.slice(1) as unknown as Array<Layout>
}


export type Layout = (props: {
  children: React.ReactNode
}) => JSX.Element