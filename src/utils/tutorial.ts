import {useEffect, useRef} from 'react'

export type ActionContext = {
  setRoute: (route: string) => void
}

export type Action = {
  type: 'listener',
  target: string,
  event: keyof HTMLElementEventMap,
  fn: (ctx: ActionContext) => (event: HTMLElementEventMap[keyof HTMLElementEventMap]) => void
} | {
  type: 'forward',
  fn: (ctx: ActionContext) => void
}

export type Step = {
  route: string,
  highlight?: string,
  text: string,
  padding?: number,
  position?: 'up' | 'left' | 'down' | 'right',
  actions?: Action[]
}

export const getBoundingBox = (elements: Element[]): DOMRect | null => {
  let left = Number.MAX_SAFE_INTEGER
  let top = Number.MAX_SAFE_INTEGER
  let right = 0
  let bottom = 0
  let allHidden = true

  for (const element of elements) {
    const box = element.getBoundingClientRect()
    if (box.width === 0 && box.height === 0) {
      continue
    }

    allHidden = false
    left = Math.min(left, box.x)
    top = Math.min(top, box.y)
    right = Math.max(right, box.x + box.width)
    bottom = Math.max(bottom, box.y + box.height)
  }

  if (allHidden) {
    return null
  }
  return new DOMRect(left, top, right - left, bottom - top)
}

export const px = (n: number) => `${Math.max(n, 0)}px`


export const useApplyActions = (step: Step, ctx: ActionContext) => {
  const forwardActions = useRef(new Set<(ctx: ActionContext) => void>())

	useEffect(() => {
    const {actions} = step
    if (actions == undefined || actions.length === 0) {
      return
    }

    const cleanups: Array<() => void> = []
    for (const action of actions) {
      switch (action.type) {
        case 'listener':
          const elements = document.querySelectorAll(action.target)
          const fn = action.fn(ctx)
          for (const element of elements) {
            element.addEventListener(action.event, fn)
            cleanups.push(() => element.removeEventListener(action.event, fn))
          }
          break;
        case 'forward':
          forwardActions.current.add(action.fn)
          break;
      }
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup()
      }
      forwardActions.current.clear()
    }
  }, [step])

	return {
		forwardActions
	}
}


export const listener = <Event extends keyof HTMLElementEventMap>(
	target: string,
	event: Event,
	fn: (ctx: ActionContext) => (event: HTMLElementEventMap[Event]) => void
): Action => {
	return {
		type: 'listener',
		target,
		event,
		fn: fn as any
	}
}

export const forward = {
	setCheckbox: (target: string, checked: boolean): Action => {
		return {
			type: 'forward',
			fn: () => {
				const checkbox = document.querySelector(target) as HTMLInputElement
				if (checkbox.checked !== checked) {
					checkbox.click()
				}
			}
		}
	},
	setInput: (target: string, value: string): Action => {
		return {
			type: 'forward',
			fn: () => {
				const input = document.querySelector(target) as HTMLInputElement
				if (input.value !== value) {
					input.value = value
					input.dispatchEvent(new Event('input', {bubbles: true}))
					input.dispatchEvent(new Event('change', {bubbles: true}))
				}
			}
		}
	}
}