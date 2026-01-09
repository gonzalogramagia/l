
import React from 'react'

export function CopyableItem({ children, copyText, className = "" }: { children: React.ReactNode, copyText: string, className?: string }) {
  const [copied, setCopied] = React.useState(false)

  // Función para detectar si es un emoji o una letra/signo
  const isEmoji = (text: string) => {
    // Emojis generalmente tienen más de 1 carácter en UTF-16 o están en rangos específicos
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
    return emojiRegex.test(text) || text.length > 1
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('🖱️ Click detectado en:', copyText)

    try {
      // Intentar copiar al portapapeles
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(copyText)
        console.log('✅ Copiado con clipboard API:', copyText)
      } else {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea')
        textArea.value = copyText
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        console.log('✅ Copiado con execCommand:', copyText)
      }

      setCopied(true)

      // Mostrar mensaje por 2 segundos
      setTimeout(() => {
        setCopied(false)
        console.log('🔄 Reset copiado')
      }, 2000)

    } catch (err) {
      console.error('❌ Error al copiar:', err)
      // Mostrar mensaje de error
      alert(`Error al copiar: ${copyText}`)
    }
  }

  return (
    <>
      <span
        className={`cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 rounded px-2 py-1 transition-all duration-200 relative inline-block border-2 border-transparent hover:border-blue-300 ${className}`}
        onClick={handleClick}
        title={`Hacer clic para copiar: ${copyText}`}
      >
        {children}
      </span>

      {/* Popup de éxito */}
      {copied && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg border border-green-600 animate-bounce">
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span className="font-semibold">
              <span className={`px-2 py-1 rounded ${isEmoji(copyText)
                ? 'bg-green-600 bg-opacity-5'
                : 'bg-green-600 bg-opacity-5 text-white'
                }`}>
                {`${copyText}`}
              </span>
              <span className="ml-2">¡Copiado!</span>
            </span>
          </div>
        </div>
      )}
    </>
  )
}
