export function getLayoutScale(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  return {
    scaleX: rect.width > 0 ? element.offsetWidth / rect.width : 1,
    scaleY: rect.height > 0 ? element.offsetHeight / rect.height : 1,
  }
}

export function clientPointToLocal(
  container: HTMLElement,
  clientX: number,
  clientY: number,
) {
  const rect = container.getBoundingClientRect()
  const { scaleX, scaleY } = getLayoutScale(container)

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  }
}
