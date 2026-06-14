import { useEffect, useRef, useState, type ReactNode } from 'react'
import './TreeZoomViewport.css'

const MIN_ZOOM = 0.6
const MAX_ZOOM = 1.4
const ZOOM_SENSITIVITY = 0.001

type TreeZoomViewportProps = {
  children: ReactNode
}

export function TreeZoomViewport({ children }: TreeZoomViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      setZoom((current) => {
        const next = current - event.deltaY * ZOOM_SENSITIVITY
        return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next))
      })
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <div className="tree-zoom-viewport" ref={viewportRef}>
      <div
        className="tree-zoom-viewport__content"
        style={{ transform: `scale(${zoom})` }}
      >
        {children}
      </div>
    </div>
  )
}
