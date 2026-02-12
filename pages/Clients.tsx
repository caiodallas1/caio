
import React, { useState, useEffect } from 'react';
import { db, generateId } from '../services/db';
import { Client } from '../types';
import { Plus, Edit, Trash2, Search, Phone, Mail, MapPin } from 'lucide-react';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
      const data = await db.clients.list();
      setClients(data);
      setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClient = {
      ...currentClient,
      id: currentClient.id || generateId(),
    } as Client;
    
    await db.clients.save(newClient);
    await fetchClients();
    setIsModalOpen(false);
    setCurrentClient({});
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      await db.clients.delete(id);
      await fetchClients();
    }
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.whatsapp.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white self-start md:self-auto">Clientes</h2>
        <button 
          onClick={() => { setCurrentClient({}); setIsModalOpen(true); }}
          className="w-full md:w-auto bg-primary hover:bg-amber-600 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary focus:outline-none dark:text-white transition-all"
            />
          </div>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden">
            {loading && <div className="p-8 text-center text-gray-500">Carregando...</div>}
            {filtered.map(client => (
                <div key={client.id} className="p-5 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-slate-800 dark:text-white text-lg">{client.name}</h3>
                         <div className="flex gap-2">
                            <button onClick={() => { setCurrentClient(client); setIsModalOpen(true); }} className="p-2 text-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Edit size={16}/>
                            </button>
                             <button onClick={() => handleDelete(client.id)} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <Trash2 size={16}/>
                            </button>
                         </div>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2"><Phone size={14} className="text-primary"/> {client.whatsapp}</div>
                        {client.email && <div className="flex items-center gap-2"><Mail size={14}/> {client.email}</div>}
                        {client.address && <div className="flex items-center gap-2"><MapPin size={14}/> {client.address}</div>}
                    </div>
                </div>
            ))}
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto">
          {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-slate-400">Carregando...</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border-b dark:border-slate-700">
                <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Nome</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Contato</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">CPF/CNPJ</th>
                    <th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-[11px]">Ações</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filtered.map(client => (
                    <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{client.name}</td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1"><Phone size={14} className="text-primary" /> {client.whatsapp}</div>
                        {client.email && <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500"><Mail size={14} /> {client.email}</div>}
                        </div>
                    </td>
                    <td className="px-6 py-4">{client.doc || '-'}</td>
                    <td className="px-6 py-4 text-right">
                        <button 
                        onClick={() => { setCurrentClient(client); setIsModalOpen(true); }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        >
                        <Edit size={18} />
                        </button>
                        <button 
                        onClick={() => handleDelete(client.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                        <Trash2 size={18} />
                        </button>
                    </td>
                    </tr>
                ))}
                {filtered.length === 0 && (
                    <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 dark:text-slate-600 italic">Nenhum cliente encontrado.</td>
                    </tr>
                )}
                </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <form onSubmit={handleSave}>
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold dark:text-white">{currentClient.id ? 'Editar' : 'Novo'} Cliente</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">✕</button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome Completo *</label>
                  <input required className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 dark:text-white focus:ring-2 focus:ring-primary outline-none" value={currentClient.name || ''} onChange={e => setCurrentClient({...currentClient, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">WhatsApp *</label>
                    <input required className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 dark:text-white focus:ring-2 focus:ring-primary outline-none" value={currentClient.whatsapp || ''} onChange={e => setCurrentClient({...currentClient, whatsapp: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">E-mail</label>
                    <input type="email" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 dark:text-white focus:ring-2 focus:ring-primary outline-none" value={currentClient.email || ''} onChange={e => setCurrentClient({...currentClient, email: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">CPF / CNPJ</label>
                  <input className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 dark:text-white focus:ring-2 focus:ring-primary outline-none" value={currentClient.doc || ''} onChange={e => setCurrentClient({...currentClient, doc: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Endereço</label>
                  <textarea rows={2} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 dark:text-white focus:ring-2 focus:ring-primary outline-none" value={currentClient.address || ''} onChange={e => setCurrentClient({...currentClient, address: e.target.value})} />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-amber-600 shadow-lg font-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
