import { supabase } from '../supabase';
import { WhatsAppMessage } from '../../types/supabase';

export class WhatsAppService {
  private static checkSupabase() {
    if (!supabase) {
      throw new Error('Supabase no está configurado. Por favor configura las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    return supabase;
  }

  // Obtener todos los mensajes
  static async getMessages(): Promise<WhatsAppMessage[]> {
    const client = this.checkSupabase();
    
    const { data, error } = await client
      .from('whatsapp_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Error al obtener mensajes');
    }

    return data || [];
  }

  // Crear un nuevo mensaje
  static async createMessage(message: Omit<WhatsAppMessage, 'id' | 'created_at' | 'updated_at'>): Promise<WhatsAppMessage> {
    const client = this.checkSupabase();
    
    const { data, error } = await client
      .from('whatsapp_messages')
      .insert([message])
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      throw new Error('Error al crear mensaje');
    }

    return data;
  }

  // Actualizar un mensaje
  static async updateMessage(id: string, updates: Partial<Omit<WhatsAppMessage, 'id' | 'created_at' | 'updated_at'>>): Promise<WhatsAppMessage> {
    const client = this.checkSupabase();
    
    const { data, error } = await client
      .from('whatsapp_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      throw new Error('Error al actualizar mensaje');
    }

    return data;
  }

  // Eliminar un mensaje
  static async deleteMessage(id: string): Promise<void> {
    const client = this.checkSupabase();
    
    const { error } = await client
      .from('whatsapp_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting message:', error);
      throw new Error('Error al eliminar mensaje');
    }
  }

  // Obtener mensajes pendientes
  static async getPendingMessages(): Promise<WhatsAppMessage[]> {
    const client = this.checkSupabase();
    
    const { data, error } = await client
      .from('whatsapp_messages')
      .select('*')
      .eq('status', 'pending')
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Error fetching pending messages:', error);
      throw new Error('Error al obtener mensajes pendientes');
    }

    return data || [];
  }

  // Marcar mensaje como enviado
  static async markAsSent(id: string): Promise<WhatsAppMessage> {
    return this.updateMessage(id, { status: 'sent' });
  }


  // Obtener estadísticas
  static async getStats(): Promise<{ pending: number; sent: number }> {
    const client = this.checkSupabase();
    
    const { data, error } = await client
      .from('whatsapp_messages')
      .select('status');

    if (error) {
      console.error('Error fetching stats:', error);
      throw new Error('Error al obtener estadísticas');
    }

    const stats = data?.reduce((acc, message) => {
      acc[message.status] = (acc[message.status] || 0) + 1;
      return acc;
    }, { pending: 0, sent: 0 } as Record<string, number>);

    return {
      pending: stats?.pending || 0,
      sent: stats?.sent || 0,
    };
  }
}
