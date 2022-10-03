import {findFinale} from '@/utils/brackets'
import {contestants} from '@/state/tournament'
import {CloseSVG} from '@/components/svg'
import {useEffect, useRef} from 'react'
import {random} from '@/utils/math'

interface WinnerProps {
  onClose: () => void
}

const Winner = ({onClose}: WinnerProps) => {
  const {leftScore, rightScore, left, right} = findFinale()
  const {name} = contestants[leftScore > rightScore ? left : right]

  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    return renderFireworks(canvas)
  }, [])

  return <div className="fixed inset-0 grid place-content-center bg-black/20">
    <canvas className="absolute inset-0 w-full h-full" ref={ref}></canvas>
    <div className="relative card bg-background border-none p-16 flex flex-col items-center">
      <button className="btn btn-svg absolute top-4 right-4" onClick={onClose}><CloseSVG/></button>
      <div className="text-6xl">Der Gewinner ist</div>
      <div className="p-3"/>
      <div className="text-4xl">{name}</div>
    </div>
  </div>
}

export default Winner


const renderFireworks = (canvas: HTMLCanvasElement) => {
  let width = canvas.width = window.innerWidth
  let height = canvas.height = window.innerHeight

  const updateSize = () => {
    canvas.width = width = window.innerWidth
    canvas.height = height = window.innerHeight
  }

  window.addEventListener('resize', updateSize)

  const ctx = canvas.getContext('2d')!

  const update = renderer()

  let frame: number
  let time = Date.now()
  const loop = () => {
    const now = Date.now()
    const deltaTime = (now - time) / 1000
    time = now

    ctx.clearRect(0, 0, width, height)
    update(ctx, deltaTime, width, height)

    frame = requestAnimationFrame(loop)
  }
  frame = requestAnimationFrame(loop)

  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', updateSize)
  }
}


const renderer = () => {
  let fireworks: Firework[] = []
  let particles: Particle[] = []

  const update = (ctx: CanvasRenderingContext2D, deltaTime: number, width: number, height: number) => {
    if (Math.random() > 0.96)
      fireworks.push(new Firework(width, height))

    for (let i = 0; i < fireworks.length; i++) {
      const firework = fireworks[i]
      const explode = firework.explode()
      if (explode) {
        const [x, y] = firework.position
        const color = colors[Math.floor(random(colors.length))]
        const count = Math.floor(random(400, 600))
        new Promise<void>(resolve => {
          for (let j = 0; j < count; j++) {
            particles.push(new Particle(x, y, color))
          }
          resolve()
        })
        fireworks.splice(i, 1)
        i--
        continue
      }

      firework.update(deltaTime)
      firework.render(ctx)
    }

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i]
      if (particle.remove()) {
        particles.splice(i, 1)
        i--
        continue
      }
      particle.update(deltaTime)
      particle.render(ctx)

    }
  }

  return update
}

import tailwind from 'tailwindcss/colors'

const colors = [
  tailwind.red[400],
  tailwind.amber[600],
  tailwind.emerald[600],
  tailwind.fuchsia[400],
  tailwind.lime[700],
  tailwind.purple[300],
  tailwind.rose[600],
  tailwind.slate[400],
  tailwind.cyan[300],
  tailwind.indigo[600]
] as const

class Firework {
  private x: number
  private y: number
  private vx: number
  private vy: number
  private explodeTime: number
  private size: number
  private length: number
  private dots: [number, number][]

  constructor(width: number, height: number) {
    this.x = random(width)
    this.y = height + 10
    this.vx = random(50, 150)
    this.vy = random(-1500, -1000)
    this.explodeTime = random(-200, 200)
    this.dots = []
    this.size = random(1, 4)
    this.length = Math.floor(random(5, 15))
    if (this.x > width / 2)
      this.vx *= -1
  }

  public update(deltaTime: number) {
    this.vy += 20
    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime
    this.dots.unshift([this.x, this.y])
    if (this.dots.length > this.length)
      this.dots.pop()
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = tailwind.amber[100]
    this.dots.forEach(([x, y], index) => {
      const opacity = 1 - index / this.length
      const size = this.size * opacity
      ctx.globalAlpha = opacity
      ctx.beginPath()
      ctx.ellipse(x, y, size, size, 0, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  public explode() {
    return this.vy > this.explodeTime
  }

  public get position() {
    return [this.x, this.y]
  }
}

class Particle {
  private x: number
  private y: number
  private vx: number
  private vy: number
  private totalLifetime: number
  private lifetime = 0
  private color: string

  constructor(x: number, y: number, color: string) {
    this.x = x
    this.y = y
    const angle = random(Math.PI * 2)
    const speed = random(200, 400)
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    this.color = color
    this.totalLifetime = random(3, 5)
  }

  public update(deltaTime: number) {
    const dec = Math.pow(6, -this.lifetime)
    const vx = this.vx * dec
    const vy = this.vy * dec

    this.x += vx * deltaTime
    this.y += vy * deltaTime
    this.lifetime += deltaTime

    this.vy += 7
  }
  
  public render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.globalAlpha = 1 - this.lifetime / this.totalLifetime
    ctx.ellipse(this.x, this.y, 1, 1, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  public remove() {
    return this.lifetime > this.totalLifetime
  }
}