import EditableText from './EditableText'
import {AddSVG, MinusSVG} from '@/components/svg'
import React, {useState} from 'react'
import {useClickOutside} from '@/utils/hooks'

type EditableListProps = {
  disabled?: boolean,
  list: readonly string[]
} & ({
  onDelete?: undefined
} | {
  onDelete: () => void,
  disableDelete?: boolean
}) & ({
  onAdd?: undefined
} | {
  onAdd: (item: string) => boolean,
  disableAdd?: boolean
}) & ({
  onItemDelete?: undefined
} | {
  onItemDelete: (index: number) => () => void,
  disableItemDelete?: boolean
}) & ({
  heading: string
} | {
  loadHeading: () => string,
  saveHeading: (value: string) => boolean
}) & ({
  itemMapper: (item: string) => string
} | {
  onRename: (index: number) => (item: string) => boolean
})

const EditableList = (props: EditableListProps) => {
  const {list, disabled = false} = props
  const [adding, setAdding] = useState(false)
  const addingRef = useClickOutside<HTMLInputElement>(() => setAdding(false))

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (props.onAdd!(event.currentTarget.value))
        addingRef.current!.select()
    }
    if (event.key === 'Escape')
      return setAdding(false)
  }

  return <div className="card flex flex-col items-center">
    <div className="flex gap-2 items-center">
      <div>
        {'heading' in props
          ? <div className="text-overflow max-w-[20ch]">{props.heading}</div>
          : <EditableText className="text-overflow max-w-[20ch] block" load={props.loadHeading} save={props.saveHeading}/>}
      </div>
      {props.onAdd &&
        <button disabled={disabled || props.disableAdd} className="btn btn-svg" onClick={e => {
          e.stopPropagation()
          setAdding(true)
        }}><AddSVG/></button>}
      {props.onDelete &&
        <button disabled={disabled || props.disableDelete} className="btn btn-svg" onClick={props.onDelete}><MinusSVG/></button>}
    </div>
    {adding &&
      <input type="text" ref={addingRef} onKeyDown={handleKeyDown} autoFocus/>}
    {list.map((item, index) => {
      return <div key={item} className="flex gap-2 w-full items-center">
        {props.onItemDelete &&
          <button disabled={disabled || props.disableItemDelete} className="btn btn-svg" onClick={props.onItemDelete(index)}><MinusSVG/></button>}
        {'itemMapper' in props
          ? <div className="text-overflow max-w-[20ch]" title={props.itemMapper(item)}>{props.itemMapper(item)}</div>
          : <EditableText className="text-overflow max-w-[20ch]" load={() => item} save={props.onRename(index)}/>}
      </div>
    })}
  </div>
}

export default EditableList