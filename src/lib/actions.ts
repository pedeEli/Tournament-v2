export const clickOutside = (node: Node, outside: Node = document) => {
    const handleClick = event => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(
                new CustomEvent('clickoutside')
            )
        }
    }

    outside.addEventListener('click', handleClick, true)

    return {
        destroy: () => outside.removeEventListener('click', handleClick, true),
        update: (newOutside) => {
            outside.removeEventListener('click', handleClick, true)
            outside = newOutside
            outside.addEventListener('click', handleClick, true)
        }
    }
}

export const doubleClick = (node: Node) => {
    let timeoutId: NodeJS.Timeout
    let clicks = 0

    const handleClick = () => {
        if (clicks === 1) {
            clicks = 0
            clearTimeout(timeoutId)
            node.dispatchEvent(new CustomEvent('doubleclick'))
            return
        }
        clicks++
        timeoutId = setTimeout(() => {
            clicks = 0
        }, 1000)
    }

    node.addEventListener('click', handleClick)

    return {
        destroy: () => node.removeEventListener('click', handleClick)
    }
}