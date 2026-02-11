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

  useEffect(() => {
    setExpenses(db.expenses.list().sort((a,b) => b.date.localeCompare(a.date)));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.expenses.save({
        ...form,
        id: generateId(),
        amount: Number(form.amount)
    } as Expense);
    
    setExpenses(db.expenses.list().sort((a,b) => b.date.localeCompare(a.date)));
    setForm({ date: new Date().toISOString().split('T')[0], amount: 0, category: 'Outros', description: '', recurrent: false });
  };

  const handleDelete = (id: string) => {
    if(confirm('Excluir despesa?')) {
        db.expenses.delete(id);
        setExpenses(db.expenses.list().sort((a,b) => b.date.localeCompare(a.date)));
    }
  };

  const categories = ['Tráfego Pago', 'Internet/Tel', 'Embalagem', 'Fornecedor', 'Aluguel', 'Impostos', 'Outros'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4">Nova Despesa</h3>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Data</label>
                    <input type="date" required className="w-full border rounded p-2" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Categoria</label>
                    <select className="w-full border rounded p-2" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <input className="w-full border rounded p-2" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} placeholder="Ex: Conta de Luz" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Valor (R$)</label>
                    <input type="number" step="0.01" required className="w-full border rounded p-2" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} />
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="rec" checked={form.recurrent} onChange={e => setForm({...form, recurrent: e.target.checked})} />
                    <label htmlFor="rec" className="text-sm">Despesa Recorrente (Apenas marcação)</label>
                </div>
                <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700">Lançar Despesa</button>
            </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b font-bold text-slate-800">Histórico de Despesas</div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-900 border-b">
                        <tr>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Categoria</th>
                            <th className="px-6 py-3">Descrição</th>
                            <th className="px-6 py-3">Valor</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {expenses.map(exp => (
                            <tr key={exp.id} className="hover:bg-slate-50">
                                <td className="px-6 py-3">{new Date(exp.date).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{exp.category}</span></td>
                                <td className="px-6 py-3">{exp.description}</td>
                                <td className="px-6 py-3 font-medium text-red-600">- R$ {exp.amount.toFixed(2)}</td>
                                <td className="px-6 py-3 text-right">
                                    <button onClick={() => handleDelete(exp.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                        {expenses.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Nenhuma despesa lançada.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};
