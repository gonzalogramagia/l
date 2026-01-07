'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import { WhatsAppService } from '../../../lib/services/whatsapp';
import { WhatsAppMessage } from '../../../types/supabase';

// Usar el tipo de Supabase en lugar de la interfaz local
type ScheduledMessage = WhatsAppMessage;

export default function WhatsAppPage() {
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ScheduledMessage | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ScheduledMessage | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent'>('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticación al inicializar
  useEffect(() => {
    const authStatus = sessionStorage.getItem('whatsapp_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Cargar mensajes desde Supabase
  useEffect(() => {
    if (isAuthenticated) {
      loadMessages();
    }
  }, [isAuthenticated]);

  const loadMessages = async () => {
    try {
      const messages = await WhatsAppService.getMessages();
      setMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Verificar mensajes que deberían enviarse
  useEffect(() => {
    const checkScheduledMessages = () => {
      const now = new Date();
      const currentDateTime = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM

      messages.forEach(message => {
        if (message.status === 'pending') {
          const scheduledDateTime = `${message.scheduled_date}T${message.scheduled_time}`;
          
          if (currentDateTime >= scheduledDateTime) {
            // Mostrar notificación
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('WhatsApp - Mensaje programado', {
                body: `Es hora de enviar el mensaje a ${message.recipient}`,
                icon: '/favicon.ico'
              });
            }
            
            // Actualizar estado a "sent"
            setMessages(prev => prev.map(msg => 
              msg.id === message.id ? { ...msg, status: 'sent' as const } : msg
            ));
          }
        }
      });
    };

    // Verificar cada minuto
    const interval = setInterval(checkScheduledMessages, 60000);
    checkScheduledMessages(); // Verificar inmediatamente

    return () => clearInterval(interval);
  }, [messages]);

  // Solicitar permisos de notificación
  useEffect(() => {
    if (isAuthenticated && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isAuthenticated]);

  const handleLogin = async (password: string) => {
    if (!password.trim()) {
      setError('Por favor ingresa una contraseña');
      return;
    }
    setIsAuthenticating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/whatsapp/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem('whatsapp_auth', 'true');
        setIsAuthenticated(true);
        setError(null);
      } else {
        setError(data.error || 'Error al autenticar');
      }
    } catch (err) {
      setError('Error de conexión');
    }
    
    setIsAuthenticating(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setMessages([]);
    setError(null);
    sessionStorage.removeItem('whatsapp_auth');
  };

  const handleAddMessage = async (newMessage: Omit<ScheduledMessage, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      const message = await WhatsAppService.createMessage({
        ...newMessage,
        status: 'pending'
      });
      setMessages(prev => [message, ...prev]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating message:', error);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await WhatsAppService.deleteMessage(id);
      setMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleCancelMessage = (id: string) => {
    const message = messages.find(msg => msg.id === id);
    if (message) {
      setMessageToDelete(message);
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    
    try {
      await WhatsAppService.deleteMessage(messageToDelete.id);
      setMessages(prev => prev.filter(msg => msg.id !== messageToDelete.id));
      setShowDeleteModal(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleMarkAsSent = async (id: string) => {
    try {
      const updatedMessage = await WhatsAppService.markAsSent(id);
      setMessages(prev => prev.map(msg => 
        msg.id === id ? updatedMessage : msg
      ));
    } catch (error) {
      console.error('Error marking message as sent:', error);
    }
  };

  // Filtrar mensajes según el estado seleccionado
  const filteredMessages = messages.filter(message => {
    if (statusFilter === 'all') return true;
    return message.status === statusFilter;
  });

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    const dayName = dateObj.toLocaleDateString('es-AR', { 
      timeZone: 'America/Argentina/Buenos_Aires',
      weekday: 'long' 
    });
    const dayNameCapitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
    const formattedDate = dateObj.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedTime = dateObj.toLocaleTimeString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    return `el ${dayNameCapitalized} ${formattedDate} a las ${formattedTime}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/20';
      case 'sent': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'sent': return 'Enviado';
      default: return 'Desconocido';
    }
  };

  const [stats, setStats] = useState({ pending: 0, sent: 0 });

  // Cargar estadísticas
  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    try {
      const statsData = await WhatsAppService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const pendingMessages = messages.filter(msg => msg.status === 'pending');
  const sentMessages = messages.filter(msg => msg.status === 'sent');

  // Pantalla de login
  if (!isAuthenticated) {
    return (
      <div className="w-full pb-16 pt-6">
        <Header />
        <LoginForm 
          onLogin={handleLogin}
          isAuthenticating={isAuthenticating}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full pb-2 pt-6">
        <div className="px-1 lg:px-0 max-w-4xl mx-auto">
          {/* Header */}
                 <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                       <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                       </svg>
                     </div>
                     <div>
                       <h1 className="text-2xl font-bold text-white">WhatsApp</h1>
                       <p className="text-sm text-gray-400">Programar mensajes</p>
                     </div>
                   </div>

                   <button
                     onClick={() => setShowAddModal(true)}
                     className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors cursor-pointer"
                   >
                     + Programar Mensaje
                   </button>
                 </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div 
              onClick={() => setStatusFilter('pending')}
              className={`bg-gray-900 rounded-lg p-4 border border-gray-800 cursor-pointer transition-all hover:bg-gray-800 ${
                statusFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => setStatusFilter('sent')}
              className={`bg-gray-900 rounded-lg p-4 border border-gray-800 cursor-pointer transition-all hover:bg-gray-800 ${
                statusFilter === 'sent' ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Enviados</p>
                  <p className="text-2xl font-bold text-green-500">{stats.sent}</p>
                </div>
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filtro activo */}
          {statusFilter !== 'all' && (
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  Mostrando: {statusFilter === 'pending' ? 'Pendientes' : 'Enviados'}
                </span>
                <span className="text-xs text-gray-500">
                  ({filteredMessages.length} mensaje{filteredMessages.length !== 1 ? 's' : ''})
                </span>
              </div>
              <button
                onClick={() => setStatusFilter('all')}
                className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                Ver todos
              </button>
            </div>
          )}

          {/* Lista de mensajes */}
          <div className="space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-800">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {statusFilter === 'all' 
                    ? 'No hay mensajes programados' 
                    : statusFilter === 'pending' 
                      ? 'No hay mensajes pendientes' 
                      : 'No hay mensajes enviados'
                  }
                </h3>
                <p className="text-gray-400 mb-4">
                  {statusFilter === 'all' 
                    ? 'Programa tu primer mensaje de WhatsApp' 
                    : statusFilter === 'pending' 
                      ? 'Todos los mensajes han sido enviados' 
                      : 'Aún no has enviado ningún mensaje'
                  }
                </p>
                {statusFilter === 'all' && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    Programar Mensaje
                  </button>
                )}
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedMessage(message);
                    setShowDetailsModal(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-white">
                          {message.recipient}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(message.status)}`}>
                          {getStatusText(message.status)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                        {message.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        Programado para {formatDateTime(message.scheduled_date, message.scheduled_time)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {message.status === 'pending' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsSent(message.id);
                            }}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md transition-colors cursor-pointer"
                            title="Marcar como enviado"
                          >
                            Marcar como enviado
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelMessage(message.id);
                            }}
                            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
                            title="Eliminar mensaje"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Botón de salir al final */}
          <div className="mt-6 flex justify-start">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors cursor-pointer text-sm"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Modal para agregar mensaje */}
      {showAddModal && (
        <AddMessageModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMessage}
        />
      )}

      {/* Modal para ver detalles */}
      {showDetailsModal && selectedMessage && (
        <MessageDetailsModal
          message={selectedMessage}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMessage(null);
          }}
          onDelete={handleDeleteMessage}
          onCancel={handleCancelMessage}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && messageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Eliminar mensaje</h3>
                <p className="text-sm text-gray-400">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-2">
                <strong>Para:</strong> {messageToDelete.recipient}
              </p>
              <p className="text-gray-300 mb-2">
                <strong>Mensaje:</strong> {messageToDelete.message}
              </p>
              <p className="text-gray-300">
                <strong>Programado para:</strong> {formatDateTime(messageToDelete.scheduled_date, messageToDelete.scheduled_time)}
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMessageToDelete(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteMessage}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para agregar mensaje
function AddMessageModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (message: Omit<ScheduledMessage, 'id' | 'created_at' | 'updated_at' | 'status'>) => void;
}) {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !message.trim() || !scheduledDate || !scheduledTime) return;
    
    onAdd({
      recipient: recipient.trim(),
      message: message.trim(),
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime
    });
  };

  const isFormValid = recipient.trim() && message.trim() && scheduledDate && scheduledTime;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-gray-900 backdrop-blur-sm rounded-xl p-6 max-w-2xl w-full shadow-2xl border border-gray-800" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-white">Programar Mensaje</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Número o nombre del destinatario *</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: +54 9 11 1234-5678 o Juan Pérez"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Mensaje *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={4}
              placeholder="Escribe tu mensaje aquí..."
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Fecha *</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Hora *</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Recordatorio</p>
                <p>Te notificaremos cuando sea hora de enviar el mensaje. Deberás enviarlo manualmente desde WhatsApp.</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!isFormValid}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              Programar Mensaje
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors font-medium cursor-pointer text-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente para ver detalles del mensaje
function MessageDetailsModal({ message, onClose, onDelete, onCancel }: {
  message: ScheduledMessage;
  onClose: () => void;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    const dayName = dateObj.toLocaleDateString('es-AR', { 
      timeZone: 'America/Argentina/Buenos_Aires',
      weekday: 'long' 
    });
    const dayNameCapitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
    const formattedDate = dateObj.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedTime = dateObj.toLocaleTimeString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    return `el ${dayNameCapitalized} ${formattedDate} a las ${formattedTime}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/20';
      case 'sent': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'sent': return 'Enviado';
      default: return 'Desconocido';
    }
  };

  const handleOpenWhatsApp = () => {
    const phoneNumber = message.recipient.replace(/\D/g, ''); // Solo números
    const encodedMessage = encodeURIComponent(message.message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-gray-900 backdrop-blur-sm rounded-xl p-6 max-w-2xl w-full shadow-2xl border border-gray-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white">Detalles del Mensaje</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 cursor-pointer"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Destinatario</label>
            <p className="text-white">{message.recipient}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Mensaje</label>
            <p className="text-white whitespace-pre-wrap">{message.message}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Programado para</label>
            <p className="text-white">{formatDateTime(message.scheduled_date, message.scheduled_time)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(message.status)}`}>
              {getStatusText(message.status)}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Creado</label>
            <p className="text-white">
              {new Date(message.created_at).toLocaleString('es-AR', {
                timeZone: 'America/Argentina/Buenos_Aires',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          {message.status === 'pending' && (
            <button
              onClick={handleOpenWhatsApp}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-center cursor-pointer"
            >
              Abrir en WhatsApp
            </button>
          )}
          {message.status === 'pending' && (
            <button
              onClick={() => onCancel(message.id)}
              className="px-4 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={() => onDelete(message.id)}
            className="px-4 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer"
          >
            Eliminar
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors font-medium cursor-pointer text-white"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
