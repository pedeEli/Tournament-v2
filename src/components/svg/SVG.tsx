interface SVGProps {
  height?: string,
  fill?: string,
}

const SVG = (path: string) => ({height = 'auto', fill = 'currentColor'}: SVGProps) => {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{height}}>
    <path d={path} fill={fill}/>
  </svg>
}

export default SVG