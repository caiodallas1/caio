import React, { useState, useEffect } from 'react';
import { db, generateId } from '../services/db';
import { Client } from '../types';
import { Plus, Edit, Trash2, Search, Phone, Mail } from 'lucide-react';

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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Clientes</h2>
        <button 
          onClick={() => { setCurrentClient({}); setIsModalOpen(true); }}
          className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
              <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-semibold border-b">
                <tr>
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">Contato</th>
                    <th className="px-6 py-4">CPF/CNPJ</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {filtered.map(client => (
                    <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{client.name}</td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1"><Phone size={14} /> {client.whatsapp}</div>
                        {client.email && <div className="flex items-center gap-1 text-slate-400"><Mail size={14} /> {client.email}</div>}
                        </div>
                    </td>
                    <td className="px-6 py-4">{client.doc}</td>
                    <td className="px-6 py-4 text-right">
                        <button 
                        onClick={() => { setCurrentClient(client); setIsModalOpen(true); }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                        <Edit size={18} />
                        </button>
                        <button 
                        onClick={() => handleDelete(client.id)}
                        className="text-red-600 hover:text-red-800"
                        >
                        <Trash2 size={18} />
                        </button>
                    </td>
                    </tr>
                ))}
                {filtered.length === 0 && (
                    <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Nenhum cliente encontrado.</td>
                    </tr>
                )}
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
                <h3 className="text-lg font-bold">{currentClient.id ? 'Editar' : 'Novo'} Cliente</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                  <input required className="w-full border rounded-lg p-2" value={currentClient.name || ''} onChange={e => setCurrentClient({...currentClient, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp *</label>
                    <input required className="w-full border rounded-lg p-2" value={currentClient.whatsapp || ''} onChange={e => setCurrentClient({...currentClient, whatsapp: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                    <input type="email" className="w-full border rounded-lg p-2" value={currentClient.email || ''} onChange={e => setCurrentClient({...currentClient, email: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CPF / CNPJ</label>
                  <input className="w-full border rounded-lg p-2" value={currentClient.doc || ''} onChange={e => setCurrentClient({...currentClient, doc: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                  <textarea rows={2} className="w-full border rounded-lg p-2" value={currentClient.address || ''} onChange={e => setCurrentClient({...currentClient, address: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                  <textarea rows={2} className="w-full border rounded-lg p-2" value={currentClient.notes || ''} onChange={e => setCurrentClient({...currentClient, notes: e.target.value})} />
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