import React, { useMemo, useState } from 'react';
import { db } from '../services/db';
import { Order, OrderStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  
  const settings = db.settings.get();
  const orders = db.orders.list();
  const expenses = db.expenses.list();
  const products = db.products.list();

  // Calculation Logic
  const metrics = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    
    // Filter orders for the selected month and considered status
    const monthOrders = orders.filter(o => {
      const orderDate = o.date.substring(0, 7);
      const isConsideredSale = settings.statusesConsideredSale.includes(o.status);
      return orderDate === selectedMonth && isConsideredSale && o.status !== OrderStatus.CANCELED;
    });

    const monthExpenses = expenses.filter(e => e.date.substring(0, 7) === selectedMonth);

    let totalRevenue = 0;
    let totalCostGoods = 0;
    let totalFreightCost = 0;
    let totalExpenses = 0;

    monthOrders.forEach(order => {
      let orderSubtotal = 0;
      let orderCost = 0;
      
      order.items.forEach(item => {
        orderSubtotal += item.unitPrice * item.quantity;
        orderCost += item.unitCost * item.quantity;
      });

      // Calculate discount
      const discountVal = order.discountType === 'money' 
        ? order.discount 
        : (orderSubtotal * (order.discount / 100));
      
      let orderRevenue = orderSubtotal - discountVal;

      // Freight Logic
      if (order.freightChargedToCustomer) {
        orderRevenue += order.freightPrice;
      }
      
      totalRevenue += orderRevenue;
      totalCostGoods += orderCost;
      totalFreightCost += order.freightPrice;
    });

    totalExpenses = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    const netProfit = totalRevenue - (totalCostGoods + totalFreightCost + totalExpenses);
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Daily Data for Chart
    const dailyDataMap = new Map<string, { day: string, Vendas: number, Lucro: number }>();
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    
    for(let i=1; i<=daysInMonth; i++) {
        const dayStr = i.toString().padStart(2, '0');
        dailyDataMap.set(dayStr, { day: dayStr, Vendas: 0, Lucro: 0 });
    }

    monthOrders.forEach(order => {
        const day = order.date.split('-')[2];
        const prev = dailyDataMap.get(day) || { day, Vendas: 0, Lucro: 0 };
        
        // Re-calculate basic order revenue/profit for the chart
        let sub = 0;
        let cst = 0;
        order.items.forEach(i => { sub += i.unitPrice * i.quantity; cst += i.unitCost * i.quantity; });
        const disc = order.discountType === 'money' ? order.discount : (sub * order.discount/100);
        let rev = sub - disc;
        if(order.freightChargedToCustomer) rev += order.freightPrice;
        
        const prof = rev - (cst + order.freightPrice);

        dailyDataMap.set(day, {
            day,
            Vendas: prev.Vendas + rev,
            Lucro: prev.Lucro + prof
        });
    });

    // Subtract daily portion of monthly expenses? 
    // Usually dashboards show operational profit on orders vs total expenses separate, 
    // but to graph "Daily Profit" is tricky with lumped monthly expenses. 
    // We will graph Order Profit vs Order Sales.
    
    const chartData = Array.from(dailyDataMap.values()).sort((a,b) => parseInt(a.day) - parseInt(b.day));

    return {
      totalRevenue,
      totalCostGoods,
      totalFreightCost,
      totalExpenses,
      netProfit,
      margin,
      chartData,
      countOrders: monthOrders.length
    };
  }, [selectedMonth, orders, expenses, settings]);

  const formatMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Financeiro</h2>
        <input 
          type="month" 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded-md px-3 py-2 bg-white text-slate-700"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Faturamento" 
          value={formatMoney(metrics.totalRevenue)} 
          icon={<TrendingUp className="text-green-500" />} 
          sub={`Em ${metrics.countOrders} pedidos`}
        />
        <MetricCard 
          title="Lucro Líquido" 
          value={formatMoney(metrics.netProfit)} 
          valueColor={metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}
          icon={<DollarSign className="text-blue-500" />} 
          sub={`Margem: ${metrics.margin.toFixed(1)}%`}
        />
        <MetricCard 
          title="Custos (Prod + Frete)" 
          value={formatMoney(metrics.totalCostGoods + metrics.totalFreightCost)} 
          icon={<Package className="text-orange-500" />} 
          sub={`Prod: ${formatMoney(metrics.totalCostGoods)} | Frete: ${formatMoney(metrics.totalFreightCost)}`}
        />
        <MetricCard 
          title="Despesas Fixas" 
          value={formatMoney(metrics.totalExpenses)} 
          icon={<TrendingDown className="text-red-500" />} 
          sub="Do mês selecionado"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
        <h3 className="text-lg font-semibold mb-4">Evolução Diária (Vendas x Lucro Op.)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics.chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatMoney(value)} />
            <Bar dataKey="Vendas" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Lucro" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, sub, valueColor = "text-slate-800" }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start mb-2">
      <span className="text-slate-500 font-medium text-sm">{title}</span>
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
    </div>
    <div className={`text-2xl font-bold ${valueColor} mb-1`}>{value}</div>
    {sub && <div className="text-xs text-slate-400">{sub}</div>}
  </div>
);
