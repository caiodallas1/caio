
import React, { useState, useEffect } from 'react';
import { db, generateId } from '../services/db';
import { Expense } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: 'Outros',
    recurrent: false
  });
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
      const data = await db.expenses.list();
      setExpenses(data.sort((a,b) => b.date.localeCompare(a.date)));
      setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.expenses.save({
        ...form,
        id: generateId(),
        amount: Number(form.amount)
    } as Expense);
    
    await fetchExpenses();
    setForm({ date: new Date().toISOString().split('T')[0], amount: 0, category: 'Outros', description: '', recurrent: false });
  };

  const handleDelete = async (id: string) => {
    if(confirm('Excluir despesa?')) {
        await db.expenses.delete(id);
        await fetchExpenses();
    }
  };

  const categories = ['Tráfego Pago', 'Internet/Tel', 'Embalagem', 'Fornecedor', 'Aluguel', 'Impostos', 'Outros'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 order-1">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 sticky top-4">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Nova Despesa</h3>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Data</label>
                    <input type="date" required className="w-full border dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Categoria</label>
                    <select className="w-full border dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Descrição</label>
                    <input className="w-full border dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} placeholder="Ex: Conta de Luz" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Valor (R$)</label>
                    <input type="number" step="0.01" required className="w-full border dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white text-lg font-semibold" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} />
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="rec" className="w-5 h-5" checked={form.recurrent} onChange={e => setForm({...form, recurrent: e.target.checked})} />
                    <label htmlFor="rec" className="text-sm dark:text-slate-400">Despesa Recorrente</label>
                </div>
                <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-700 font-bold shadow-md">Lançar Despesa</button>
            </form>
        </div>
      </div>

      <div className="lg:col-span-2 order-2">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b dark:border-slate-800 font-bold text-slate-800 dark:text-white">Histórico de Despesas</div>
            
            {/* MOBILE CARD LIST */}
            <div className="md:hidden">
                 {loading && <div className="p-8 text-center text-gray-500">Carregando...</div>}
                 {expenses.map(exp => (
                     <div key={exp.id} className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                         <div>
                             <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{new Date(exp.date).toLocaleDateString('pt-BR')} <span className="mx-1">•</span> {exp.category}</div>
                             <div className="font-medium text-slate-800 dark:text-white">{exp.description || 'Sem descrição'}</div>
                         </div>
                         <div className="text-right">
                             <div className="font-bold text-red-600 dark:text-red-400 whitespace-nowrap">- R$ {exp.amount.toFixed(2)}</div>
                             <button onClick={() => handleDelete(exp.id)} className="text-xs text-slate-400 mt-1 underline">Excluir</button>
                         </div>
                     </div>
                 ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
                {loading ? <div className="p-8 text-center text-gray-500">Carregando...</div> : (
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-b dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Categoria</th>
                            <th className="px-6 py-3">Descrição</th>
                            <th className="px-6 py-3">Valor</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {expenses.map(exp => (
                            <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-3">{new Date(exp.date).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-3"><span className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-medium">{exp.category}</span></td>
                                <td className="px-6 py-3">{exp.description}</td>
                                <td className="px-6 py-3 font-medium text-red-600 dark:text-red-400">- R$ {exp.amount.toFixed(2)}</td>
                                <td className="px-6 py-3 text-right">
                                    <button onClick={() => handleDelete(exp.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                        {expenses.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nenhuma despesa lançada.</td></tr>}
                    </tbody>
                </table>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
