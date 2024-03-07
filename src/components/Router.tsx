import React, {useEffect, useState, createContext, useContext} from 'react'
import NotFound from '@/pages/_notFound'

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
  goto: (url: string) => void,
  route: URL
}

const RouterContext = createContext<RouterContext>({goto: () => {}, route: new URL(location.href)})
export const useRouter = () => useContext(RouterContext)

const Router = ({routes}: RouterProps) => {
  const [activeRoute, setActiveRoute] = useState(new URL(location.href))
  useEffect(() => {
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [])


  const handleClick = (event: MouseEvent) => {
    if (!(event.target instanceof HTMLAnchorElement))
      return
    
    event.preventDefault()
    const {href} = event.target
    history.pushState(undefined, '', href)
    setActiveRoute(new URL(href))
  }

  const route = routes.find(({route}) => route.test(activeRoute.pathname))

  if (!route)
    return <NotFound/>

  const Page = route.components[0]

  return <RouterContext.Provider value={{
    goto: url => setActiveRoute(new URL(url, activeRoute.origin)),
    route: activeRoute
  }}>{
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