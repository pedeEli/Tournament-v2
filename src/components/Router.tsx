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
  goto: (url: string) => Promise<void>,
  route: URL
}

const RouterContext = createContext<RouterContext>({goto: async () => {}, route: new URL(location.href)})
export const useRouter = () => useContext(RouterContext)

const Router = ({routes}: RouterProps) => {
  const [activeRoute, setActiveRoute] = useState(new URL(location.href))
  useEffect(() => {
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [])


  const handleClick = async (event: MouseEvent) => {
    if (!(event.target instanceof HTMLAnchorElement))
      return
    
    event.preventDefault()
    await goto(event.target.href)
  }

  const goto = async (url: string | URL) => {
    if (typeof url === 'string') {
      url = new URL(url, activeRoute.origin)
    }
    history.pushState(undefined, '', url.href)
    setActiveRoute(url)
  }

  const route = routes.find(({route}) => route.test(activeRoute.pathname))

  if (!route)
    return <NotFound/>

  const Page = route.components[0]

  return <RouterContext.Provider value={{
    goto,
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