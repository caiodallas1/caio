import { Client, Product, Order, Expense, Settings, DEFAULT_SETTINGS } from '../types';

// Simple ID generator
export const generateId = () => Math.random().toString(36).substring(2, 9);

const KEYS = {
  CLIENTS: 'app_clients',
  PRODUCTS: 'app_products',
  ORDERS: 'app_orders',
  EXPENSES: 'app_expenses',
  SETTINGS: 'app_settings'
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
    list: () => get<Client[]>(KEYS.CLIENTS, []),
    save: (data: Client) => {
      const list = get<Client[]>(KEYS.CLIENTS, []);
      const index = list.findIndex(i => i.id === data.id);
      if (index >= 0) list[index] = data;
      else list.push(data);
      set(KEYS.CLIENTS, list);
    },
    delete: (id: string) => {
      const list = get<Client[]>(KEYS.CLIENTS, []);
      set(KEYS.CLIENTS, list.filter(i => i.id !== id));
    },
    get: (id: string) => get<Client[]>(KEYS.CLIENTS, []).find(c => c.id === id)
  },
  products: {
    list: () => get<Product[]>(KEYS.PRODUCTS, []),
    save: (data: Product) => {
      const list = get<Product[]>(KEYS.PRODUCTS, []);
      const index = list.findIndex(i => i.id === data.id);
      if (index >= 0) list[index] = data;
      else list.push(data);
      set(KEYS.PRODUCTS, list);
    },
    delete: (id: string) => {
      const list = get<Product[]>(KEYS.PRODUCTS, []);
      set(KEYS.PRODUCTS, list.filter(i => i.id !== id));
    },
    get: (id: string) => get<Product[]>(KEYS.PRODUCTS, []).find(p => p.id === id)
  },
  orders: {
    list: () => get<Order[]>(KEYS.ORDERS, []),
    save: (data: Order) => {
      const list = get<Order[]>(KEYS.ORDERS, []);
      const index = list.findIndex(i => i.id === data.id);
      if (index >= 0) list[index] = data;
      else list.push(data);
      set(KEYS.ORDERS, list);
    },
    delete: (id: string) => {
      const list = get<Order[]>(KEYS.ORDERS, []);
      set(KEYS.ORDERS, list.filter(i => i.id !== id));
    },
    get: (id: string) => get<Order[]>(KEYS.ORDERS, []).find(o => o.id === id)
  },
  expenses: {
    list: () => get<Expense[]>(KEYS.EXPENSES, []),
    save: (data: Expense) => {
      const list = get<Expense[]>(KEYS.EXPENSES, []);
      const index = list.findIndex(i => i.id === data.id);
      if (index >= 0) list[index] = data;
      else list.push(data);
      set(KEYS.EXPENSES, list);
    },
    delete: (id: string) => {
      const list = get<Expense[]>(KEYS.EXPENSES, []);
      set(KEYS.EXPENSES, list.filter(i => i.id !== id));
    }
  },
  settings: {
    get: () => get<Settings>(KEYS.SETTINGS, DEFAULT_SETTINGS),
    save: (data: Settings) => set(KEYS.SETTINGS, data)
  }
};
