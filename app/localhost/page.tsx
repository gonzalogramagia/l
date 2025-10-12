'use client'

import { useState, useEffect } from 'react'

interface TextBlock {
  id: string
  title: string
  content: string
}

export default function LocalhostPage() {
  const [blocks, setBlocks] = useState<TextBlock[]>([])
  // ahora usamos IDs cortos tipo hash de 4 caracteres

  // Cargar datos del localStorage al montar el componente
  useEffect(() => {
    const savedBlocks = localStorage.getItem('localhost-blocks')

    if (savedBlocks) {
      try {
        const parsed = JSON.parse(savedBlocks)
        // migrate titles that were auto-generated as "Bloque <id>" to empty so placeholder shows
        const migrated = (parsed as any[]).map(b => {
          if (b && typeof b.title === 'string' && /^Bloque [a-z0-9]{4}$/i.test(b.title)) {
            return { ...b, title: '' }
          }
          return b
        })
        setBlocks(migrated)
      } catch (e) {
        setBlocks(JSON.parse(savedBlocks))
      }
    }
  }, [])

  // Guardar en localStorage cada vez que cambien los bloques
  useEffect(() => {
    localStorage.setItem('localhost-blocks', JSON.stringify(blocks))
  }, [blocks])

  // Genera un hash corto de 4 caracteres (alfa-numérico) y evita colisiones
  const generateId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const make = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    let id = make()
    // en el improbable caso de colisión, volver a generar hasta que sea único
    const existing = new Set(blocks.map(b => b.id))
    while (existing.has(id)) {
      id = make()
    }
    return id
  }

  const addBlock = () => {
    const id = generateId()
    const newBlock: TextBlock = {
      id,
      title: '',
      content: ''
    }
    setBlocks([...blocks, newBlock])
  }

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ))
  }

  const updateBlockTitle = (id: string, title: string) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, title } : block
    ))
  }

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id))
  }


  return (
    <section className="mb-8">
      <div className="mb-8">
        <h1 className="mb-4 text-2xl font-semibold tracking-tighter">
          Localhost Notes
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Bloque de notas que se guardan automáticamente en tu navegador
        </p>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={addBlock}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            + Agregar Bloque
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {blocks.slice().reverse().map((block) => (
          <div key={block.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2 gap-3">
              <input
                type="text"
                value={block.title}
                onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                className="flex-1 text-sm font-medium px-2 py-1 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                placeholder={"Nombre del bloque..."}
              />
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">#{block.id}</span>
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm cursor-pointer"
                  aria-label={`Eliminar ${block.title}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                    <path d="M9 3a1 1 0 00-1 1v1H4a1 1 0 100 2h16a1 1 0 100-2h-4V4a1 1 0 00-1-1H9zM7 9a1 1 0 011 1v7a2 2 0 002 2h4a2 2 0 002-2v-7a1 1 0 112 0v7a4 4 0 01-4 4h-4a4 4 0 01-4-4v-7a1 1 0 011-1z" />
                  </svg>
                  <span className="ml-0.5">Eliminar</span>
                </button>
              </div>
            </div>

            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              placeholder="Escribe aquí..."
              className="w-full min-h-[100px] p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-y bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus={blocks.length === 1 && block.content === ''}
            />

            <div className="text-xs text-gray-400 mt-2">
              {block.content.length} caracteres
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
