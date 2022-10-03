import {contestants, settings, state} from '@/state/tournament'
import {GroupSettings, GroupAssignment} from '@/components/groups'
import {Checkbox} from '@/components/input'
import {useSnapshotKey} from '@/utils/valtio'
import {createNoGroupsBrackets, deleteBrackets} from '@/utils/brackets'

const Groups = () => {
  const groups = useSnapshotKey(settings, 'groups')

  const setGroups = (event: React.FormEvent<HTMLInputElement>) => {
    const {checked} = event.currentTarget
    settings.groups = checked
    if (checked)
      return deleteBrackets()
    createNoGroupsBrackets()
  }

  return <div className="flex flex-col items-center">
    <div className="p-2"/>
    <h1 className="flex gap-4 items-center">
      Gruppen
      <span className="text-lg">
        <Checkbox disabled={state.phase !== 'configure'} defaultChecked={settings.groups} onInput={setGroups}/>
      </span>
    </h1>
    {groups && <>
      <div className="p-2"/>
      <div>Es gibt insgesamt {Object.keys(contestants).length} Teilnehmer</div>
      <div className="p-1"/>
      <GroupSettings/>
      <GroupAssignment/>
    </>}
  </div>
}

export default Groups