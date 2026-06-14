import type { ChildrenMap, TreeNode } from '../types/tree'

function makeId(path: number[]): string {
  return path.join('-')
}

function buildBranch(
  label: string,
  path: number[],
  childrenMap: ChildrenMap,
): TreeNode {
  const id = makeId(path)
  const childLabels = childrenMap[label]

  if (!childLabels?.length) {
    return { id, label }
  }

  return {
    id,
    label,
    children: childLabels.map((childLabel, index) =>
      buildBranch(childLabel, [...path, index], childrenMap),
    ),
  }
}

export function buildTreeFromConfig(
  rootItems: readonly string[],
  childrenMap: ChildrenMap,
): TreeNode[] {
  return rootItems.map((label, index) => buildBranch(label, [index], childrenMap))
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
