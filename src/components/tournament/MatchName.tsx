import {useSnapshot} from 'valtio'

interface MatchNameProps {
  match: App.Match,
  name: string,
  side: 'left' | 'right',
  orientation?: MatchNameProps['side'],
  won: (a: number, b: number) => boolean,
  className?: string,
  style?: React.CSSProperties
}

const MatchName = ({match, name, side, won, orientation = side, className = '', style}: MatchNameProps) => {
  const mtch = useSnapshot(match)
  const {leftScore, rightScore, state} = mtch

  const backgroundColor = state !== 'closed'
    ? ''
    : leftScore === rightScore
    ? 'bg-draw/40 border-none'
    : won(leftScore, rightScore)
    ? 'bg-win/40 border-none'
    : 'bg-loss/40 border-none'

  const o = orientation === 'left'
    ? 'text-left mr-auto'
    : 'text-right ml-auto'

  return <div style={style} title={name} className={`flex card ${backgroundColor} ${className} items-center relative before:absolute before:inset-0 group-hover:before:bg-white/10 overflow-hidden`}>
    {state === 'closed' && orientation === 'right' &&
      <div>({mtch[`${side}Score`]})</div>}
    <div className={`${o} text-overflow`}>
      {name}
    </div>
    {state === 'closed' && orientation === 'left' &&
      <div>({mtch[`${side}Score`]})</div>}
  </div>
}

export default MatchName