import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ROOT_ITEMS, TREE_CHILDREN } from '../data/treeConfig'
import type { TreeNode } from '../types/tree'
import {
  buildTreeFromConfig,
  findNodeByPath,
  isListNode,
} from '../utils/buildTree'
import { clientPointToLocal } from '../utils/layoutCoords'
import { ItemListBox } from './ItemListBox'
import { TreeEdges, type EdgeConnection } from './TreeEdges'
import './TreeDiagram.css'

type TreeDiagramProps = {
  roots?: TreeNode[]
}

function buildVisibleLevels(
  roots: TreeNode[],
  expandedPath: string[],
): TreeNode[][] {
  const levels: TreeNode[][] = [roots]
  let currentNodes = roots

  for (const selectedId of expandedPath) {
    const selectedNode = currentNodes.find((node) => node.id === selectedId)
    if (!selectedNode?.children?.length || isListNode(selectedNode)) {
      break
    }
    levels.push(selectedNode.children)
    currentNodes = selectedNode.children
  }

  return levels
}

export function TreeDiagram({ roots }: TreeDiagramProps) {
  const tree = useMemo(
    () => roots ?? buildTreeFromConfig(ROOT_ITEMS, TREE_CHILDREN),
    [roots],
  )

  const [expandedPath, setExpandedPath] = useState<string[]>([])
  const diagramRef = useRef<HTMLDivElement>(null)
  const listBlockRef = useRef<HTMLDivElement>(null)
  const [listOffset, setListOffset] = useState(0)

  const levels = buildVisibleLevels(tree, expandedPath)

  const listParent =
    expandedPath.length > 0 ? findNodeByPath(tree, expandedPath) : null

  const listItems =
    listParent && isListNode(listParent)
      ? listParent.children!.map((child) => child.label)
      : null

  const edgeConnections = useMemo<EdgeConnection[]>(() => {
    const connections: EdgeConnection[] = []

    for (let levelIndex = 1; levelIndex < levels.length; levelIndex++) {
      const parentId = expandedPath[levelIndex - 1]
      if (!parentId) continue

      connections.push({
        parentId,
        childIds: levels[levelIndex].map((node) => node.id),
      })
    }

    if (listItems && listParent) {
      connections.push({
        parentId: listParent.id,
        childIds: [`${listParent.id}__list`],
      })
    }

    return connections
  }, [levels, expandedPath, listItems, listParent])

  useLayoutEffect(() => {
    if (!listParent || !diagramRef.current || !listBlockRef.current) {
      setListOffset(0)
      return
    }

    const parent = diagramRef.current.querySelector<HTMLElement>(
      `[data-node-id="${listParent.id}"]`,
    )
    if (!parent) return

    const diagram = diagramRef.current
    const parentRect = parent.getBoundingClientRect()
    const parentCenter = clientPointToLocal(
      diagram,
      parentRect.left + parentRect.width / 2,
      parentRect.top,
    )

    // List block is centered in the diagram via flex; marginLeft shifts from that point.
    setListOffset(parentCenter.x - diagram.offsetWidth / 2)
  }, [listParent, levels, expandedPath])

  const handleNodeClick = (node: TreeNode, levelIndex: number) => {
    setExpandedPath((prev) => {
      if (prev[levelIndex] === node.id) {
        return prev.slice(0, levelIndex)
      }
      const next = prev.slice(0, levelIndex)
      next[levelIndex] = node.id
      return next
    })
  }

  return (
    <div className="tree-diagram" ref={diagramRef}>
      <TreeEdges
        diagramRef={diagramRef}
        connections={edgeConnections}
        layoutKey={listOffset}
      />

      {levels.map((nodes, levelIndex) => (
        <div key={`level-${levelIndex}`} className="tree-level-block">
          <div
            className="tree-level"
            data-level={levelIndex + 1}
            role="group"
            aria-label={`Уровень ${levelIndex + 1}`}
          >
            {nodes.map((node) => {
              const isExpanded = expandedPath[levelIndex] === node.id
              const hasChildren = Boolean(node.children?.length)

              return (
                <button
                  key={node.id}
                  type="button"
                  className={[
                    'tree-node',
                    isExpanded ? 'tree-node--expanded' : '',
                    hasChildren ? 'tree-node--clickable' : 'tree-node--empty',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  data-node-id={node.id}
                  disabled={!hasChildren}
                  onClick={() => handleNodeClick(node, levelIndex)}
                >
                  {node.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {listItems && listParent && (
        <div
          ref={listBlockRef}
          className="tree-level-block tree-level-block--list"
          data-node-id={`${listParent.id}__list`}
          style={{ marginLeft: listOffset }}
        >
          <ItemListBox items={listItems} parentId={listParent.id} />
        </div>
      )}
    </div>
  )
}
