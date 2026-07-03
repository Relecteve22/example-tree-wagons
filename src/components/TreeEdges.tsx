import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react'
import type { EdgeLine } from '../utils/treeEdgeLayout'
import './TreeDiagram.css'

export type TreeEdgesHandle = {
  update: (lines: EdgeLine[], width: number, height: number) => void
}

type TreeEdgesProps = {
  lines: EdgeLine[]
  width: number
  height: number
}

function paintEdges(
  svg: SVGSVGElement,
  lines: EdgeLine[],
  width: number,
  height: number,
) {
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))

  const existing = svg.querySelectorAll<SVGPathElement>('.tree-edge')
  existing.forEach((path) => {
    if (!lines.some((line) => line.key === path.dataset.key)) {
      path.remove()
    }
  })

  for (const line of lines) {
    let path = svg.querySelector<SVGPathElement>(
      `.tree-edge[data-key="${line.key}"]`,
    )

    if (!path) {
      path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.classList.add('tree-edge')
      path.dataset.key = line.key
      svg.appendChild(path)
    }

    path.setAttribute('d', line.d)
  }
}

export const TreeEdges = forwardRef<TreeEdgesHandle, TreeEdgesProps>(
  function TreeEdges({ lines, width, height }, ref) {
    const svgRef = useRef<SVGSVGElement>(null)

    useImperativeHandle(ref, () => ({
      update(nextLines, nextWidth, nextHeight) {
        const svg = svgRef.current
        if (!svg) return
        paintEdges(svg, nextLines, nextWidth, nextHeight)
      },
    }))

    useLayoutEffect(() => {
      const svg = svgRef.current
      if (!svg || !width || !height) return
      paintEdges(svg, lines, width, height)
    }, [lines, width, height])

    if (!width || !height) return null

    return (
      <svg
        ref={svgRef}
        className="tree-edges"
        width={width}
        height={height}
        aria-hidden="true"
      />
    )
  },
)
