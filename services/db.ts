
import { Client, Product, Order, Expense, Settings, DEFAULT_SETTINGS } from '../types';
import { auth } from './auth';

// Helper para gerenciar o armazenamento local baseado na Chave de Acesso
const getStorageKey = (collection: string) => {
    const workplaceId = auth.getAccessKey();
    if (!workplaceId) throw new Error("Chave de acesso não configurada");
    return `gpro_${workplaceId}_${collection}`;
};

const getLocalData = <T>(collection: string): T[] => {
    const data = localStorage.getItem(getStorageKey(collection));
    return data ? JSON.parse(data) : [];
};

const saveLocalData = <T>(collection: string, data: T[]) => {
    localStorage.setItem(getStorageKey(collection), JSON.stringify(data));
};

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const db = {
  clients: {
    list: async (): Promise<Client[]> => {
      return getLocalData<Client>('clients');
    },
    save: async (data: Client) => {
      const list = getLocalData<Client>('clients');
      const index = list.findIndex(i => i.id === data.id);
      if (index >= 0) {
        list[index] = data;
      } else {
        list.push(data);
      }
      saveLocalData('clients', list);
    },
    delete: async (id: string) => {
      const list = getLocalData<Client>('clients');
      saveLocalData('clients', list.filter(i => i.id !== id));
    },
    get: async (id: string): Promise<Client | undefined> => {
      const list = getLocalData<Client>('clients');
      return list.find(i => i.id === id);
    }
  },
  products: {
    list: async (): Promise<Product[]> => {
      return getLocalData<Product>('products');
    },
    save: async (data: Product) => {
      const list = getLocalData<Product>('products');
      const index = list.findIndex(i => i.id === data.id);
      if (index >= 0) {
        list[index] = data;
      } else {
        list.push(data);
      }
      saveLocalData('products', list);
    },
    delete: async (id: string) => {
      const list = getLocalData<Product>('products');
      saveLocalData('products', list.filter(i => i.id !== id));
    },
    get: async (id: string): Promise<Product | undefined> => {
      const list = getLocalData<Product>('products');
      return list.find(i => i.id === id);
    }
  },
  orders: {
    list: async (): Promise<Order[]> => {
      return getLocalData<Order>('orders');
    },
    save: async (data: Order) => {
      const list = getLocalData<Order>('orders');
      const index = list.findIndex(i => i.id === data.id);
      if (index >= 0) {
        list[index] = data;
      } else {
        list.push(data);
      }
      saveLocalData('orders', list);
    },
    delete: async (id: string) => {
      const list = getLocalData<Order>('orders');
      saveLocalData('orders', list.filter(i => i.id !== id));
    },
    get: async (id: string): Promise<Order | undefined> => {
      const list = getLocalData<Order>('orders');
      return list.find(i => i.id === id);
    },
    getNextOrderId: async (): Promise<string> => {
        const settings = await db.settings.get();
        const nextNum = settings.nextOrderNumber || 1;
        const idStr = String(nextNum).padStart(4, '0');
        await db.settings.save({ ...settings, nextOrderNumber: nextNum + 1 });
        return idStr;
    }
  },
  expenses: {
    list: async (): Promise<Expense[]> => {
      return getLocalData<Expense>('expenses');
    },
    save: async (data: Expense) => {
      const list = getLocalData<Expense>('expenses');
      const index = list.findIndex(i => i.id === data.id);
      if (index >= 0) {
        list[index] = data;
      } else {
        list.push(data);
      }
      saveLocalData('expenses', list);
    },
    delete: async (id: string) => {
      const list = getLocalData<Expense>('expenses');
      saveLocalData('expenses', list.filter(i => i.id !== id));
    }
  },
  settings: {
    get: async (): Promise<Settings> => {
      const workplaceId = auth.getAccessKey();
      const data = localStorage.getItem(`gpro_${workplaceId}_settings`);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    },
    save: async (data: Settings) => {
      const workplaceId = auth.getAccessKey();
      localStorage.setItem(`gpro_${workplaceId}_settings`, JSON.stringify(data));
    }
  }
};
