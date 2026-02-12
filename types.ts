
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
  code?: string; // Novo: Código do produto (SKU)
  image?: string; // Novo: URL da imagem
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
  name: string; // Novo: Nome curto do item
  itemUnit?: string; // Novo: Unidade de exibição (ex: UN, KG, CX)
  description: string; // Detalhes técnicos para o cliente
  quantity: number;
  unitPrice: number; // Preço final unitário
  unitCost: number;
  
  // Novos campos para cálculo personalizado
  pricingType?: 'unit' | 'area';
  width?: number;
  height?: number;
  unitMeasure?: 'mm' | 'cm' | 'm';
  areaPrice?: number; // Preço do m2 base
  finishingPrice?: number; // Acabamento
}

export interface Order {
  id: string;
  user_id?: string;
  clientId: string; 
  client_id?: string; 
  date: string; 
  status: OrderStatus;
  items: OrderItem[];
  freightPrice: number; 
  freightChargedToCustomer: boolean; 
  discount: number;
  discountType: 'money' | 'percentage'; 
  paymentMethod: string; 
  notes: string;
  createdAt: string;
  
  externalProductionLink?: string; 
  trackingCode?: string; 
  trackingUrl?: string; 
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
  logoUrl: string; 
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
  paymentMethods: ['Pix', 'Cartão de Crédito (Link)']
};
