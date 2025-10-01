'use client'

import { useState, useEffect } from 'react'

interface TextBlock {
  id: string
  content: string
}

export default function LocalhostPage() {
  const [blocks, setBlocks] = useState<TextBlock[]>([])
  const [nextId, setNextId] = useState(1)

  // Cargar datos del localStorage al montar el componente
  useEffect(() => {
    const savedBlocks = localStorage.getItem('localhost-blocks')
    const savedNextId = localStorage.getItem('localhost-next-id')
    
    if (savedBlocks) {
      setBlocks(JSON.parse(savedBlocks))
    }
    if (savedNextId) {
      setNextId(parseInt(savedNextId))
    }
  }, [])

  // Guardar en localStorage cada vez que cambien los bloques
  useEffect(() => {
    localStorage.setItem('localhost-blocks', JSON.stringify(blocks))
  }, [blocks])

  // Guardar el próximo ID
  useEffect(() => {
    localStorage.setItem('localhost-next-id', nextId.toString())
  }, [nextId])

  const addBlock = () => {
    const newBlock: TextBlock = {
      id: nextId.toString(),
      content: ''
    }
    setBlocks([...blocks, newBlock])
    setNextId(nextId + 1)
  }

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
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
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Bloque #{block.id}
              </span>
              <button
                onClick={() => deleteBlock(block.id)}
                className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
              >
                ✕ Eliminar
              </button>
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
