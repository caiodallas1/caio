
import React, { useState, useEffect } from 'react';
import { db, generateId } from '../services/db';
import { Product } from '../types';
import { Plus, Edit, Trash2, Search, ImageIcon, Tag, Upload, X } from 'lucide-react';

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1000000) return alert('A imagem deve ter menos de 1MB.'); // 1MB limit for base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrent({ ...current, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
      setCurrent({ ...current, image: '' });
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const formatMoney = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white self-start md:self-auto">Produtos / Serviços</h2>
        <button 
          onClick={() => { setCurrent({ active: true, price: 0, cost: 0 }); setIsModalOpen(true); }}
          className="w-full md:w-auto bg-primary hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <Plus size={18} /> Novo Item
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou código..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary focus:outline-none dark:text-white transition-all"
            />
          </div>
        </div>
        
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto">
          {loading ? <div className="p-8 text-center text-gray-500">Carregando...</div> : (
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border-b dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 w-16">Img</th>
                <th className="px-6 py-4">Código / Nome</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Preço Venda</th>
                <th className="px-6 py-4">Custo</th>
                <th className="px-6 py-4">Margem Unit.</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filtered.map(p => {
                const margin = p.price - p.cost;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                        {p.image ? (
                            <img src={p.image} alt="" className="w-10 h-10 rounded object-cover border border-gray-100 dark:border-slate-700" />
                        ) : (
                            <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300"><ImageIcon size={16}/></div>
                        )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                        <div className="flex flex-col">
                            <span className="font-bold">{p.name}</span>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                {p.code && <span className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 px-1 rounded border border-yellow-100 dark:border-yellow-900/30 font-mono">{p.code}</span>}
                                <span>{p.unit}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">{p.category}</span></td>
                    <td className="px-6 py-4 font-semibold">{formatMoney(p.price)}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatMoney(p.cost)}</td>
                    <td className="px-6 py-4 text-green-600 dark:text-green-400">
                        {formatMoney(margin)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setCurrent(p); setIsModalOpen(true); }} className="text-blue-600 dark:text-blue-400 mr-3"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 dark:text-red-400"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Nenhum produto cadastrado.</td></tr>}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg animate-in fade-in zoom-in duration-200 border dark:border-slate-800">
            <form onSubmit={handleSave}>
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold dark:text-white">{current.id ? 'Editar' : 'Novo'} Produto</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">✕</button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1 dark:text-slate-300">Código (Opcional)</label>
                        <input className="w-full border dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white" value={current.code || ''} onChange={e => setCurrent({...current, code: e.target.value})} placeholder="ex: 001" />
                    </div>
                     <div className="flex-[2]">
                        <label className="block text-sm font-medium mb-1 dark:text-slate-300">Nome *</label>
                        <input required className="w-full border dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white" value={current.name || ''} onChange={e => setCurrent({...current, name: e.target.value})} />
                    </div>
                </div>
                
                <div>
                     <label className="block text-sm font-medium mb-1 dark:text-slate-300">Imagem do Produto</label>
                     <div className="flex items-center gap-4">
                        {current.image ? (
                            <div className="relative">
                                <img src={current.image} alt="Preview" className="h-20 w-20 object-cover rounded-lg border dark:border-slate-700" />
                                <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600">
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                                <ImageIcon size={24}/>
                            </div>
                        )}
                        
                        <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                            <Upload size={16}/> Carregar do PC
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                     </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-slate-300">Unidade (un, kg)</label>
                        <input className="w-full border dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white" value={current.unit || ''} onChange={e => setCurrent({...current, unit: e.target.value})} placeholder="ex: un" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-slate-300">Categoria</label>
                        <input className="w-full border dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white" value={current.category || ''} onChange={e => setCurrent({...current, category: e.target.value})} placeholder="ex: Serviços" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Preço Venda (R$)</label>
                    <input type="number" step="0.01" className="w-full border dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white" value={current.price} onChange={e => setCurrent({...current, price: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Custo Padrão (R$)</label>
                    <input type="number" step="0.01" className="w-full border dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50 dark:text-white" value={current.cost} onChange={e => setCurrent({...current, cost: Number(e.target.value)})} />
                  </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-slate-300">Descrição</label>
                    <textarea className="w-full border dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 dark:text-white" value={current.description || ''} onChange={e => setCurrent({...current, description: e.target.value})} />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 font-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
