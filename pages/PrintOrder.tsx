import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Order, Client, Settings } from '../types';

export const PrintOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    if (id) {
        const o = db.orders.get(id);
        if (o) {
            setOrder(o);
            const c = db.clients.get(o.clientId);
            if(c) setClient(c);
        }
    }
    setSettings(db.settings.get());
  }, [id]);

  if (!order || !client || !settings) return <div>Carregando...</div>;

  const subtotal = order.items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
  const discountVal = order.discountType === 'money' ? order.discount : (subtotal * order.discount / 100);
  // For the customer, freight is only visible if charged.
  const finalTotal = subtotal - discountVal + (order.freightChargedToCustomer ? order.freightPrice : 0);

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0">
        <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none p-10 print:p-8 min-h-[297mm]">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                <div className="flex items-start gap-4">
                    {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-20 w-auto object-contain" />}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{settings.companyName}</h1>
                        <p className="text-sm text-slate-600 whitespace-pre-line">
                            {settings.companyAddress}<br/>
                            {settings.companyDoc && `CNPJ/CPF: ${settings.companyDoc}`}<br/>
                            {settings.companyContact}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">{order.status === 'Orçamento' ? 'ORÇAMENTO' : 'PEDIDO'}</h2>
                    <p className="font-mono text-lg font-bold text-slate-800">#{order.id.substring(0,6).toUpperCase()}</p>
                    <p className="text-sm text-slate-500 mt-1">Data: {new Date(order.date).toLocaleDateString('pt-BR')}</p>
                    {order.status === 'Orçamento' && (
                         <p className="text-sm text-slate-500">Válido até: {new Date(new Date(order.date).getTime() + (settings.quoteValidityDays * 86400000)).toLocaleDateString('pt-BR')}</p>
                    )}
                </div>
            </div>

            {/* Client Info */}
            <div className="mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cliente</h3>
                <div className="text-slate-800">
                    <p className="font-bold text-lg">{client.name}</p>
                    <p>{client.doc && `CPF/CNPJ: ${client.doc}`}</p>
                    <p>{client.whatsapp} {client.email && `| ${client.email}`}</p>
                    <p className="text-sm text-slate-600 mt-1">{client.address}</p>
                </div>
            </div>

            {/* Items */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b-2 border-slate-800">
                        <th className="text-left py-2 text-sm font-bold text-slate-800">ITEM / DESCRIÇÃO</th>
                        <th className="text-center py-2 text-sm font-bold text-slate-800 w-20">QTD</th>
                        <th className="text-right py-2 text-sm font-bold text-slate-800 w-32">VALOR UN.</th>
                        <th className="text-right py-2 text-sm font-bold text-slate-800 w-32">TOTAL</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {order.items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="py-3 text-sm text-slate-700">
                                {item.description}
                            </td>
                            <td className="py-3 text-center text-sm text-slate-700">{item.quantity}</td>
                            <td className="py-3 text-right text-sm text-slate-700">
                                {item.unitPrice.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                            </td>
                            <td className="py-3 text-right text-sm font-medium text-slate-800">
                                {(item.unitPrice * item.quantity).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>Subtotal:</span>
                        <span>{subtotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                    </div>
                    {discountVal > 0 && (
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Desconto:</span>
                            <span>- {discountVal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                        </div>
                    )}
                    {order.freightChargedToCustomer && order.freightPrice > 0 && (
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Frete/Entrega:</span>
                            <span>{order.freightPrice.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-slate-900 border-t-2 border-slate-800 pt-2">
                        <span>TOTAL:</span>
                        <span>{finalTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                    </div>
                </div>
            </div>

            {/* Footer / Terms */}
            <div className="border-t border-gray-200 pt-6 text-sm text-slate-600">
                <h4 className="font-bold text-slate-800 mb-2">Observações & Termos:</h4>
                <p className="whitespace-pre-line mb-4">{settings.quoteTerms}</p>
                {order.notes && (
                    <div className="mt-4">
                         <h4 className="font-bold text-slate-800 mb-1">Notas do Pedido:</h4>
                         <p>{order.notes}</p>
                    </div>
                )}
            </div>
            
            <div className="mt-12 text-center text-xs text-slate-400 print:hidden">
                <button onClick={() => window.print()} className="bg-primary text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-blue-700">IMPRIMIR / SALVAR PDF</button>
            </div>
        </div>
    </div>
  );
};
