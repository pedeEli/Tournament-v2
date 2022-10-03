import {useState} from 'react'
import {CheckmarkSVG} from '@/components/svg'

interface CheckboxProps {
  defaultChecked?: boolean,
  disabled?: boolean,
  onInput: (event: React.FormEvent<HTMLInputElement>) => void
}

const Checkbox = ({defaultChecked = false, disabled = false, onInput}: CheckboxProps) => {
  const [checked, setChecked] = useState(defaultChecked)
  return <div className="relative w-[2em] h-[2em]">
    <input
      type="checkbox"
      className="peer appearance-none border border-white/30 rounded-md h-full w-full cursor-pointer checked:border-none checked:bg-primary
      disabled:cursor-default disabled:border-white/20 disabled:bg-gray-500"
      disabled={disabled}
      checked={checked}
      onChange={e => {
        setChecked(e.currentTarget.checked)
        onInput(e)
      }}
    />
    <div className="hidden peer-checked:block absolute inset-0 pointer-events-none peer-checked:peer-disabled:text-font/50"><CheckmarkSVG/></div>
  </div>
}

export default Checkbox