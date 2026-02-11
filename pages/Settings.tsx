import React, { useState } from 'react';
import { db } from '../services/db';
import { Settings, OrderStatus } from '../types';
import { Plus, X } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(db.settings.get());
  const [newMethod, setNewMethod] = useState('');
  
  const handleSave = () => {
    db.settings.save(settings);
    alert('Configurações salvas!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) return alert('A imagem deve ter menos de 500KB para caber no armazenamento local.');
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStatus = (status: OrderStatus) => {
    const current = settings.statusesConsideredSale;
    if (current.includes(status)) {
      setSettings({ ...settings, statusesConsideredSale: current.filter(s => s !== status) });
    } else {
      setSettings({ ...settings, statusesConsideredSale: [...current, status] });
    }
  };

  const addPaymentMethod = () => {
      if (newMethod && !settings.paymentMethods.includes(newMethod)) {
          setSettings({ ...settings, paymentMethods: [...settings.paymentMethods, newMethod] });
          setNewMethod('');
      }
  };

  const removePaymentMethod = (method: string) => {
      setSettings({ ...settings, paymentMethods: settings.paymentMethods.filter(m => m !== method) });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h3 className="font-bold border-b pb-2">Dados da Empresa (para PDF)</h3>
        <div>
            <label className="block text-sm font-medium mb-1">Nome da Empresa</label>
            <input className="w-full border rounded p-2" value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} />
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Endereço</label>
            <input className="w-full border rounded p-2" value={settings.companyAddress} onChange={e => setSettings({...settings, companyAddress: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium mb-1">CNPJ / CPF</label>
                <input className="w-full border rounded p-2" value={settings.companyDoc} onChange={e => setSettings({...settings, companyDoc: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Contato (Tel/Email)</label>
                <input className="w-full border rounded p-2" value={settings.companyContact} onChange={e => setSettings({...settings, companyContact: e.target.value})} />
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium mb-2">Logo</label>
            <div className="flex items-center gap-4">
                {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-16 w-auto object-contain border rounded" />}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Recomendado: JPG/PNG pequeno (max 500kb).</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h3 className="font-bold border-b pb-2">Regras de Negócio & Pagamento</h3>
        
        <div>
            <label className="block text-sm font-medium mb-2">Formas de Pagamento Aceitas</label>
            <div className="flex gap-2 mb-3">
                <input 
                    className="flex-1 border rounded p-2 text-sm" 
                    placeholder="Nova forma (ex: Pix Nubank)"
                    value={newMethod}
                    onChange={e => setNewMethod(e.target.value)}
                />
                <button type="button" onClick={addPaymentMethod} className="bg-slate-100 p-2 rounded hover:bg-slate-200">
                    <Plus size={20} />
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {settings.paymentMethods.map(method => (
                    <span key={method} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {method}
                        <button onClick={() => removePaymentMethod(method)} className="text-blue-400 hover:text-blue-600"><X size={14}/></button>
                    </span>
                ))}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium mb-2">Quais status contam como "Venda" no Dashboard?</label>
            <div className="grid grid-cols-2 gap-2">
                {Object.values(OrderStatus).map(s => (
                    <div key={s} className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id={`st-${s}`}
                            checked={settings.statusesConsideredSale.includes(s)}
                            onChange={() => toggleStatus(s)}
                        />
                        <label htmlFor={`st-${s}`} className="text-sm">{s}</label>
                    </div>
                ))}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium mb-1">Termos Padrão (Orçamento)</label>
            <textarea className="w-full border rounded p-2" rows={3} value={settings.quoteTerms} onChange={e => setSettings({...settings, quoteTerms: e.target.value})} />
        </div>
      </div>

      <button onClick={handleSave} className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-yellow-700 shadow-md">Salvar Tudo</button>
    </div>
  );
};