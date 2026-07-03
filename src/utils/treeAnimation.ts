export const TREE_ANIMATION_MS = 420

const TREE_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function captureBranchPositions(root: HTMLElement): Map<Element, DOMRect> {
  const map = new Map<Element, DOMRect>()
  root.querySelectorAll('.tree-branch').forEach((element) => {
    map.set(element, element.getBoundingClientRect())
  })
  return map
}

function resetBranchStyles(element: HTMLElement) {
  element.style.transition = ''
  element.style.transform = ''
  element.style.opacity = ''
}

export function runBranchFlipAnimation(
  root: HTMLElement,
  before: Map<Element, DOMRect>,
  durationMs = TREE_ANIMATION_MS,
) {
  if (prefersReducedMotion()) return

  root.querySelectorAll<HTMLElement>('.tree-branch').forEach((element) => {
    const oldRect = before.get(element)
    const newRect = element.getBoundingClientRect()

    if (oldRect) {
      const dx = oldRect.left - newRect.left
      const dy = oldRect.top - newRect.top

      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        element.style.transition = 'none'
        element.style.transform = `translate3d(${dx}px, ${dy}px, 0)`

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            element.style.transition = `transform ${durationMs}ms ${TREE_EASE}`
            element.style.transform = ''
          })
        })

        element.addEventListener(
          'transitionend',
          () => resetBranchStyles(element),
          { once: true },
        )
        return
      }
    }

    if (!oldRect) {
      element.style.opacity = '0'
      element.style.transform = 'translate3d(0, -10px, 0)'
      element.style.transition = 'none'

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          element.style.transition = `opacity ${durationMs * 0.75}ms ease, transform ${durationMs}ms ${TREE_EASE}`
          element.style.opacity = '1'
          element.style.transform = ''
        })
      })

      element.addEventListener(
        'transitionend',
        () => resetBranchStyles(element),
        { once: true },
      )
    }
  })
}
