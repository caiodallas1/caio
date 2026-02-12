
import React, { useState, useEffect } from 'react';
import { db, generateId } from '../services/db';
import { Order, OrderItem, OrderStatus, Product, Client } from '../types';
import { Plus, Search, Trash2, Edit2, Printer, Calendar, RefreshCw, ChevronRight, User, ExternalLink, Copy, Truck, Link as LinkIcon, Lock, Box, Calculator, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ItemForm = ({ onAdd, onCancel, products }: { onAdd: (item: OrderItem) => void, onCancel: () => void, products: Product[] }) => {
    const [mode, setMode] = useState<'catalog' | 'custom'>('catalog');
    
    // Catalog State
    const [selectedProductId, setSelectedProductId] = useState('');
    const [catalogQty, setCatalogQty] = useState(1);
    
    // Custom State
    const [customItem, setCustomItem] = useState<Partial<OrderItem>>({
        name: '',
        itemUnit: 'un',
        description: '',
        quantity: 1,
        unitPrice: 0,
        unitCost: 0,
        pricingType: 'unit',
        unitMeasure: 'cm',
        width: 0,
        height: 0,
        areaPrice: 0,
        finishingPrice: 0
    });

    const handleCatalogAdd = () => {
        const prod = products.find(p => p.id === selectedProductId);
        if (!prod) return;
        
        onAdd({
            id: generateId(),
            productId: prod.id,
            name: prod.name,
            itemUnit: prod.unit,
            description: prod.description || '',
            quantity: catalogQty,
            unitPrice: prod.price,
            unitCost: prod.cost,
            pricingType: 'unit'
        });
    };

    const handleCustomAdd = () => {
        if (!customItem.name) return alert('Informe o Nome do Item');
        
        let finalUnitPrice = customItem.unitPrice || 0;
        
        // Calcular preço se for por área
        if (customItem.pricingType === 'area') {
            const w = customItem.width || 0;
            const h = customItem.height || 0;
            const priceM2 = customItem.areaPrice || 0;
            const finishing = customItem.finishingPrice || 0;
            let areaM2 = 0;

            if (customItem.unitMeasure === 'mm') areaM2 = (w * h) / 1000000;
            else if (customItem.unitMeasure === 'cm') areaM2 = (w * h) / 10000;
            else areaM2 = w * h;

            // Preço unitário da PEÇA = (Area * PreçoM2) + Acabamento
            finalUnitPrice = (areaM2 * priceM2) + finishing;
        }

        onAdd({
            id: generateId(),
            productId: '',
            name: customItem.name || '',
            itemUnit: customItem.pricingType === 'area' ? customItem.unitMeasure : (customItem.itemUnit || 'un'),
            description: customItem.description || '',
            quantity: customItem.quantity || 1,
            unitPrice: finalUnitPrice,
            unitCost: customItem.unitCost || 0,
            pricingType: customItem.pricingType as any,
            width: customItem.width,
            height: customItem.height,
            unitMeasure: customItem.unitMeasure as any,
            areaPrice: customItem.areaPrice,
            finishingPrice: customItem.finishingPrice
        });
    };

    const inputClass = "w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary focus:outline-none";
    const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-1";

    return (
        <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-4 border-b border-gray-200 dark:border-slate-700 mb-4">
                <button 
                    type="button"
                    onClick={() => setMode('catalog')} 
                    className={`pb-2 text-sm font-bold border-b-2 transition-colors ${mode === 'catalog' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
                >
                    Do Catálogo
                </button>
                <button 
                    type="button"
                    onClick={() => setMode('custom')} 
                    className={`pb-2 text-sm font-bold border-b-2 transition-colors ${mode === 'custom' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
                >
                    Personalizado / m²
                </button>
            </div>

            {mode === 'catalog' ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-8">
                        <label className={labelClass}>Buscar Produto (Nome ou Código)</label>
                        <select 
                            className={inputClass}
                            value={selectedProductId} 
                            onChange={e => setSelectedProductId(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.code ? `[${p.code}] ` : ''}{p.name} - R$ {p.price.toFixed(2)} / {p.unit}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                         <label className={labelClass}>Quantidade</label>
                         <input type="number" min="1" className={inputClass} value={catalogQty} onChange={e => setCatalogQty(Number(e.target.value))} />
                    </div>
                    <div className="md:col-span-2">
                        <button type="button" onClick={handleCatalogAdd} className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-amber-600">Adicionar</button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                             <label className={labelClass}>Nome do Item (Título no Orçamento)</label>
                             <input className={inputClass} value={customItem.name} onChange={e => setCustomItem({...customItem, name: e.target.value})} placeholder="Ex: Banner Promocional" />
                        </div>
                        <div className="md:col-span-2">
                             <label className={labelClass}>Descrição Detalhada (Para o Cliente)</label>
                             <input className={inputClass} value={customItem.description} onChange={e => setCustomItem({...customItem, description: e.target.value})} placeholder="Ex: Lona 440g com acabamento em bastão e corda..." />
                        </div>
                        <div>
                             <label className={labelClass}>Tipo de Precificação</label>
                             <select className={inputClass} value={customItem.pricingType} onChange={e => setCustomItem({...customItem, pricingType: e.target.value as any})}>
                                 <option value="unit">Por Unidade Fixa</option>
                                 <option value="area">Por Área (m²)</option>
                             </select>
                        </div>
                    </div>

                    {customItem.pricingType === 'area' ? (
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                             <h4 className="text-xs font-bold text-primary mb-3 flex items-center gap-1"><Calculator size={14}/> Calculadora de Área</h4>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                    <label className={labelClass}>Unidade Medida</label>
                                    <select className={inputClass} value={customItem.unitMeasure} onChange={e => setCustomItem({...customItem, unitMeasure: e.target.value as any})}>
                                        <option value="cm">Centímetros (cm)</option>
                                        <option value="m">Metros (m)</option>
                                        <option value="mm">Milímetros (mm)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Largura</label>
                                    <input type="number" className={inputClass} value={customItem.width} onChange={e => setCustomItem({...customItem, width: Number(e.target.value)})} placeholder="0" />
                                </div>
                                <div>
                                    <label className={labelClass}>Altura</label>
                                    <input type="number" className={inputClass} value={customItem.height} onChange={e => setCustomItem({...customItem, height: Number(e.target.value)})} placeholder="0" />
                                </div>
                                <div>
                                    <label className={labelClass}>Qtd Peças</label>
                                    <input type="number" className={inputClass} value={customItem.quantity} onChange={e => setCustomItem({...customItem, quantity: Number(e.target.value)})} />
                                </div>
                             </div>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                <div>
                                    <label className={labelClass}>Preço Venda por m²</label>
                                    <input type="number" className={inputClass} value={customItem.areaPrice} onChange={e => setCustomItem({...customItem, areaPrice: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className={labelClass}>Acabamento (R$)</label>
                                    <input type="number" className={inputClass} value={customItem.finishingPrice} onChange={e => setCustomItem({...customItem, finishingPrice: Number(e.target.value)})} placeholder="Corte/Ilhós" />
                                </div>
                                 <div>
                                    <label className={labelClass}>Custo Interno Total (Opcional)</label>
                                    <input type="number" className={inputClass} value={customItem.unitCost} onChange={e => setCustomItem({...customItem, unitCost: Number(e.target.value)})} />
                                </div>
                                <div className="flex items-end">
                                     <button type="button" onClick={handleCustomAdd} className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-amber-600">Calcular e Add</button>
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className={labelClass}>Unidade (Ex: CX, KG)</label>
                                <input className={inputClass} value={customItem.itemUnit} onChange={e => setCustomItem({...customItem, itemUnit: e.target.value})} placeholder="un" />
                            </div>
                             <div>
                                <label className={labelClass}>Quantidade</label>
                                <input type="number" className={inputClass} value={customItem.quantity} onChange={e => setCustomItem({...customItem, quantity: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className={labelClass}>Valor Unitário (R$)</label>
                                <input type="number" className={inputClass} value={customItem.unitPrice} onChange={e => setCustomItem({...customItem, unitPrice: Number(e.target.value)})} />
                            </div>
                             <div className="flex items-end">
                                <button type="button" onClick={handleCustomAdd} className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-amber-600">Adicionar</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className="mt-2 text-right">
                <button type="button" onClick={onCancel} className="text-xs text-slate-500 hover:underline">Cancelar Inserção</button>
            </div>
        </div>
    )
};

const OrderForm = ({ orderId, onClose, onSaved }: { orderId?: string, onClose: () => void, onSaved: () => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['Pix', 'Cartão de Crédito (Link)']);
  const [isAddingItem, setIsAddingItem] = useState(false);
  
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

  const handleAddItem = (item: OrderItem) => {
      setOrder({ ...order, items: [...order.items, item] });
      setIsAddingItem(false);
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

  const copyToClipboard = async (text: string) => {
      try {
          await navigator.clipboard.writeText(text);
          alert("Link copiado!");
      } catch (err) {
          // Fallback manual
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
              document.execCommand('copy');
              alert("Link copiado!");
          } catch (err2) {
              alert("Erro ao copiar. Por favor, copie manualmente.");
          }
          document.body.removeChild(textArea);
      }
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

            {/* Client Area Link */}
            {orderId && (
                <div className="bg-slate-900 p-5 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <User size={100} className="text-white"/>
                    </div>
                    <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2"><Lock size={18} className="text-amber-500"/> Área do Cliente (Link Público)</h3>
                    <p className="text-slate-400 text-sm mb-4">Envie este link para seu cliente acompanhar o status.</p>
                    
                    <div className="flex gap-2">
                        <div className="flex-1 bg-slate-950 rounded-lg border border-slate-700 p-3 text-slate-300 text-sm truncate font-mono select-all">
                            {window.location.origin + '/#/track/' + order.id}
                        </div>
                        <button type="button" onClick={() => copyToClipboard(window.location.origin + '/#/track/' + order.id)} className="bg-amber-600 hover:bg-amber-500 text-white px-4 rounded-lg font-bold flex items-center gap-2">
                            <Copy size={16}/> Copiar
                        </button>
                    </div>
                </div>
            )}
            
            {/* Internal Control */}
            {orderId && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                     <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Truck size={20} className="text-primary"/> Controle Interno
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className={labelClass}>Link de Produção (Parceiro/Gráfica)</label>
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
                            <label className={labelClass}>Código de Rastreio</label>
                            <input className={`${inputClass} font-mono uppercase`} placeholder="AA123456789BR" value={order.trackingCode || ''} onChange={e => setOrder({...order, trackingCode: e.target.value})} />
                        </div>
                        <div>
                            <label className={labelClass}>Link de Rastreio</label>
                            <input className={inputClass} placeholder="https://rastreamento..." value={order.trackingUrl || ''} onChange={e => setOrder({...order, trackingUrl: e.target.value})} />
                        </div>
                     </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Itens do Pedido</h3>
                </div>
                
                {/* List of Items */}
                <div className="space-y-3 mb-4">
                     {order.items.map((item, idx) => (
                        <div key={item.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 relative flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-3">
                                     <span className="font-bold text-lg text-slate-800 dark:text-white">{item.name}</span>
                                     <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                        {item.itemUnit || 'UN'}
                                     </span>
                                     <span className="font-black text-lg text-primary">{item.quantity}X</span>
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 pl-1">
                                    {item.description}
                                    {item.pricingType === 'area' && (
                                        <div className="text-xs font-mono text-slate-400 mt-1">
                                            ({item.width} x {item.height} {item.unitMeasure} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)} cada)
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <div className="font-bold text-lg text-slate-700 dark:text-slate-200">
                                    R$ {(item.quantity * item.unitPrice).toFixed(2)}
                                </div>
                                <button type="button" onClick={() => removeItem(idx)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={18} /></button>
                            </div>
                        </div>
                     ))}
                     {order.items.length === 0 && !isAddingItem && (
                         <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                             Nenhum item adicionado
                         </div>
                     )}
                </div>

                {isAddingItem ? (
                    <ItemForm 
                        products={products} 
                        onAdd={handleAddItem} 
                        onCancel={() => setIsAddingItem(false)} 
                    />
                ) : (
                    <button type="button" onClick={() => setIsAddingItem(true)} className="w-full py-3 border-2 border-dashed border-primary/50 text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                        <Plus size={20}/> Adicionar Item
                    </button>
                )}
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

            <div className="h-10 md:hidden"></div>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clients, setClients] = useState<Record<string, string>>({});
  
  // Date Filters
  const [dateRange, setDateRange] = useState<'ALL' | '7' | '15' | '30' | 'CUSTOM'>('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const fetchOrders = async () => {
      setLoading(true);
      try {
        const [ordersData, clientsData] = await Promise.all([
            db.orders.list(),
            db.clients.list()
        ]);
        setOrders(ordersData);
        
        const clientMap: Record<string, string> = {};
        clientsData.forEach(c => clientMap[c.id] = c.name);
        setClients(clientMap);
      } catch (error) {
          console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
      fetchOrders();
  }, []);

  const handleDelete = async (id: string) => {
      if(confirm("Tem certeza que deseja excluir este pedido?")) {
          await db.orders.delete(id);
          fetchOrders();
      }
  };

  const isInDateRange = (dateStr: string) => {
      if (dateRange === 'ALL') return true;

      const orderDate = new Date(dateStr);
      orderDate.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      
      if (dateRange === 'CUSTOM') {
          if (!customStart) return true;
          const start = new Date(customStart);
          const end = customEnd ? new Date(customEnd) : new Date(customStart); // If no end, assume same day
          return orderDate >= start && orderDate <= end;
      }

      const diffTime = Math.abs(today.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (dateRange === '7') return diffDays <= 7;
      if (dateRange === '15') return diffDays <= 15;
      if (dateRange === '30') return diffDays <= 30;

      return true;
  };

  const filtered = orders.filter(o => {
      const clientName = clients[o.clientId] || '';
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
          o.id.toLowerCase().includes(searchLower) ||
          clientName.toLowerCase().includes(searchLower) ||
          (o.trackingCode && o.trackingCode.toLowerCase().includes(searchLower))
      );
      
      return matchesSearch && isInDateRange(o.date);
  });
  
  const getStatusColor = (s: OrderStatus) => {
      switch(s) {
          case OrderStatus.APPROVED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
          case OrderStatus.PRODUCTION: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
          case OrderStatus.READY: return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
          case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
          case OrderStatus.CANCELED: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      }
  };

  return (
      <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white self-start md:self-auto">Pedidos</h2>
            <button 
                onClick={() => { setEditingOrderId(null); setIsFormOpen(true); }}
                className="w-full md:w-auto bg-primary hover:bg-amber-600 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
            >
                <Plus size={18} /> Novo Pedido
            </button>
          </div>
          
          {/* New Date Filters Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-slate-800 flex flex-wrap gap-2 items-center transition-colors">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mr-2">
                <Filter size={18} /> <span className="text-sm font-bold">Período:</span>
            </div>
            
            <button onClick={() => setDateRange('7')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dateRange === '7' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>Últimos 7 dias</button>
            <button onClick={() => setDateRange('15')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dateRange === '15' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>Últimos 15 dias</button>
            <button onClick={() => setDateRange('30')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dateRange === '30' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>Últimos 30 dias</button>
            <button onClick={() => setDateRange('ALL')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dateRange === 'ALL' ? 'bg-slate-800 text-white dark:bg-slate-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>Todo Histórico</button>
            <button onClick={() => setDateRange('CUSTOM')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${dateRange === 'CUSTOM' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>Personalizado</button>
            
            {dateRange === 'CUSTOM' && (
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-slate-700 animate-in fade-in slide-in-from-left-2">
                    <input 
                        type="date" 
                        value={customStart} 
                        onChange={e => setCustomStart(e.target.value)}
                        className="border rounded px-2 py-1 text-xs bg-white dark:bg-slate-800 dark:text-white border-primary ring-1 ring-primary" 
                    />
                    <span className="text-slate-400 text-xs">até</span>
                    <input 
                        type="date" 
                        value={customEnd} 
                        onChange={e => setCustomEnd(e.target.value)}
                        className="border rounded px-2 py-1 text-xs bg-white dark:bg-slate-800 dark:text-white border-primary ring-1 ring-primary" 
                    />
                </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
             <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente, ID ou rastreio..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary focus:outline-none dark:text-white transition-all"
                    />
                </div>
             </div>

             {/* Mobile List */}
             <div className="md:hidden">
                 {loading && <div className="p-8 text-center text-gray-500">Carregando...</div>}
                 {filtered.map(order => (
                     <div key={order.id} className="p-4 border-b border-gray-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => { setEditingOrderId(order.id); setIsFormOpen(true); }}>
                         <div className="flex justify-between items-start mb-2">
                             <div>
                                 <div className="font-bold text-slate-800 dark:text-white">#{order.id.substring(0,8)}</div>
                                 <div className="text-sm text-slate-500">{new Date(order.date).toLocaleDateString('pt-BR')}</div>
                             </div>
                             <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(order.status)}`}>
                                 {order.status}
                             </span>
                         </div>
                         <div className="flex justify-between items-center mt-2">
                             <div className="font-medium text-slate-700 dark:text-slate-300">{clients[order.clientId] || 'Cliente Desconhecido'}</div>
                             <div className="text-primary font-bold">R$ {
                                (order.items.reduce((a, b) => a + (b.unitPrice * b.quantity), 0) + (order.freightChargedToCustomer ? order.freightPrice : 0) - (order.discountType === 'money' ? order.discount : (order.items.reduce((a, b) => a + (b.unitPrice * b.quantity), 0) * order.discount/100))).toFixed(2)
                             }</div>
                         </div>
                     </div>
                 ))}
             </div>

             {/* Desktop Table */}
             <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border-b dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {filtered.map(order => {
                             const total = order.items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
                             const finalTotal = total - (order.discountType === 'money' ? order.discount : total * order.discount/100) + (order.freightChargedToCustomer ? order.freightPrice : 0);
                             
                             return (
                                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{order.id.substring(0,8)}</td>
                                    <td className="px-6 py-4">{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{clients[order.clientId] || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">R$ {finalTotal.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <Link to={`/print/order/${order.id}`} target="_blank" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white" title="Imprimir"><Printer size={18}/></Link>
                                        <button onClick={() => { setEditingOrderId(order.id); setIsFormOpen(true); }} className="p-2 text-blue-500 hover:text-blue-700"><Edit2 size={18}/></button>
                                        <button onClick={() => handleDelete(order.id)} className="p-2 text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                                    </td>
                                </tr>
                             );
                        })}
                         {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Nenhum pedido encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
          </div>

          {isFormOpen && (
              <OrderForm 
                  orderId={editingOrderId || undefined} 
                  onClose={() => setIsFormOpen(false)} 
                  onSaved={() => { setIsFormOpen(false); fetchOrders(); }} 
              />
          )}
      </div>
  );
};
