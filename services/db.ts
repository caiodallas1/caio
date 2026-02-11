
import { Client, Product, Order, Expense, Settings, DEFAULT_SETTINGS } from '../types';
import { supabase } from './supabase';

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const db = {
  clients: {
    list: async (): Promise<Client[]> => {
      const { data, error } = await supabase.from('clients').select('*').order('name');
      if (error) throw error;
      return data || [];
    },
    save: async (data: Client) => {
      const { error } = await supabase.from('clients').upsert(data);
      if (error) throw error;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    },
    get: async (id: string): Promise<Client | undefined> => {
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
      if (error) return undefined;
      return data;
    }
  },
  products: {
    list: async (): Promise<Product[]> => {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      return data || [];
    },
    save: async (data: Product) => {
      const { error } = await supabase.from('products').upsert(data);
      if (error) throw error;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    get: async (id: string): Promise<Product | undefined> => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) return undefined;
      return data;
    }
  },
  orders: {
    list: async (): Promise<Order[]> => {
      const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    save: async (data: Order) => {
      const { error } = await supabase.from('orders').upsert(data);
      if (error) throw error;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    },
    get: async (id: string): Promise<Order | undefined> => {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (error) return undefined;
      return data;
    },
    getNextOrderId: async (): Promise<string> => {
        const settings = await db.settings.get();
        const nextNum = settings.nextOrderNumber || 1;
        const idStr = String(nextNum).padStart(4, '0');
        // Atualiza o próximo número nas configurações para o próximo pedido
        await db.settings.save({ ...settings, nextOrderNumber: nextNum + 1 });
        return idStr;
    }
  },
  expenses: {
    list: async (): Promise<Expense[]> => {
      const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    save: async (data: Expense) => {
      const { error } = await supabase.from('expenses').upsert(data);
      if (error) throw error;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    }
  },
  settings: {
    get: async (): Promise<Settings> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return DEFAULT_SETTINGS;

      const { data, error } = await supabase.from('settings').select('*').eq('user_id', user.id).single();
      
      if (error || !data) {
          // Se não houver configurações, cria uma linha padrão para o usuário
          const initial = { ...DEFAULT_SETTINGS, user_id: user.id };
          await supabase.from('settings').insert(initial);
          return initial;
      }
      return data;
    },
    save: async (data: Settings) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { error } = await supabase.from('settings').upsert({ ...data, user_id: user.id });
      if (error) throw error;
    }
  }
};
