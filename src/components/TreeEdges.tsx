import { useLayoutEffect, useState, type RefObject } from 'react'
import { clientPointToLocal } from '../utils/layoutCoords'

export type EdgeConnection = {
  parentId: string
  childIds: string[]
}

type TreeEdgesProps = {
  diagramRef: RefObject<HTMLDivElement | null>
  connections: EdgeConnection[]
  layoutKey?: number
}

type EdgeLine = {
  d: string
}

export function TreeEdges({ diagramRef, connections, layoutKey = 0 }: TreeEdgesProps) {
  const [lines, setLines] = useState<EdgeLine[]>([])
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const diagram = diagramRef.current
    if (!diagram) return

    const update = () => {
      const nextLines: EdgeLine[] = []

      for (const { parentId, childIds } of connections) {
        const parent = diagram.querySelector<HTMLElement>(
          `[data-node-id="${parentId}"]`,
        )
        if (!parent) continue

        const parentRect = parent.getBoundingClientRect()
        const parentPoint = clientPointToLocal(
          diagram,
          parentRect.left + parentRect.width / 2,
          parentRect.bottom,
        )

        for (const childId of childIds) {
          const child = diagram.querySelector<HTMLElement>(
            `[data-node-id="${childId}"]`,
          )
          if (!child) continue

          const childRect = child.getBoundingClientRect()
          const childPoint = clientPointToLocal(
            diagram,
            childRect.left + childRect.width / 2,
            childRect.top,
          )
          const midY =
            parentPoint.y + (childPoint.y - parentPoint.y) * 0.45

          nextLines.push({
            d: `M ${parentPoint.x} ${parentPoint.y} C ${parentPoint.x} ${midY}, ${childPoint.x} ${midY}, ${childPoint.x} ${childPoint.y}`,
          })
        }
      }

      setLines(nextLines)
      setSize({
        width: diagram.offsetWidth,
        height: diagram.offsetHeight,
      })
    }

    update()

    const observer = new ResizeObserver(update)
    observer.observe(diagram)
    window.addEventListener('resize', update)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [diagramRef, connections, layoutKey])

  if (!lines.length) return null

  return (
    <svg
      className="tree-edges"
      width={size.width}
      height={size.height}
      aria-hidden="true"
    >
      {lines.map((line, index) => (
        <path key={index} d={line.d} className="tree-edge" />
      ))}
    </svg>
  )
}
