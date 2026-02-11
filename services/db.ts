import { Client, Product, Order, Expense, Settings, DEFAULT_SETTINGS } from '../types';
import { auth } from './auth';

// Simple ID generator
export const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to get keys based on current user
const getKeys = () => {
    const user = auth.getCurrentUser();
    const suffix = user ? `_${user.id}` : ''; // If no user (shouldn't happen in app), no suffix
    return {
        CLIENTS: `app_clients${suffix}`,
        PRODUCTS: `app_products${suffix}`,
        ORDERS: `app_orders${suffix}`,
        EXPENSES: `app_expenses${suffix}`,
        SETTINGS: `app_settings${suffix}`
    };
};

const get = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const set = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const db = {
  clients: {
    list: () => get<Client[]>(getKeys().CLIENTS, []),
    save: (data: Client) => {
      const k = getKeys().CLIENTS;
      const list = get<Client[]>(k, []);
      const index = list.findIndex(i => i.id === data.id);
      if (index >= 0) list[index] = data;
      else list.push(data);
      set(k, list);
    },
    delete: (id: string) => {
      const k = getKeys().CLIENTS;
      const list = get<Client[]>(k, []);
      set(k, list.filter(i => i.id !== id));
    },
    get: (id: string) => get<Client[]>(getKeys().CLIENTS, []).find(c => c.id === id)
  },
  products: {
    list: () => get<Product[]>(getKeys().PRODUCTS, []),
    save: (data: Product) => {
      const k = getKeys().PRODUCTS;
      const list = get<Product[]>(k, []);
      const index = list.findIndex(i => i.id === data.id);
      if (index >= 0) list[index] = data;
      else list.push(data);
      set(k, list);
    },
    delete: (id: string) => {
      const k = getKeys().PRODUCTS;
      const list = get<Product[]>(k, []);
      set(k, list.filter(i => i.id !== id));
    },
    get: (id: string) => get<Product[]>(getKeys().PRODUCTS, []).find(p => p.id === id)
  },
  orders: {
    list: () => get<Order[]>(getKeys().ORDERS, []),
    save: (data: Order) => {
      const k = getKeys().ORDERS;
      const list = get<Order[]>(k, []);
      const index = list.findIndex(i => i.id === data.id);
      if (index >= 0) list[index] = data;
      else list.push(data);
      set(k, list);
    },
    delete: (id: string) => {
      const k = getKeys().ORDERS;
      const list = get<Order[]>(k, []);
      set(k, list.filter(i => i.id !== id));
    },
    get: (id: string) => get<Order[]>(getKeys().ORDERS, []).find(o => o.id === id),
    getNextOrderId: (): string => {
        const k = getKeys().SETTINGS;
        const settings = get<Settings>(k, DEFAULT_SETTINGS);
        const nextNum = settings.nextOrderNumber || 1;
        
        const idStr = String(nextNum).padStart(4, '0');
        
        settings.nextOrderNumber = nextNum + 1;
        set(k, settings);
        
        return idStr;
    }
  },
  expenses: {
    list: () => get<Expense[]>(getKeys().EXPENSES, []),
    save: (data: Expense) => {
      const k = getKeys().EXPENSES;
      const list = get<Expense[]>(k, []);
      const index = list.findIndex(i => i.id === data.id);
      if (index >= 0) list[index] = data;
      else list.push(data);
      set(k, list);
    },
    delete: (id: string) => {
      const k = getKeys().EXPENSES;
      const list = get<Expense[]>(k, []);
      set(k, list.filter(i => i.id !== id));
    }
  },
  settings: {
    get: () => get<Settings>(getKeys().SETTINGS, DEFAULT_SETTINGS),
    save: (data: Settings) => set(getKeys().SETTINGS, data)
  }
};