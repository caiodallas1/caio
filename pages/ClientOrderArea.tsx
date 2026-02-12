
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Order, OrderStatus } from '../types';
import { Clock, Package, Truck, CheckCircle, ExternalLink, Box } from 'lucide-react';

export const ClientOrderArea: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [clientName, setClientName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (id) {
                try {
                    const data = await db.orders.getPublic(id);
                    if (data) {
                        setOrder(data.order);
                        setClientName(data.clientName);
                    }
                } catch (e) {
                    console.error("Erro ao carregar pedido publicamente", e);
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando informações do pedido...</div>;
    
    if (!order) return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
            <h1 className="text-3xl font-bold mb-2">Pedido não encontrado</h1>
            <p className="text-slate-400">Verifique se o link está correto.</p>
        </div>
    );

    // Mapeamento de Status para a Timeline
    const steps = [
        { status: OrderStatus.APPROVED, label: 'Pedido Recebido', icon: Clock },
        { status: OrderStatus.PRODUCTION, label: 'Em Produção', icon: Package },
        { status: OrderStatus.READY, label: 'Pronto para Entrega', icon: Box },
        { status: OrderStatus.DELIVERED, label: 'Entregue', icon: CheckCircle },
    ];

    // Lógica simples para determinar o passo atual (0 a 3)
    let currentStepIndex = -1;
    // Normalizar status para índice
    if (order.status === OrderStatus.DRAFT || order.status === OrderStatus.QUOTE) currentStepIndex = -1;
    else if (order.status === OrderStatus.APPROVED) currentStepIndex = 0;
    else if (order.status === OrderStatus.PRODUCTION) currentStepIndex = 1;
    else if (order.status === OrderStatus.READY) currentStepIndex = 2;
    else if (order.status === OrderStatus.DELIVERED) currentStepIndex = 3;
    else if (order.status === OrderStatus.CANCELED) currentStepIndex = -2; // Cancelado

    return (
        <div className="min-h-screen bg-slate-950 font-sans p-4 md:p-8 flex justify-center items-start">
            <div className="max-w-2xl w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-1">Área do Cliente</h1>
                    <p className="text-slate-400 font-medium">{clientName}</p>
                </div>

                {/* Main Card */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
                    
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">Pedido #{order.id}</h2>
                            <p className="text-slate-400">Olá, {clientName.split(' ')[0]}!</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 
                            ${order.status === OrderStatus.CANCELED ? 'bg-red-900/30 text-red-300 border border-red-900' : 'bg-blue-900/30 text-blue-200 border border-blue-800'}`}>
                            {order.status === OrderStatus.CANCELED ? 'Cancelado' : 'Em Aberto'}
                        </span>
                    </div>

                    {/* Timeline */}
                    {order.status !== OrderStatus.CANCELED ? (
                    <div className="relative mb-10 mt-8">
                        {/* Linha de fundo */}
                        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-800 z-0"></div>
                        
                        {/* Linha de progresso */}
                        <div className="absolute top-5 left-0 h-0.5 bg-amber-500 z-0 transition-all duration-1000" style={{ width: `${Math.max(0, currentStepIndex / (steps.length - 1)) * 100}%` }}></div>

                        <div className="relative z-10 flex justify-between">
                            {steps.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                const Icon = step.icon;

                                return (
                                    <div key={step.label} className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                            ${isCompleted || isCurrent ? 'bg-amber-500 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-900 border-slate-700 text-slate-600'}
                                        `}>
                                            <Icon size={18} />
                                        </div>
                                        <span className={`text-[10px] md:text-xs font-medium mt-3 text-center w-20 ${isCompleted || isCurrent ? 'text-white' : 'text-slate-600'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    ) : (
                        <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-xl text-center text-red-200 mb-6">
                            Este pedido foi cancelado. Entre em contato para mais informações.
                        </div>
                    )}

                    <div className="text-sm text-slate-500 flex items-center gap-2">
                        <Clock size={14}/>
                        Pedido realizado em: <span className="text-slate-300 font-medium">{new Date(order.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>

                    {order.trackingCode && (
                        <div className="mt-6 pt-6 border-t border-slate-800">
                             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Rastreamento</h3>
                             <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Código de Rastreio</p>
                                    <p className="text-lg font-mono font-bold text-white tracking-wider selection:bg-amber-500 selection:text-white">{order.trackingCode}</p>
                                </div>
                                {order.trackingUrl && (
                                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                        Rastrear Objeto <ExternalLink size={14}/>
                                    </a>
                                )}
                             </div>
                        </div>
                    )}
                </div>

                {/* Items List */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
                    <h3 className="flex items-center gap-2 text-white font-bold mb-6">
                        <Box size={20} className="text-amber-500"/> 
                        Itens do Pedido
                    </h3>
                    <div className="space-y-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start py-3 border-b border-slate-800 last:border-0">
                                <div className="text-slate-300">
                                    <p className="font-medium text-white">{item.description}</p>
                                </div>
                                <div className="text-slate-500 text-sm font-mono whitespace-nowrap">
                                    Qtd: <span className="text-slate-300">{item.quantity}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center text-slate-600 text-sm pb-8">
                    Dúvidas sobre seu pedido? Entre em contato com {clientName}.
                </div>

            </div>
        </div>
    );
};
