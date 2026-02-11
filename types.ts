export interface User {
  id: string;
  name: string;
  email: string;
  // password removed, handled by Supabase
}

export interface Client {
  id: string;
  user_id?: string;
  name: string;
  whatsapp: string;
  email: string;
  doc: string; // CPF/CNPJ
  address: string;
  notes: string;
}

export interface Product {
  id: string;
  user_id?: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  cost: number;
  active: boolean;
  category: string;
}

export enum OrderStatus {
  DRAFT = 'Rascunho',
  QUOTE = 'Orçamento',
  APPROVED = 'Aprovado',
  PRODUCTION = 'Em Produção',
  READY = 'Pronto',
  DELIVERED = 'Entregue',
  CANCELED = 'Cancelado'
}

export interface OrderItem {
  id: string;
  productId: string; // or empty if custom
  description: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface Order {
  id: string;
  user_id?: string;
  clientId: string; // Changed from camelCase in DB, but mapped in service
  client_id?: string; // For DB mapping
  date: string; // ISO Date YYYY-MM-DD
  status: OrderStatus;
  items: OrderItem[];
  freightPrice: number; // Mapped to freight_price
  freightChargedToCustomer: boolean; // Mapped to freight_charged_to_customer
  discount: number;
  discountType: 'money' | 'percentage'; // Mapped to discount_type
  paymentMethod: string; // Mapped to payment_method
  notes: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  user_id?: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  recurrent: boolean;
}

export interface Settings {
  companyName: string;
  companyDoc: string;
  companyAddress: string;
  companyContact: string;
  logoUrl: string; // Base64 or URL
  quoteValidityDays: number;
  quoteTerms: string;
  statusesConsideredSale: OrderStatus[];
  nextOrderNumber: number;
  paymentMethods: string[];
}

// Default Settings
export const DEFAULT_SETTINGS: Settings = {
  companyName: 'Minha Empresa',
  companyDoc: '',
  companyAddress: '',
  companyContact: '',
  logoUrl: '',
  quoteValidityDays: 15,
  quoteTerms: 'Pagamento: 50% na aprovação e 50% na entrega.\nPrazo de entrega a combinar.',
  statusesConsideredSale: [OrderStatus.DELIVERED, OrderStatus.APPROVED, OrderStatus.READY, OrderStatus.PRODUCTION],
  nextOrderNumber: 1,
  paymentMethods: ['Pix', 'Cartão de Crédito', 'Dinheiro', 'Boleto']
};