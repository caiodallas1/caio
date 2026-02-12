
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
        // Gera ID sequencial com 5 dígitos: 00001, 00002...
        const idStr = String(nextNum).padStart(5, '0');
        
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
          const initial = { 
              ...DEFAULT_SETTINGS, 
              user_id: user.id,
              payment_methods: ['Pix', 'Cartão de Crédito (Link)'],
              next_order_number: DEFAULT_SETTINGS.nextOrderNumber,
              company_name: DEFAULT_SETTINGS.companyName
          };
          await supabase.from('settings').insert(initial);
          return initial;
      }
      
      // Mapeamento Robusto: Verifica camelCase (App) E snake_case (DB)
      return {
          companyName: data.companyName || data.company_name || DEFAULT_SETTINGS.companyName,
          companyDoc: data.companyDoc || data.company_doc || DEFAULT_SETTINGS.companyDoc,
          companyAddress: data.companyAddress || data.company_address || DEFAULT_SETTINGS.companyAddress,
          companyContact: data.companyContact || data.company_contact || DEFAULT_SETTINGS.companyContact,
          logoUrl: data.logoUrl || data.logo_url || DEFAULT_SETTINGS.logoUrl,
          quoteValidityDays: data.quoteValidityDays || data.quote_validity_days || DEFAULT_SETTINGS.quoteValidityDays,
          quoteTerms: data.quoteTerms || data.quote_terms || DEFAULT_SETTINGS.quoteTerms,
          statusesConsideredSale: data.statusesConsideredSale || data.statuses_considered_sale || DEFAULT_SETTINGS.statusesConsideredSale,
          nextOrderNumber: data.nextOrderNumber || data.next_order_number || DEFAULT_SETTINGS.nextOrderNumber,
          // Garante que array de pagamentos exista verificando ambas as chaves ou usando o padrão
          paymentMethods: (data.paymentMethods && data.paymentMethods.length > 0) 
            ? data.paymentMethods 
            : (data.payment_methods && data.payment_methods.length > 0)
                ? data.payment_methods
                : ['Pix', 'Cartão de Crédito (Link)']
      };
    },
    save: async (data: Settings) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Envia payload com ambas as convenções de nome para garantir persistência no Supabase
      const payload = {
          user_id: user.id,
          
          companyName: data.companyName,
          company_name: data.companyName,
          
          companyDoc: data.companyDoc,
          company_doc: data.companyDoc,
          
          companyAddress: data.companyAddress,
          company_address: data.companyAddress,
          
          companyContact: data.companyContact,
          company_contact: data.companyContact,
          
          logoUrl: data.logoUrl,
          logo_url: data.logoUrl,
          
          quoteValidityDays: data.quoteValidityDays,
          quote_validity_days: data.quoteValidityDays,
          
          quoteTerms: data.quoteTerms,
          quote_terms: data.quoteTerms,
          
          statusesConsideredSale: data.statusesConsideredSale,
          statuses_considered_sale: data.statusesConsideredSale,
          
          nextOrderNumber: data.nextOrderNumber,
          next_order_number: data.nextOrderNumber,
          
          paymentMethods: data.paymentMethods,
          payment_methods: data.paymentMethods
      };

      const { error } = await supabase.from('settings').upsert(payload);
      if (error) throw error;
    }
  }
};
