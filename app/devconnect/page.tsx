'use client';

import { useState } from 'react';
import Header from './components/Header';
import LoginForm from './components/LoginForm';

export default function DevconnectPage() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (password: string) => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const response = await fetch('/api/notion/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Redirigir a Devconnect
        window.location.href = 'https://www.notion.so/Devconnect-ARG-2025-2872cb4faa9c80bda01dc3a30973d76e';
      } else {
        setError('Contraseña incorrecta');
      }
    } catch (err) {
      setError('Error al autenticar');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="bg-black">
      <Header />
      <LoginForm 
        onLogin={handleLogin}
        isAuthenticating={isAuthenticating}
        error={error}
      />
    </div>
  );
}