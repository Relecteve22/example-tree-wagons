type ItemListBoxProps = {
  items: string[]
  parentId: string
}

export function ItemListBox({ items, parentId }: ItemListBoxProps) {
  return (
    <div className="item-list-box" data-parent-id={parentId}>
      <ul className="item-list">
        {items.map((item) => (
          <li key={item} className="item-list__row">
            <span className="item-list__label">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
