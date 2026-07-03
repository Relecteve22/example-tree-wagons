import type { ChildrenMap, TreeNode } from '../types/tree'

function makeId(path: number[]): string {
  return path.join('-')
}

function getChildLabels(
  label: string,
  parentLabel: string | undefined,
  childrenMap: ChildrenMap,
): readonly string[] | undefined {
  if (parentLabel) {
    const scopedKey = `${parentLabel}|${label}`
    const scopedChildren = childrenMap[scopedKey]
    if (scopedChildren?.length) {
      return scopedChildren
    }
  }

  return childrenMap[label]
}

function buildBranch(
  label: string,
  path: number[],
  childrenMap: ChildrenMap,
  parentLabel?: string,
): TreeNode {
  const id = makeId(path)
  const childLabels = getChildLabels(label, parentLabel, childrenMap)

  if (!childLabels?.length) {
    return { id, label }
  }

  return {
    id,
    label,
    children: childLabels.map((childLabel, index) =>
      buildBranch(childLabel, [...path, index], childrenMap, label),
    ),
  }
}

export function buildTreeFromConfig(
  rootItems: readonly string[],
  childrenMap: ChildrenMap,
): TreeNode[] {
  return rootItems.map((label, index) =>
    buildBranch(label, [index], childrenMap),
  )
}

export function findNodeByPath(
  roots: TreeNode[],
  pathIds: string[],
): TreeNode | null {
  let nodes = roots
  let current: TreeNode | null = null

  for (const id of pathIds) {
    current = nodes.find((node) => node.id === id) ?? null
    if (!current) return null
    nodes = current.children ?? []
  }

  return current
}

/** Листья без потомков — показываем синим списком, а не зелёными узлами */
export function isListNode(node: TreeNode): boolean {
  if (!node.children?.length) return false
  return node.children.every((child) => !child.children?.length)
}
