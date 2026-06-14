import { useState } from 'react'
import { TreeDiagram } from './components/TreeDiagram'
import { TreeZoomViewport } from './components/TreeZoomViewport'
import './App.css'

type AppView = 'tree' | 'tree-settings'

function App() {
  const [view, setView] = useState<AppView>('tree')

  return (
    <main className="app">
      <aside className="app__sidebar">
        <nav className="app__nav" aria-label="Главное меню">
          <button
            type="button"
            className={`app__nav-btn${view === 'tree' ? ' app__nav-btn--active' : ''}`}
            onClick={() => setView('tree')}
          >
            Дерево
          </button>
          <button
            type="button"
            className={`app__nav-btn${view === 'tree-settings' ? ' app__nav-btn--active' : ''}`}
            onClick={() => setView('tree-settings')}
          >
            Настройка дерева
          </button>
        </nav>
      </aside>

      <div className="app__body">
        {view === 'tree' && (
          <section className="app__tree-view" aria-label="Дерево">
            <h1 className="app__title">Структура вагонов</h1>
            <TreeZoomViewport>
              <TreeDiagram />
            </TreeZoomViewport>
          </section>
        )}

        {view === 'tree-settings' && (
          <section className="app__tree-settings" aria-label="Настройка дерева">
            <h1 className="app__title">Настройка дерева</h1>
          </section>
        )}
      </div>
    </main>
  )
}

export default App
