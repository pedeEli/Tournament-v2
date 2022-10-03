import Router from '@/components/Router'

import Index from '@/pages/index'
import Contestants from '@/pages/contestants'
import Groups from '@/pages/groups'
import OuterLayout from '@/pages/_layout'

import TournamentGroups from '@/pages/tournament/groups'
import TournamentBrackets from '@/pages/tournament/brackets'
import InnerLayout from '@/pages/tournament/_layout'

const App: React.FC = () => {
  return (
    <Router
      routes={[
        {
          route: /^\/$/,
          components: [Index]
        },
        {
          route: /^\/contestants$/,
          components: [
            Contestants,
            OuterLayout
          ]
        },
        {
          route: /^\/groups$/,
          components: [
            Groups,
            OuterLayout
          ]
        },
        {
          route: /^\/tournament\/groups$/,
          components: [
            TournamentGroups,
            InnerLayout,
            OuterLayout
          ]
        },
        {
          route: /^\/tournament\/brackets$/,
          components: [
            TournamentBrackets, 
            InnerLayout,
            OuterLayout
          ]
        }
      ]}
    />
  )
}

export default App
