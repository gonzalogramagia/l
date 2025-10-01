'use client'

import { useState } from 'react'

export default function SendPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          message,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al enviar el email')
      }

      setStatus('success')
      setSubject('')
      setMessage('')
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  return (
    <section className="mb-16">
      <div className="mb-8">
        <h1 className="mb-4 text-2xl font-semibold tracking-tighter">
          Enviar Mensaje
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Envía un mensaje rápido que llegará a gonzalogramagia@gmail.com
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            Asunto
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Escribe el asunto..."
            required
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Mensaje
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            required
            rows={8}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-y bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-xs text-gray-400 mt-2">
            {message.length} caracteres
          </div>
        </div>

        {status === 'success' && (
          <div className="p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
            ✓ Mensaje enviado correctamente
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
            ✗ {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          {status === 'sending' ? (
            'Enviando...'
          ) : (
            <>
              <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Enviar Mensaje
            </>
          )}
        </button>
      </form>
    </section>
  )
}

