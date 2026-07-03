import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ROOT_ITEMS, TREE_CHILDREN } from '../data/treeConfig'
import type { TreeNode } from '../types/tree'
import { buildTreeFromConfig, isListNode } from '../utils/buildTree'
import {
  captureBranchPositions,
  runBranchFlipAnimation,
  TREE_ANIMATION_MS,
} from '../utils/treeAnimation'
import { measureEdgeLines, type EdgeLine } from '../utils/treeEdgeLayout'
import { ItemListBox } from './ItemListBox'
import { TreeEdges, type TreeEdgesHandle } from './TreeEdges'
import type { EdgeConnection } from '../utils/treeEdgeLayout'
import './TreeDiagram.css'

type TreeDiagramProps = {
  roots?: TreeNode[]
}

function collectEdgeConnections(
  nodes: TreeNode[],
  expandedIds: ReadonlySet<string>,
): EdgeConnection[] {
  const connections: EdgeConnection[] = []

  const walk = (nodeList: TreeNode[]) => {
    for (const node of nodeList) {
      if (!expandedIds.has(node.id) || !node.children?.length) continue

      connections.push({
        parentId: node.id,
        childIds: isListNode(node)
          ? [`${node.id}__list`]
          : node.children.map((child) => child.id),
      })

      if (!isListNode(node)) {
        walk(node.children)
      }
    }
  }

  walk(nodes)
  return connections
}

type TreeBranchProps = {
  node: TreeNode
  expandedIds: ReadonlySet<string>
  onToggle: (nodeId: string) => void
}

function TreeBranch({ node, expandedIds, onToggle }: TreeBranchProps) {
  const isExpanded = expandedIds.has(node.id)
  const hasChildren = Boolean(node.children?.length)
  const showList = isExpanded && hasChildren && isListNode(node)
  const showSubtree = isExpanded && hasChildren && !isListNode(node)

  return (
    <div className="tree-branch">
      <button
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
        onClick={() => onToggle(node.id)}
      >
        {node.label}
      </button>

      {showSubtree && (
        <div className="tree-subtree">
          <div className="tree-level" role="group">
            {node.children!.map((child) => (
              <TreeBranch
                key={child.id}
                node={child}
                expandedIds={expandedIds}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      )}

      {showList && (
        <div className="tree-list-block">
          <ItemListBox
            listNodeId={`${node.id}__list`}
            items={node.children!.map((child) => ({
              id: child.id,
              label: child.label,
            }))}
            parentId={node.id}
          />
        </div>
      )}
    </div>
  )
}

export function TreeDiagram({ roots }: TreeDiagramProps) {
  const tree = useMemo(
    () => roots ?? buildTreeFromConfig(ROOT_ITEMS, TREE_CHILDREN),
    [roots],
  )

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const [edgeLines, setEdgeLines] = useState<EdgeLine[]>([])
  const [edgeSize, setEdgeSize] = useState({ width: 0, height: 0 })

  const diagramRef = useRef<HTMLDivElement>(null)
  const edgesRef = useRef<TreeEdgesHandle>(null)
  const flipBeforeRef = useRef<Map<Element, DOMRect> | null>(null)
  const edgeFrameRef = useRef<number | null>(null)

  const edgeConnections = useMemo(
    () => collectEdgeConnections(tree, expandedIds),
    [tree, expandedIds],
  )

  const remeasureEdges = useCallback(
    (commit = true) => {
      const diagram = diagramRef.current
      if (!diagram) return

      const lines = measureEdgeLines(diagram, edgeConnections)
      const size = {
        width: diagram.offsetWidth,
        height: diagram.offsetHeight,
      }

      edgesRef.current?.update(lines, size.width, size.height)

      if (commit) {
        setEdgeLines(lines)
        setEdgeSize(size)
      }
    },
    [edgeConnections],
  )

  useLayoutEffect(() => {
    const diagram = diagramRef.current
    if (!diagram) return

    const before = flipBeforeRef.current
    flipBeforeRef.current = null

    if (before) {
      runBranchFlipAnimation(diagram, before)
    }

    remeasureEdges()

    if (edgeFrameRef.current !== null) {
      cancelAnimationFrame(edgeFrameRef.current)
    }

    const animationEnd = performance.now() + TREE_ANIMATION_MS
    const tick = (now: number) => {
      remeasureEdges(false)

      if (now < animationEnd) {
        edgeFrameRef.current = requestAnimationFrame(tick)
      } else {
        edgeFrameRef.current = null
        remeasureEdges()
      }
    }

    if (before) {
      edgeFrameRef.current = requestAnimationFrame(tick)
    }

    const handleResize = () => remeasureEdges()

    const observer = new ResizeObserver(handleResize)
    observer.observe(diagram)
    window.addEventListener('resize', handleResize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
      if (edgeFrameRef.current !== null) {
        cancelAnimationFrame(edgeFrameRef.current)
        edgeFrameRef.current = null
      }
    }
  }, [expandedIds, remeasureEdges])

  const handleToggle = (nodeId: string) => {
    const diagram = diagramRef.current
    if (diagram) {
      flipBeforeRef.current = captureBranchPositions(diagram)
    }

    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  return (
    <div className="tree-diagram" ref={diagramRef}>
      <TreeEdges
        ref={edgesRef}
        lines={edgeLines}
        width={edgeSize.width}
        height={edgeSize.height}
      />

      <div className="tree-level tree-level--root" role="group" aria-label="Корень">
        {tree.map((node) => (
          <TreeBranch
            key={node.id}
            node={node}
            expandedIds={expandedIds}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  )
}
