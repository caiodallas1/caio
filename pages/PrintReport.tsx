import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { Order, Expense, Settings, OrderStatus } from '../types';

export const PrintReport: React.FC = () => {
  const { month } = useParams<{ month: string }>(); // YYYY-MM
  const [settings, setSettings] = useState<Settings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const load = async () => {
        const [s, o, e] = await Promise.all([
            db.settings.get(),
            db.orders.list(),
            db.expenses.list()
        ]);
        setSettings(s);
        setOrders(o);
        setExpenses(e);
    };
    load();
  }, []);

  const metrics = useMemo(() => {
    if (!month || !settings) return null;

    const monthOrders = orders.filter(o => {
      const orderDate = o.date.substring(0, 7);
      const isConsideredSale = settings.statusesConsideredSale.includes(o.status);
      return orderDate === month && isConsideredSale && o.status !== OrderStatus.CANCELED;
    });

    const monthExpenses = expenses.filter(e => e.date.substring(0, 7) === month);

    let totalRevenue = 0;
    let totalCostGoods = 0;
    let totalFreightCost = 0;
    
    monthOrders.forEach(order => {
      let orderSubtotal = 0;
      let orderCost = 0;
      
      order.items.forEach(item => {
        orderSubtotal += item.unitPrice * item.quantity;
        orderCost += item.unitCost * item.quantity;
      });

      const discountVal = order.discountType === 'money' 
        ? order.discount 
        : (orderSubtotal * (order.discount / 100));
      
      let orderRevenue = orderSubtotal - discountVal;

      if (order.freightChargedToCustomer) {
        orderRevenue += order.freightPrice;
      } else {
        totalFreightCost += order.freightPrice;
      }
      
      totalRevenue += orderRevenue;
      totalCostGoods += orderCost;
    });

    const totalExpenses = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalRevenue - (totalCostGoods + totalFreightCost + totalExpenses);
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    monthExpenses.forEach(e => {
        expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    return {
      totalRevenue,
      totalCostGoods,
      totalFreightCost,
      totalExpenses,
      netProfit,
      margin,
      countOrders: monthOrders.length,
      expensesByCategory
    };
  }, [month, orders, expenses, settings]);

  if (!metrics || !settings || !month) return <div className="p-8">Carregando relatório...</div>;

  const [yearStr, monthStr] = month.split('-');
  const dateObj = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
  const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

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
                    <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">RELATÓRIO MENSAL</h2>
                    <p className="font-mono text-lg font-bold text-slate-800 capitalize">{monthName}</p>
                    <p className="text-sm text-slate-500 mt-1">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 p-4 rounded border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase">Faturamento Total</span>
                    <div className="text-2xl font-bold text-slate-800">{formatMoney(metrics.totalRevenue)}</div>
                    <div className="text-xs text-slate-500">{metrics.countOrders} pedidos considerados</div>
                </div>
                <div className="bg-slate-50 p-4 rounded border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase">Resultado Líquido</span>
                    <div className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatMoney(metrics.netProfit)}
                    </div>
                    <div className="text-xs text-slate-500">Margem: {metrics.margin.toFixed(1)}%</div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="mb-8">
                <h3 className="font-bold text-slate-800 border-b border-slate-300 mb-4 pb-2">Demonstrativo de Resultado (DRE Simplificado)</h3>
                <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="py-2 font-medium text-slate-700"> (+) Receita de Vendas</td>
                            <td className="py-2 text-right font-medium text-slate-800">{formatMoney(metrics.totalRevenue)}</td>
                        </tr>
                        <tr>
                            <td className="py-2 pl-4 text-slate-500"> (-) Custo dos Produtos (CMV)</td>
                            <td className="py-2 text-right text-red-500">- {formatMoney(metrics.totalCostGoods)}</td>
                        </tr>
                        <tr>
                            <td className="py-2 pl-4 text-slate-500"> (-) Fretes Pagos (Custo)</td>
                            <td className="py-2 text-right text-red-500">- {formatMoney(metrics.totalFreightCost)}</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                            <td className="py-2 font-medium text-slate-800"> (=) Margem de Contribuição</td>
                            <td className="py-2 text-right text-slate-800">{formatMoney(metrics.totalRevenue - metrics.totalCostGoods - metrics.totalFreightCost)}</td>
                        </tr>
                         <tr>
                            <td className="py-2 font-medium text-slate-700 pt-4"> (-) Despesas Operacionais</td>
                            <td className="py-2 text-right text-red-500 pt-4">- {formatMoney(metrics.totalExpenses)}</td>
                        </tr>
                        {Object.entries(metrics.expensesByCategory).map(([cat, val]) => (
                             <tr key={cat}>
                                <td className="py-1 pl-4 text-slate-500 text-xs">{cat}</td>
                                <td className="py-1 text-right text-slate-500 text-xs">- {formatMoney(val as number)}</td>
                            </tr>
                        ))}
                        <tr className="border-t-2 border-slate-800 text-lg">
                            <td className="py-3 font-bold text-slate-900"> (=) LUCRO LÍQUIDO</td>
                            <td className={`py-3 text-right font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatMoney(metrics.netProfit)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-12 text-center text-xs text-slate-400 print:hidden">
                <button onClick={() => window.print()} className="bg-primary text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-blue-700 flex items-center gap-2 mx-auto">
                    <span>IMPRIMIR / SALVAR PDF</span>
                </button>
            </div>
        </div>
    </div>
  );
};