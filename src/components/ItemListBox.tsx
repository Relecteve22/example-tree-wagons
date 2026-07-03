export type ListItem = {
  id: string
  label: string
}

type ItemListBoxProps = {
  items: ListItem[]
  parentId: string
  listNodeId: string
}

export function ItemListBox({ items, parentId, listNodeId }: ItemListBoxProps) {
  return (
    <div
      className="item-list-box"
      data-node-id={listNodeId}
      data-parent-id={parentId}
    >
      <ul className="item-list">
        {items.map((item) => (
          <li key={item.id} className="item-list__row">
            <span className="item-list__label">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
