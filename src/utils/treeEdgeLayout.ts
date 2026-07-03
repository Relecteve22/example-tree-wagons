import { clientPointToLocal } from './layoutCoords'

export type EdgeConnection = {
  parentId: string
  childIds: string[]
}

export type EdgeLine = {
  key: string
  d: string
}

export function measureEdgeLines(
  diagram: HTMLElement,
  connections: EdgeConnection[],
): EdgeLine[] {
  const lines: EdgeLine[] = []

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
      const midY = parentPoint.y + (childPoint.y - parentPoint.y) * 0.45

      lines.push({
        key: `${parentId}->${childId}`,
        d: `M ${parentPoint.x} ${parentPoint.y} C ${parentPoint.x} ${midY}, ${childPoint.x} ${midY}, ${childPoint.x} ${childPoint.y}`,
      })
    }
  }

  return lines
}
