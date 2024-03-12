import {useEffect, useState} from 'react'
import {useDoubleClick, useClickOutside} from '@/utils/hooks'

interface EditableTextProps {
  editing?: boolean,
  disabled?: boolean,
  load: () => string,
  save: (value: string) => boolean,
  style?: React.CSSProperties,
  className?: string
}

const EditableText = ({
  load,
  save,
  editing: _editing = false,
  disabled = false,
  style,
  className = ''
}: EditableTextProps) => {
  const [editing, setEditing] = useState(_editing)
  const spanRef = useDoubleClick<HTMLButtonElement>(event => {
    if (disabled)
      return
    event.stopPropagation()
    setEditing(true)
  })
  const inputRef = useClickOutside<HTMLInputElement>(() => {
    setEditing(false)
  })

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setEditing(false)
      return
    }
    if (event.key !== 'Enter')
      return
    const value = event.currentTarget.value.trim()
    if (!save(value))
      return
    setEditing(false) 
  }

  useEffect(() => {
    inputRef.current?.select()
  })

  const text = load()

  if (editing)
    return <input
      type="text"
      ref={inputRef}
      style={style}
      lang="de"
      onKeyDown={handleKeyDown}
      defaultValue={text}
    />

  return <button ref={spanRef} title={text} className={`${disabled ? '' : 'cursor-pointer'} ${className}`}>{text}</button>
}

export default EditableText