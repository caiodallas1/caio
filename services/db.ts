
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
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { 
          id: data.id,
          user_id: user?.id,
          name: data.name,
          whatsapp: data.whatsapp,
          email: data.email,
          doc: data.doc,
          address: data.address,
          notes: data.notes
      };
      const { error } = await supabase.from('clients').upsert(payload);
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
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { 
          id: data.id,
          user_id: user?.id,
          name: data.name,
          code: data.code,
          image: data.image,
          description: data.description,
          unit: data.unit,
          price: data.price,
          cost: data.cost,
          active: data.active,
          category: data.category
      };
      const { error } = await supabase.from('products').upsert(payload);
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
      
      return (data || []).map(row => ({
          id: row.id,
          user_id: row.user_id,
          clientId: row.client_id,
          date: row.date,
          status: row.status,
          items: row.items,
          freightPrice: row.freight_price ?? 0,
          freightChargedToCustomer: row.freight_charged_to_customer ?? true,
          discount: row.discount ?? 0,
          discountType: row.discount_type || 'money',
          paymentMethod: row.payment_method || '',
          notes: row.notes,
          createdAt: row.created_at,
          externalProductionLink: row.external_production_link,
          trackingCode: row.tracking_code,
          trackingUrl: row.tracking_url
      }));
    },
    save: async (data: Order) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = {
          id: data.id,
          user_id: user?.id,
          date: data.date,
          status: data.status,
          items: data.items, 
          discount: data.discount,
          notes: data.notes,
          
          client_id: data.clientId,
          freight_price: data.freightPrice,
          freight_charged_to_customer: data.freightChargedToCustomer,
          discount_type: data.discountType,
          payment_method: data.paymentMethod,
          created_at: data.createdAt,
          
          external_production_link: data.externalProductionLink,
          tracking_code: data.trackingCode,
          tracking_url: data.trackingUrl
      };

      const { error } = await supabase.from('orders').upsert(payload);
      if (error) throw error;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    },
    get: async (id: string): Promise<Order | undefined> => {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (error) return undefined;
      
      return {
          id: data.id,
          clientId: data.client_id,
          date: data.date,
          status: data.status,
          items: data.items,
          freightPrice: data.freight_price ?? 0,
          freightChargedToCustomer: data.freight_charged_to_customer ?? true,
          discount: data.discount ?? 0,
          discountType: data.discount_type || 'money',
          paymentMethod: data.payment_method || '',
          notes: data.notes,
          createdAt: data.created_at,
          externalProductionLink: data.external_production_link,
          trackingCode: data.tracking_code,
          trackingUrl: data.tracking_url
      };
    },
    getPublic: async (id: string): Promise<{ order: Order, clientName: string } | undefined> => {
        // Esta função NÃO deve usar auth.getUser(), pois é pública
        const { data: orderData, error } = await supabase.from('orders').select('*').eq('id', id).single();
        if (error || !orderData) return undefined;
        
        const { data: clientData } = await supabase.from('clients').select('name').eq('id', orderData.client_id).single();

        const mappedOrder: Order = {
            id: orderData.id,
            clientId: orderData.client_id,
            date: orderData.date,
            status: orderData.status,
            items: orderData.items,
            freightPrice: orderData.freight_price ?? 0,
            freightChargedToCustomer: orderData.freight_charged_to_customer ?? true,
            discount: orderData.discount ?? 0,
            discountType: orderData.discount_type || 'money',
            paymentMethod: orderData.payment_method || '',
            notes: orderData.notes,
            createdAt: orderData.created_at,
            externalProductionLink: orderData.external_production_link,
            trackingCode: orderData.tracking_code,
            trackingUrl: orderData.tracking_url
        };
        
        return { order: mappedOrder, clientName: clientData?.name || 'Cliente' };
    },
    getNextOrderId: async (): Promise<string> => {
        try {
            const settings = await db.settings.get();
            const nextNum = settings.nextOrderNumber || 1;
            const idStr = String(nextNum).padStart(5, '0');
            await db.settings.save({ ...settings, nextOrderNumber: nextNum + 1 });
            return idStr;
        } catch (error) {
            console.error("Erro ao gerar ID:", error);
            return generateId(); 
        }
    }
  },
  expenses: {
    list: async (): Promise<Expense[]> => {
      const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    save: async (data: Expense) => {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { 
          id: data.id,
          user_id: user?.id,
          date: data.date,
          category: data.category,
          description: data.description,
          amount: data.amount,
          recurrent: data.recurrent
      };
      const { error } = await supabase.from('expenses').upsert(payload);
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
              user_id: user.id,
              company_name: DEFAULT_SETTINGS.companyName,
              payment_methods: ['Pix', 'Cartão de Crédito (Link)'],
              next_order_number: 1,
          };
          await supabase.from('settings').insert(initial);
          return DEFAULT_SETTINGS;
      }
      
      return {
          companyName: data.company_name || DEFAULT_SETTINGS.companyName,
          companyDoc: data.company_doc || DEFAULT_SETTINGS.companyDoc,
          companyAddress: data.company_address || DEFAULT_SETTINGS.companyAddress,
          companyContact: data.company_contact || DEFAULT_SETTINGS.companyContact,
          logoUrl: data.logo_url || DEFAULT_SETTINGS.logoUrl,
          quoteValidityDays: data.quote_validity_days || DEFAULT_SETTINGS.quoteValidityDays,
          quoteTerms: data.quote_terms || DEFAULT_SETTINGS.quoteTerms,
          statusesConsideredSale: data.statuses_considered_sale || DEFAULT_SETTINGS.statusesConsideredSale,
          nextOrderNumber: data.next_order_number || DEFAULT_SETTINGS.nextOrderNumber,
          paymentMethods: (data.payment_methods && data.payment_methods.length > 0) 
                ? data.payment_methods
                : ['Pix', 'Cartão de Crédito (Link)']
      };
    },
    save: async (data: Settings) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const payload = {
          user_id: user.id,
          company_name: data.companyName,
          company_doc: data.companyDoc,
          company_address: data.companyAddress,
          company_contact: data.companyContact,
          logo_url: data.logoUrl,
          quote_validity_days: data.quoteValidityDays,
          quote_terms: data.quoteTerms,
          statuses_considered_sale: data.statusesConsideredSale,
          next_order_number: data.nextOrderNumber,
          payment_methods: data.paymentMethods
      };

      const { error } = await supabase.from('settings').upsert(payload);
      if (error) throw error;
    }
  }
};
