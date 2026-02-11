import React, { useState, useEffect } from 'react';
import { db, generateId } from '../services/db';
import { Order, OrderItem, OrderStatus, Product, Client } from '../types';
import { Plus, Search, FileText, Trash2, Edit2, CheckCircle, Printer } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const OrderForm = ({ orderId, onClose }: { orderId?: string, onClose: () => void }) => {
  const navigate = useNavigate();
  const [products] = useState<Product[]>(db.products.list());
  const [clients] = useState<Client[]>(db.clients.list());
  
  const [order, setOrder] = useState<Order>({
    id: generateId(),
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
    createdAt: new Date().toISOString()
  });

  useEffect(() => {
    if (orderId) {
      const found = db.orders.get(orderId);
      if (found) setOrder(found);
    }
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
    
    // Revenue: (Items - Discount) + (Freight IF charged to customer)
    let totalRevenue = subtotal - discountValue;
    if (order.freightChargedToCustomer) totalRevenue += order.freightPrice;

    // Cost: Items Cost + Freight (Freight is ALWAYS a cost to us)
    const totalCost = itemCost + order.freightPrice;

    const profit = totalRevenue - totalCost;

    return { subtotal, totalRevenue, totalCost, profit };
  };

  const totals = calculateTotals();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order.clientId) return alert('Selecione um cliente');
    db.orders.save(order);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
             <h2 className="text-2xl font-bold">{orderId ? 'Editar Pedido' : 'Novo Pedido'}</h2>
             <div className="flex gap-2">
               <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
               {orderId && (
                  <Link to={`/print/order/${order.id}`} target="_blank" className="px-4 py-2 bg-slate-800 text-white rounded-lg flex items-center gap-2">
                    <Printer size={16} /> PDF/Imprimir
                  </Link>
               )}
               <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium">Salvar Pedido</button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="md:col-span-2 space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Cliente *</label>
                        <select required className="w-full border rounded-lg p-2" value={order.clientId} onChange={e => setOrder({...order, clientId: e.target.value})}>
                            <option value="">Selecione...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Data</label>
                        <input type="date" required className="w-full border rounded-lg p-2" value={order.date} onChange={e => setOrder({...order, date: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select className="w-full border rounded-lg p-2" value={order.status} onChange={e => setOrder({...order, status: e.target.value as OrderStatus})}>
                        {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Itens do Pedido</h3>
                    <button type="button" onClick={addItem} className="text-primary text-sm font-medium flex items-center gap-1">+ Adicionar Item</button>
                  </div>
                  
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-start border-b border-gray-100 pb-4">
                            <div className="col-span-12 md:col-span-4">
                                <label className="text-xs text-gray-500 block md:hidden">Produto</label>
                                <select className="w-full border rounded p-1.5 text-sm" value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}>
                                    <option value="">Avulso / Selecionar</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <input placeholder="Descrição" className="w-full border rounded p-1.5 text-sm mt-1" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
                            </div>
                            <div className="col-span-3 md:col-span-2">
                                <label className="text-xs text-gray-500">Qtd</label>
                                <input type="number" min="0.01" step="0.01" className="w-full border rounded p-1.5 text-sm" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
                            </div>
                            <div className="col-span-4 md:col-span-2">
                                <label className="text-xs text-gray-500">Preço Un (Venda)</label>
                                <input type="number" step="0.01" className="w-full border rounded p-1.5 text-sm" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} />
                            </div>
                            <div className="col-span-4 md:col-span-2">
                                <label className="text-xs text-gray-500">Custo Un (Interno)</label>
                                <input type="number" step="0.01" className="w-full border rounded p-1.5 text-sm bg-slate-50 text-slate-500" value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', Number(e.target.value))} />
                            </div>
                            <div className="col-span-1 flex justify-center pt-6">
                                <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                            </div>
                            <div className="col-span-12 text-right font-medium text-slate-700 text-sm">
                                Subtotal: R$ {(item.quantity * item.unitPrice).toFixed(2)}
                            </div>
                        </div>
                    ))}
                    {order.items.length === 0 && <p className="text-center text-gray-400 py-4">Nenhum item adicionado</p>}
                  </div>
               </div>
            </div>

            {/* Side Calculations */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                    <h3 className="font-bold border-b pb-2">Valores e Frete</h3>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Desconto</label>
                        <div className="flex gap-2">
                            <input type="number" className="w-full border rounded p-2" value={order.discount} onChange={e => setOrder({...order, discount: Number(e.target.value)})} />
                            <select className="border rounded bg-gray-50" value={order.discountType} onChange={e => setOrder({...order, discountType: e.target.value as any})}>
                                <option value="money">R$</option>
                                <option value="percentage">%</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <label className="block text-sm font-medium text-blue-800 mb-1">Frete (Custo Real)</label>
                        <input type="number" className="w-full border border-blue-200 rounded p-2" value={order.freightPrice} onChange={e => setOrder({...order, freightPrice: Number(e.target.value)})} />
                        
                        <div className="flex items-center gap-2 mt-3">
                            <input type="checkbox" id="chargeFreight" className="w-4 h-4 text-primary" checked={order.freightChargedToCustomer} onChange={e => setOrder({...order, freightChargedToCustomer: e.target.checked})} />
                            <label htmlFor="chargeFreight" className="text-sm text-blue-800">Cobrar do cliente?</label>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                            {order.freightChargedToCustomer 
                                ? "O valor entra na Venda e no Custo (repasse)." 
                                : "O valor entra só no Custo (você paga)."}
                        </p>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                        <div className="flex justify-between text-sm"><span>Subtotal Itens:</span> <span>R$ {totals.subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm text-red-500"><span>Desconto:</span> <span>- R$ {(totals.subtotal - (order.discountType === 'money' ? totals.subtotal - order.discount : totals.subtotal * (1 - order.discount/100))).toFixed(2)}</span></div> {/* Simplified for display */}
                        {order.freightChargedToCustomer && (
                             <div className="flex justify-between text-sm text-blue-600"><span>Frete (Receita):</span> <span>+ R$ {order.freightPrice.toFixed(2)}</span></div>
                        )}
                        <div className="flex justify-between text-xl font-bold text-slate-800 pt-2 border-t">
                            <span>Total Venda:</span> 
                            <span>R$ {totals.totalRevenue.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded text-xs space-y-1 text-gray-500">
                         <div className="flex justify-between"><span>Custos Itens:</span> <span>R$ {order.items.reduce((a, b) => a + (b.unitCost * b.quantity), 0).toFixed(2)}</span></div>
                         <div className="flex justify-between"><span>Custo Frete:</span> <span>R$ {order.freightPrice.toFixed(2)}</span></div>
                         <div className={`flex justify-between font-bold ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <span>Lucro Estimado:</span> 
                            <span>R$ {totals.profit.toFixed(2)}</span>
                         </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <label className="block text-sm font-medium mb-1">Forma de Pagamento</label>
                    <input className="w-full border rounded p-2 mb-3" value={order.paymentMethod} onChange={e => setOrder({...order, paymentMethod: e.target.value})} placeholder="Ex: Pix, 50/50" />
                    
                    <label className="block text-sm font-medium mb-1">Observações Internas</label>
                    <textarea className="w-full border rounded p-2" rows={3} value={order.notes} onChange={e => setOrder({...order, notes: e.target.value})} />
                </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>(db.clients.list());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    setOrders(db.orders.list());
    setClients(db.clients.list());
  }, [editingId, isCreating]);

  const handleDelete = (id: string) => {
    if (confirm('Excluir este pedido?')) {
        db.orders.delete(id);
        setOrders(db.orders.list());
    }
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Cliente Removido';

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.APPROVED: return 'bg-blue-100 text-blue-800';
        case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800';
        case OrderStatus.CANCELED: return 'bg-red-100 text-red-800';
        case OrderStatus.QUOTE: return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filtered = orders
    .filter(o => filterStatus === 'ALL' || o.status === filterStatus)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Pedidos</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Novo Pedido
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setFilterStatus('ALL')} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterStatus === 'ALL' ? 'bg-slate-800 text-white' : 'bg-white border'}`}>Todos</button>
        {Object.values(OrderStatus).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filterStatus === s ? 'bg-slate-800 text-white' : 'bg-white border'}`}>{s}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-semibold border-b">
              <tr>
                <th className="px-6 py-4">ID/Data</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total Venda</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(order => {
                // Quick Calc for display
                let sub = order.items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
                let disc = order.discountType === 'money' ? order.discount : sub * (order.discount/100);
                let total = sub - disc + (order.freightChargedToCustomer ? order.freightPrice : 0);

                return (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                        <div className="font-mono text-xs text-slate-400">#{order.id.substring(0,6)}</div>
                        <div className="text-slate-800">{new Date(order.date).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{getClientName(order.clientId)}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">R$ {total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <Link to={`/print/order/${order.id}`} target="_blank" className="text-slate-500 hover:text-slate-800" title="Imprimir/PDF">
                        <Printer size={18} />
                      </Link>
                      <button onClick={() => setEditingId(order.id)} className="text-blue-600 hover:text-blue-800">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nenhum pedido encontrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {(isCreating || editingId) && (
        <OrderForm 
            orderId={editingId || undefined} 
            onClose={() => { setIsCreating(false); setEditingId(null); }} 
        />
      )}
    </div>
  );
};
