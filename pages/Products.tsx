import React, { useState, useEffect } from 'react';
import { db, generateId } from '../services/db';
import { Product } from '../types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [current, setCurrent] = useState<Partial<Product>>({ active: true, price: 0, cost: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
      const data = await db.products.list();
      setProducts(data);
      setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct = {
      ...current,
      id: current.id || generateId(),
      price: Number(current.price),
      cost: Number(current.cost),
    } as Product;
    
    await db.products.save(newProduct);
    await fetchProducts();
    setIsModalOpen(false);
    setCurrent({ active: true, price: 0, cost: 0 });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza?')) {
      await db.products.delete(id);
      await fetchProducts();
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const formatMoney = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Produtos / Serviços</h2>
        <button 
          onClick={() => { setCurrent({ active: true, price: 0, cost: 0 }); setIsModalOpen(true); }}
          className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Novo Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar produto..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="p-8 text-center text-gray-500">Carregando...</div> : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Preço Venda</th>
                <th className="px-6 py-4">Custo</th>
                <th className="px-6 py-4">Margem Unit.</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => {
                const margin = p.price - p.cost;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">
                        {p.name}
                        <div className="text-xs text-gray-400">{p.unit}</div>
                    </td>
                    <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{p.category}</span></td>
                    <td className="px-6 py-4 font-semibold">{formatMoney(p.price)}</td>
                    <td className="px-6 py-4 text-slate-500">{formatMoney(p.cost)}</td>
                    <td className="px-6 py-4 text-green-600">
                        {formatMoney(margin)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setCurrent(p); setIsModalOpen(true); }} className="text-blue-600 mr-3"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Nenhum produto cadastrado.</td></tr>}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <form onSubmit={handleSave}>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold">{current.id ? 'Editar' : 'Novo'} Produto</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome *</label>
                  <input required className="w-full border rounded-lg p-2" value={current.name || ''} onChange={e => setCurrent({...current, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Unidade (un, m², kg)</label>
                        <input className="w-full border rounded-lg p-2" value={current.unit || ''} onChange={e => setCurrent({...current, unit: e.target.value})} placeholder="ex: un" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Categoria</label>
                        <input className="w-full border rounded-lg p-2" value={current.category || ''} onChange={e => setCurrent({...current, category: e.target.value})} placeholder="ex: Serviços" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço Venda (R$)</label>
                    <input type="number" step="0.01" className="w-full border rounded-lg p-2" value={current.price} onChange={e => setCurrent({...current, price: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Custo Padrão (R$)</label>
                    <input type="number" step="0.01" className="w-full border rounded-lg p-2 bg-slate-50" value={current.cost} onChange={e => setCurrent({...current, cost: Number(e.target.value)})} />
                    <p className="text-xs text-gray-500 mt-1">Usado para cálculo de lucro</p>
                  </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <textarea className="w-full border rounded-lg p-2" value={current.description || ''} onChange={e => setCurrent({...current, description: e.target.value})} />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};