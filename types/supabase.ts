export interface WhatsAppMessage {
  id: string;
  recipient: string;
  message: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'pending' | 'sent';
  created_at: string;
  updated_at: string;
}

export interface ClickUpTask {
  id: string;
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  list_id?: string;
  list_name?: string;
  space_id?: string;
  space_name?: string;
  created_at: string;
  updated_at: string;
}

export interface FinanceData {
  id: string;
  date: string;
  description: string;
  amount: number;
  category?: string;
  type: 'income' | 'expense';
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  clickup_token?: string;
  google_sheets_id?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  resource?: string;
  details?: any;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      whatsapp_messages: {
        Row: WhatsAppMessage;
        Insert: Omit<WhatsAppMessage, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<WhatsAppMessage, 'id' | 'created_at' | 'updated_at'>>;
      };
      clickup_tasks: {
        Row: ClickUpTask;
        Insert: Omit<ClickUpTask, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ClickUpTask, 'id' | 'created_at' | 'updated_at'>>;
      };
      finance_data: {
        Row: FinanceData;
        Insert: Omit<FinanceData, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FinanceData, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, 'id' | 'created_at'>;
        Update: Partial<Omit<ActivityLog, 'id' | 'created_at'>>;
      };
    };
  };
}
