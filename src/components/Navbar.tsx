import {EditableText} from '@/components/input'
import {settings, state} from '@/state/tournament'
import {useSnapshotKey} from '@/utils/valtio'
import {MenuSVG} from '@/components/svg'

interface NavbarProps {
  onMenu: () => void
}

const Navbar = ({onMenu}: NavbarProps) => {
  const phase = useSnapshotKey(state, 'phase')
  const groups = useSnapshotKey(settings, 'groups')

  return <nav className="h-full flex items-center text-2xl bg-primary">
    <ul className="contents">
        <li className="mx-6 text-[2.5rem] mr-auto"><EditableText disabled={phase === 'done'} load={() => settings.name} save={value => {
          settings.name = value
          return true
        }}/></li>
      <li className="mx-6"><a href="/contestants" className="outline-none">Teams</a></li>
      <li className="mx-6"><a href="/groups" className="outline-none">Gruppen</a></li>
      <li className="mx-6"><a href={`/tournament/${phase === 'brackets' || phase === 'done' || !groups ? 'brackets' : 'groups'}`} className="outline-none">Turnier</a></li>
      <li className="w-10 h-10 mx-6"><button onClick={onMenu} className="w-full h-full outline-none"><MenuSVG/></button></li>
    </ul>
  </nav>
}

export default Navbar