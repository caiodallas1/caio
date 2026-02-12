
import React, { useState, useEffect } from 'react';
import { db, generateId } from '../services/db';
import { Order, OrderItem, OrderStatus, Product, Client } from '../types';
import { Plus, Search, Trash2, Edit2, Printer, Calendar, RefreshCw, ChevronRight, User, ExternalLink, Copy, Truck, Link as LinkIcon, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const OrderForm = ({ orderId, onClose, onSaved }: { orderId?: string, onClose: () => void, onSaved: () => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['Pix', 'Cartão de Crédito (Link)']);
  
  // Quick Client Creation State
  const [isNewClientMode, setIsNewClientMode] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  const [order, setOrder] = useState<Order>({
    id: '', 
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    status: OrderStatus.DRAFT,
    items: [],
    freightPrice: 0,
    freightChargedToCustomer: true,
    discount: 0,
    discountType: 'money',
    paymentMethod: '',
    notes: '',
    createdAt: new Date().toISOString(),
    externalProductionLink: '',
    trackingCode: '',
    trackingUrl: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
        setLoading(true);
        try {
            const [p, c, s] = await Promise.all([
                db.products.list(),
                db.clients.list(),
                db.settings.get()
            ]);
            setProducts(p);
            setClients(c);
            
            if (s.paymentMethods && s.paymentMethods.length > 0) {
                setPaymentMethods(s.paymentMethods);
            }

            if (orderId) {
                const found = await db.orders.get(orderId);
                if (found) setOrder(found);
            } else {
                // Ao criar novo pedido, busca o próximo ID sequencial (00001, 00002...)
                const nextId = await db.orders.getNextOrderId();
                setOrder(prev => ({ ...prev, id: nextId }));
            }
        } catch(e) {
            console.error(e);
            alert("Erro ao carregar dados. Verifique sua conexão.");
        } finally {
            setLoading(false);
        }
    };
    init();
  }, [orderId]);

  const addItem = () => {
    setOrder({
      ...order,
      items: [...order.items, {
        id: generateId(),
        productId: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        unitCost: 0
      }]
    });
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...order.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If product changes, auto-fill details
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        newItems[index].description = prod.name;
        newItems[index].unitPrice = prod.price;
        newItems[index].unitCost = prod.cost;
      }
    }
    setOrder({ ...order, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = [...order.items];
    newItems.splice(index, 1);
    setOrder({ ...order, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = order.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const itemCost = order.items.reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
    
    const discountValue = order.discountType === 'money' ? order.discount : (subtotal * order.discount / 100);
    
    let totalRevenue = subtotal - discountValue;
    if (order.freightChargedToCustomer) totalRevenue += order.freightPrice;

    let totalCost = itemCost;
    if (!order.freightChargedToCustomer) {
        totalCost += order.freightPrice;
    }

    const profit = totalRevenue - totalCost;

    return { subtotal, totalRevenue, totalCost, profit };
  };

  const totals = calculateTotals();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        let finalClientId = order.clientId;

        if (isNewClientMode) {
            if (!newClientName || !newClientPhone) {
                return alert("Por favor, preencha Nome e WhatsApp do novo cliente.");
            }
            const newClient: Client = {
                id: generateId(),
                name: newClientName,
                whatsapp: newClientPhone,
                email: '',
                doc: '',
                address: '',
                notes: 'Criado via Pedido Rápido'
            };
            await db.clients.save(newClient);
            finalClientId = newClient.id;
        } else {
            if (!order.clientId) return alert('Selecione um cliente');
        }

        const finalOrder = {
            ...order,
            clientId: finalClientId
        };

        await db.orders.save(finalOrder);
        onSaved();
        onClose();
    } catch(error) {
        console.error("Erro ao salvar pedido:", error);
        alert("Erro ao salvar o pedido. Tente novamente.");
    }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Link copiado!");
  };

  const inputClass = "w-full border border-gray-300 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-base focus:ring-2 focus:ring-primary focus:outline-none transition-colors";
  const labelClass = "block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300";

  if (loading) return <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 z-[60] flex items-center justify-center dark:text-white"><RefreshCw className="animate-spin mr-2"/> Carregando Pedido...</div>;

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-slate-950 z-[55] overflow-y-auto transition-colors">
      <div className="max-w-5xl mx-auto p-0 md:p-8">
        <form onSubmit={handleSave} className="flex flex-col min-h-screen md:min-h-0">
          {/* Header Mobile Sticky */}
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 p-4 shadow-sm border-b border-gray-100 dark:border-slate-800 flex justify-between items-center md:hidden">
             <button type="button" onClick={onClose} className="text-slate-500">Cancelar</button>
             <h2 className="font-bold text-slate-800 dark:text-white">Editar Pedido</h2>
             <button type="submit" className="font-bold text-primary">Salvar</button>
          </div>

          {/* Header Desktop */}
          <div className="hidden md:flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-t-xl shadow-sm border-l-4 border-primary transition-colors">
             <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{orderId ? 'Editar Pedido' : 'Novo Pedido'}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <div className="text-sm font-mono bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded font-bold">#{order.id}</div>
                    {!orderId && <span className="text-xs text-gray-400">(Automático)</span>}
                </div>
             </div>
             <div className="flex gap-2">
               <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
               {orderId && (
                  <Link to={`/print/order/${order.id}`} target="_blank" className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg flex items-center gap-2 hover:bg-slate-700 dark:hover:bg-slate-600">
                    <Printer size={16} /> PDF
                  </Link>
               )}
               <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-amber-600 font-medium shadow-md">Salvar Pedido</button>
             </div>
          </div>

          <div className="flex-1 p-4 space-y-6 overflow-y-auto bg-gray-50 dark:bg-slate-950">
            {/* Main Info */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm space-y-4 border border-gray-100 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className={labelClass}>Cliente *</label>
                        <button 
                            type="button" 
                            onClick={() => setIsNewClientMode(!isNewClientMode)} 
                            className="text-xs text-primary font-bold flex items-center gap-1 hover:underline p-1"
                        >
                            {isNewClientMode ? 'Selecionar Existente' : '+ Novo Cliente'}
                        </button>
                    </div>
                    
                    {isNewClientMode ? (
                        <div className="space-y-3 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                            <input 
                                required={isNewClientMode}
                                placeholder="Nome do Cliente" 
                                className={inputClass}
                                value={newClientName}
                                onChange={e => setNewClientName(e.target.value)}
                            />
                            <input 
                                required={isNewClientMode}
                                placeholder="WhatsApp" 
                                className={inputClass} 
                                value={newClientPhone}
                                onChange={e => setNewClientPhone(e.target.value)}
                            />
                        </div>
                    ) : (
                        <select required className={inputClass} value={order.clientId} onChange={e => setOrder({...order, clientId: e.target.value})}>
                            <option value="">Selecione...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Data</label>
                        <input type="date" required className={inputClass} value={order.date} onChange={e => setOrder({...order, date: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Status</label>
                        <select className={inputClass} value={order.status} onChange={e => setOrder({...order, status: e.target.value as OrderStatus})}>
                            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                </div>
            </div>

            {/* Client Area Link (Visible only if Order Exists) */}
            {orderId && (
                <div className="bg-slate-900 p-5 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <User size={100} className="text-white"/>
                    </div>
                    <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2"><Lock size={18} className="text-amber-500"/> Área do Cliente (Link Público)</h3>
                    <p className="text-slate-400 text-sm mb-4">Envie este link para seu cliente acompanhar o status do pedido em tempo real.</p>
                    
                    <div className="flex gap-2">
                        <div className="flex-1 bg-slate-950 rounded-lg border border-slate-700 p-3 text-slate-300 text-sm truncate font-mono select-all">
                            {window.location.origin + '/#/track/' + order.id}
                        </div>
                        <button type="button" onClick={() => copyToClipboard(window.location.origin + '/#/track/' + order.id)} className="bg-amber-600 hover:bg-amber-500 text-white px-4 rounded-lg font-bold flex items-center gap-2">
                            <Copy size={16}/> Copiar
                        </button>
                        <a href={`/#/track/${order.id}`} target="_blank" className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-lg font-bold flex items-center gap-2">
                            <ExternalLink size={16}/> Abrir
                        </a>
                    </div>
                </div>
            )}
            
            {/* Internal Control (Production & Tracking) */}
            {orderId && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                     <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Truck size={20} className="text-primary"/> Controle Interno
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className={labelClass}>Link de Produção (Parceiro/Gráfica) - <span className="text-xs text-gray-400 font-normal">Somente você vê isso</span></label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    className={`${inputClass} pl-10`} 
                                    placeholder="https://graficaparceira.com.br/pedido/123"
                                    value={order.externalProductionLink || ''}
                                    onChange={e => setOrder({...order, externalProductionLink: e.target.value})}
                                />
                                {order.externalProductionLink && (
                                    <a href={order.externalProductionLink} target="_blank" className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700">
                                        <ExternalLink size={16}/>
                                    </a>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Código de Rastreio (Correios/Transp)</label>
                            <input 
                                className={`${inputClass} font-mono uppercase`} 
                                placeholder="AA123456789BR"
                                value={order.trackingCode || ''}
                                onChange={e => setOrder({...order, trackingCode: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Link de Rastreio</label>
                            <input 
                                className={inputClass} 
                                placeholder="https://rastreamento..."
                                value={order.trackingUrl || ''}
                                onChange={e => setOrder({...order, trackingUrl: e.target.value})}
                            />
                        </div>
                     </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Itens do Pedido</h3>
                <button type="button" onClick={addItem} className="bg-primary text-white text-sm font-bold flex items-center gap-1 hover:bg-amber-600 px-3 py-2 rounded-lg shadow-sm transition-colors">+ Adicionar</button>
                </div>
                
                <div className="space-y-4">
                {order.items.map((item, idx) => (
                    <div key={item.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 relative">
                        <button type="button" onClick={() => removeItem(idx)} className="absolute top-2 right-2 text-red-500 p-2"><Trash2 size={18} /></button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-5">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Produto / Descrição</label>
                                <select className={`${inputClass} mb-2`} value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}>
                                    <option value="">Avulso / Selecionar</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <input placeholder="Descrição detalhada" className={inputClass} value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:col-span-7">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Qtd</label>
                                    <input type="number" min="0.01" step="0.01" className={inputClass} value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Preço (R$)</label>
                                    <input type="number" step="0.01" className={inputClass} value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 text-right font-bold text-slate-700 dark:text-slate-300">
                            Total: R$ {(item.quantity * item.unitPrice).toFixed(2)}
                        </div>
                    </div>
                ))}
                {order.items.length === 0 && <p className="text-center text-gray-400 dark:text-slate-500 py-4">Nenhum item adicionado</p>}
                </div>
            </div>

            {/* Calculations */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm space-y-4 border border-gray-100 dark:border-slate-800">
                <h3 className="font-bold border-b border-gray-100 dark:border-slate-800 pb-2 text-slate-800 dark:text-white">Pagamento e Totais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Forma de Pagamento</label>
                        <select 
                            className={inputClass}
                            value={order.paymentMethod} 
                            onChange={e => setOrder({...order, paymentMethod: e.target.value})}
                        >
                            <option value="">Selecione...</option>
                            {paymentMethods.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                         <label className={labelClass}>Desconto</label>
                        <div className="flex gap-2">
                            <input type="number" className={inputClass} value={order.discount} onChange={e => setOrder({...order, discount: Number(e.target.value)})} />
                            <select className={`${inputClass} w-24`} value={order.discountType} onChange={e => setOrder({...order, discountType: e.target.value as any})}>
                                <option value="money">R$</option>
                                <option value="percentage">%</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Frete / Entrega</label>
                    <input type="number" className="w-full border border-blue-200 dark:border-blue-800 rounded p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white" value={order.freightPrice} onChange={e => setOrder({...order, freightPrice: Number(e.target.value)})} />
                    
                    <div className="flex items-center gap-2 mt-3">
                        <input type="checkbox" id="chargeFreight" className="w-5 h-5 text-primary rounded" checked={order.freightChargedToCustomer} onChange={e => setOrder({...order, freightChargedToCustomer: e.target.checked})} />
                        <label htmlFor="chargeFreight" className="text-sm text-blue-800 dark:text-blue-300">Cobrar do cliente?</label>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between text-base text-slate-600 dark:text-slate-400"><span>Subtotal Itens:</span> <span>R$ {totals.subtotal.toFixed(2)}</span></div>
                    {order.discount > 0 && <div className="flex justify-between text-base text-red-500 dark:text-red-400"><span>Desconto:</span> <span>- R$ {(totals.subtotal - (order.discountType === 'money' ? totals.subtotal - order.discount : totals.subtotal * (1 - order.discount/100))).toFixed(2)}</span></div>}
                    {order.freightChargedToCustomer && order.freightPrice > 0 && (
                            <div className="flex justify-between text-base text-blue-600 dark:text-blue-400"><span>Frete:</span> <span>+ R$ {order.freightPrice.toFixed(2)}</span></div>
                    )}
                    <div className="flex justify-between text-2xl font-bold text-slate-800 dark:text-white pt-4 border-t border-gray-100 dark:border-slate-800 mt-2">
                        <span>Total:</span> 
                        <span>R$ {totals.totalRevenue.toFixed(2)}</span>
                    </div>
                </div>

                <div className="hidden md:block bg-gray-50 dark:bg-slate-800 p-3 rounded text-xs space-y-1 text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between"><span>Custos Itens:</span> <span>R$ {order.items.reduce((a, b) => a + (b.unitCost * b.quantity), 0).toFixed(2)}</span></div>
                        <div className={`flex justify-between font-bold ${totals.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <span>Lucro Estimado:</span> 
                        <span>R$ {totals.profit.toFixed(2)}</span>
                        </div>
                </div>

                 <label className={labelClass}>Observações Internas</label>
                 <textarea className={inputClass} rows={3} value={order.notes} onChange={e => setOrder({...order, notes: e.target.value})} />
            </div>

            {/* Mobile Bottom Spacer */}
            <div className="h-10 md:hidden"></div>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [dateFilterType, setDateFilterType] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
      setLoading(true);
      const [o, c] = await Promise.all([
          db.orders.list(),
          db.clients.list()
      ]);
      setOrders(o);
      setClients(c);
      setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm('Excluir este pedido?')) {
        await db.orders.delete(id);
        await loadData();
    }
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Cliente Removido';

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.APPROVED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800';
        case OrderStatus.CANCELED: return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800';
        case OrderStatus.QUOTE: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
        default: return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300 border-gray-200 dark:border-slate-700';
    }
  };

  const isInDateRange = (orderDateStr: string) => {
      const orderDate = new Date(orderDateStr);
      const today = new Date();
      today.setHours(0,0,0,0);
      const oDate = new Date(orderDate);
      oDate.setHours(0,0,0,0);

      if (dateFilterType === 'ALL') return true;
      if (dateFilterType === 'CUSTOM') return orderDateStr === customDate;
      if (dateFilterType === 'TODAY') {
          return oDate.getTime() === today.getTime();
      }
      if (dateFilterType === 'WEEK') {
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(today.getDate() - 7);
          return oDate >= oneWeekAgo && oDate <= today;
      }
      if (dateFilterType === 'MONTH') {
          return oDate.getMonth() === today.getMonth() && oDate.getFullYear() === today.getFullYear();
      }
      return true;
  };

  const filtered = orders
    .filter(o => filterStatus === 'ALL' || o.status === filterStatus)
    .filter(o => isInDateRange(o.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white hidden md:block">Pedidos</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="w-full md:w-auto bg-primary hover:bg-yellow-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg md:shadow-md active:scale-95 transition-transform"
        >
          <Plus size={20} /> <span className="font-bold">Novo Pedido</span>
        </button>
      </div>

      {/* Date Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-slate-800 flex flex-nowrap overflow-x-auto gap-2 items-center transition-colors no-scrollbar">
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mr-2 shrink-0">
            <Calendar size={18} />
        </div>
        <button onClick={() => setDateFilterType('ALL')} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dateFilterType === 'ALL' ? 'bg-slate-800 text-white dark:bg-slate-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>Tudo</button>
        <button onClick={() => setDateFilterType('TODAY')} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dateFilterType === 'TODAY' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>Hoje</button>
        <button onClick={() => setDateFilterType('WEEK')} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dateFilterType === 'WEEK' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>Semana</button>
        <button onClick={() => setDateFilterType('MONTH')} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dateFilterType === 'MONTH' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>Mês</button>
        
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-slate-700 shrink-0">
            <input 
                type="date" 
                value={customDate} 
                onChange={e => { setCustomDate(e.target.value); setDateFilterType('CUSTOM'); }}
                className={`border rounded px-2 py-1 text-xs bg-white dark:bg-slate-800 dark:text-white ${dateFilterType === 'CUSTOM' ? 'border-primary ring-1 ring-primary' : 'border-gray-200 dark:border-slate-700'}`} 
            />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button onClick={() => setFilterStatus('ALL')} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterStatus === 'ALL' ? 'bg-slate-800 text-white dark:bg-slate-700 shadow-md' : 'bg-white dark:bg-slate-900 border dark:border-slate-700 dark:text-slate-300'}`}>Todos</button>
        {Object.values(OrderStatus).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterStatus === s ? 'bg-slate-800 text-white dark:bg-slate-700 shadow-md' : 'bg-white dark:bg-slate-900 border dark:border-slate-700 dark:text-slate-300'}`}>{s}</button>
        ))}
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="md:hidden space-y-4">
        {loading && <div className="text-center py-10 text-gray-500">Carregando...</div>}
        {!loading && filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400 dark:text-slate-600">Nenhum pedido encontrado.</div>
        )}
        {filtered.map(order => {
             let sub = order.items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
             let disc = order.discountType === 'money' ? order.discount : sub * (order.discount/100);
             let total = sub - disc + (order.freightChargedToCustomer ? order.freightPrice : 0);

             return (
                 <div key={order.id} onClick={() => setEditingId(order.id)} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-800 active:scale-[0.99] transition-transform relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <span className="text-xs font-bold text-gray-400">#{order.id}</span>
                            <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{getClientName(order.clientId)}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>{order.status}</span>
                    </div>
                    
                    <div className="flex justify-between items-end">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                             {new Date(order.date).toLocaleDateString('pt-BR')}
                             <div className="text-xs mt-1">{order.items.length} itens</div>
                        </div>
                        <div className="text-right">
                             <span className="block text-xs text-slate-400">Total</span>
                             <span className="text-xl font-black text-slate-800 dark:text-white">R$ {total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Quick Actions Overlay on click handled by parent, but specific buttons stop propagation */}
                    <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-800 flex justify-end gap-3">
                         <Link to={`/print/order/${order.id}`} target="_blank" onClick={e => e.stopPropagation()} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                            <Printer size={18} />
                         </Link>
                         <button onClick={(e) => handleDelete(order.id, e)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full">
                            <Trash2 size={18} />
                         </button>
                    </div>
                 </div>
             )
        })}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          {loading ? <div className="p-8 text-center text-gray-500 dark:text-slate-400">Carregando...</div> : (
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border-b dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">ID/Data</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total Venda</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filtered.map(order => {
                let sub = order.items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
                let disc = order.discountType === 'money' ? order.discount : sub * (order.discount/100);
                let total = sub - disc + (order.freightChargedToCustomer ? order.freightPrice : 0);

                return (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="font-mono text-sm font-bold text-primary">#{order.id}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(order.date).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{getClientName(order.clientId)}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(order.status)}`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">R$ {total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <Link to={`/print/order/${order.id}`} target="_blank" className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white" title="Imprimir/PDF">
                        <Printer size={18} />
                      </Link>
                      <button onClick={() => setEditingId(order.id)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 dark:text-slate-500">Nenhum pedido encontrado.</td></tr>}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {(isCreating || editingId) && (
        <OrderForm 
            orderId={editingId || undefined} 
            onClose={() => { setIsCreating(false); setEditingId(null); }} 
            onSaved={loadData}
        />
      )}
    </div>
  );
};
