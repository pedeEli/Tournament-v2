import BracketMatch from './BracketMatch'
import React from 'react'

interface BracketRowProps {
  column: number,
  columnInfos: App.ColumnInfo[]
}

const getNamesStart = (n: number) => {
  return Math.floor(2.5 * (1 << (n + 1)) - 5) + 6
}
const getLinesStart = (n: number) => {
  return Math.ceil(2.5 * (1 << (n + 1)) - 5) + 7
}
const getTopOffset = (n: number) => {
  return 2.5 * ((1 << n) - 1)
}

const BracketRow = ({column, columnInfos}: BracketRowProps) => {
  const topOffset = getTopOffset(column)
  const namesStart = getNamesStart(column)
  const topLineSpan = getNamesStart(column - 1)
  const middleLineStart = getLinesStart(column - 1)
  const middleLineSpan = 1 + (1 - (1 >> column))

  return (
    <div
      style={{
        // gap: `calc(${topOffset} * 2 * var(--cell) + var(--cell))`,
        // transform: `translateY(calc(${topOffset} * var(--cell)))`
      }}
      className="flex flex-col"
    >
      {columnInfos.map((info, index) => {
        if (info.type === 'double') {
          return <React.Fragment key={index}>
            <div style={{height: `calc(${info.spaceTop} * var(--cell))`}}/>
            <div style={{gridTemplateRows: `repeat(4, var(--cell)) calc(${info.spaceMiddle} * var(--cell)) repeat(4, var(--cell))`}} className="grid grid-cols-[20ch_0.5rem_1.1rem_1rem]">
              <BracketMatch bracket={info.top}/>
              <div className="col-start-1 row-start-5"/>
              <BracketMatch bracket={info.bottom}/>
              <TopLine rowSpan={3}/>
              <BottomLine rowStart={5} rowSpan={3}/>
              <MiddleLine rowStart={5} rowSpan={1} colStart={4}/>
            </div>
            <div style={{height: `calc(${info.spaceBottom} * var(--cell))`}}/>
          </React.Fragment>
        }

        return <React.Fragment key={index}>
          <div style={{height: `calc(${info.spaceTop} * var(--cell))`}}/>
          <div style={{gridTemplateRows: `repeat(4, var(--cell))`}} className="grid grid-cols-[20ch_0.5rem_1.1rem_1rem]">
            <BracketMatch bracket={info.bracket}/>
            {info.bracket.parent && <>
              <MiddleLine rowStart={1} rowSpan={4} colStart={3}/>
              <MiddleLine rowStart={1} rowSpan={4} colStart={4}/>
            </>}
          </div>
          <div style={{height: `calc(${info.spaceBottom} * var(--cell))`}}/>
        </React.Fragment>
        // return <div key={index} style={{gridAutoRows: 'var(--cell)'}} className="grid grid-cols-[20ch_0.5rem_1.1rem_1rem]">
        //   <BracketMatch bracket={isArray ? pair[0] : pair}/>
        //   {isArray
        //     ? <>
        //       <BracketMatch
        //         bracket={pair[1]}
        //         topStyle={{gridRowStart: namesStart}}
        //         bottomStyle={{gridRowStart: namesStart + 2}}
        //       />
        //       <TopLine rowSpan={topLineSpan}/>
        //       <BottomLine rowStart={middleLineStart} rowSpan={topLineSpan}/>
        //       <MiddleLine rowStart={middleLineStart} rowSpan={middleLineSpan} colStart={4}/>
        //     </>
        //     : pair.parent && <>
        //       <MiddleLine rowStart={1} rowSpan={4} colStart={3}/>
        //       <MiddleLine rowStart={1} rowSpan={4} colStart={4}/>
        //     </>}
        // </div>
      })}
    </div>
  )
}

export default BracketRow


const TopLine = ({rowSpan}: {rowSpan: number}) => {
  return (
    <div
      style={{gridRowEnd: `span ${rowSpan}`}}
      className="row-start-3 col-start-3 border-t-2 border-r-2 border-secondary translate-y-[-1px]"
    />
  )
}
const BottomLine = ({rowStart, rowSpan}: {rowStart: number, rowSpan: number}) => {
  return (
    <div
      style={{gridRow: `${rowStart} / span ${rowSpan}`}}
      className=" col-start-3 border-b-2 border-r-2 border-secondary translate-y-[1px]"
    />
  )
}
const MiddleLine = ({rowStart, rowSpan, colStart}: {rowStart: number, rowSpan: number, colStart: number}) => {
  return (
    <div
      style={{gridRow: `${rowStart} / span ${rowSpan}`, gridColumnStart: colStart}}
      className="h-[2px] bg-secondary self-center"
    />
  )
}