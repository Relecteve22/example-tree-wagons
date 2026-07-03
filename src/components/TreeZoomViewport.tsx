import { useEffect, useRef, type ReactNode } from 'react'
import './TreeZoomViewport.css'

const MIN_ZOOM = 0.6
const MAX_ZOOM = 1.4
const ZOOM_SENSITIVITY = 0.001

const BLOCK_PAN_SELECTOR =
  '.tree-node, .item-list-box, .app__sidebar, .app__nav, .app__nav-btn'

function canPanFromTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return !target.closest(BLOCK_PAN_SELECTOR)
}

type TreeZoomViewportProps = {
  children: ReactNode
}

export function TreeZoomViewport({ children }: TreeZoomViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const panXRef = useRef(0)
  const panYRef = useRef(0)
  const zoomRef = useRef(1)

  const applyTransform = () => {
    const content = contentRef.current
    if (!content) return
    content.style.transform = `translate3d(${panXRef.current}px, ${panYRef.current}px, 0) scale(${zoomRef.current})`
  }

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()

      const rect = viewport.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      const oldZoom = zoomRef.current
      const newZoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, oldZoom - event.deltaY * ZOOM_SENSITIVITY),
      )

      if (newZoom === oldZoom) return

      const contentX = (mouseX - panXRef.current) / oldZoom
      const contentY = (mouseY - panYRef.current) / oldZoom

      panXRef.current = mouseX - contentX * newZoom
      panYRef.current = mouseY - contentY * newZoom
      zoomRef.current = newZoom
      applyTransform()
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', handleWheel)
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    let active = false
    let startX = 0
    let startPanX = 0

    const stopPan = () => {
      if (!active) return
      active = false
      viewport.classList.remove('tree-zoom-viewport--panning')
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0 || !canPanFromTarget(event.target)) return

      active = true
      startX = event.clientX
      startPanX = panXRef.current
      viewport.classList.add('tree-zoom-viewport--panning')
      event.preventDefault()
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!active) return
      panXRef.current = startPanX + (event.clientX - startX)
      applyTransform()
    }

    viewport.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', stopPan)

    return () => {
      viewport.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', stopPan)
    }
  }, [])

  return (
    <div className="tree-zoom-viewport" ref={viewportRef}>
      <div className="tree-zoom-viewport__content" ref={contentRef}>
        {children}
      </div>
    </div>
  )
}
