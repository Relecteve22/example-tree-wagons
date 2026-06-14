export type TreeNode = {
  id: string
  label: string
  children?: TreeNode[]
}

/** Дочерние элементы: ключ — название родителя, значение — массив подпунктов */
export type ChildrenMap = Record<string, readonly string[]>
