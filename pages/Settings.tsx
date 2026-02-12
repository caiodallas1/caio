
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Settings, OrderStatus, DEFAULT_SETTINGS } from '../types';
import { Plus, X, Upload } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [newMethod, setNewMethod] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.settings.get().then(s => {
        setSettings(s);
        setLoading(false);
    });
  }, []);
  
  const handleSave = async () => {
    await db.settings.save(settings);
    alert('Configurações salvas!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) return alert('A imagem deve ter menos de 500KB para caber no banco.');
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

  const inputClass = "w-full border border-gray-300 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-colors";
  const labelClass = "block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300";

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-slate-400">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-0">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Configurações</h2>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-6 transition-colors">
        <h3 className="font-bold text-lg border-b border-gray-100 dark:border-slate-800 pb-2 text-slate-800 dark:text-white">Dados da Empresa</h3>
        <div>
            <label className={labelClass}>Nome da Empresa</label>
            <input className={inputClass} value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} />
        </div>
        <div>
            <label className={labelClass}>Endereço</label>
            <input className={inputClass} value={settings.companyAddress} onChange={e => setSettings({...settings, companyAddress: e.target.value})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className={labelClass}>CNPJ / CPF</label>
                <input className={inputClass} value={settings.companyDoc} onChange={e => setSettings({...settings, companyDoc: e.target.value})} />
            </div>
            <div>
                <label className={labelClass}>Contato (Tel/Email)</label>
                <input className={inputClass} value={settings.companyContact} onChange={e => setSettings({...settings, companyContact: e.target.value})} />
            </div>
        </div>
        <div>
            <label className={labelClass}>Logo (para relatórios)</label>
            <div className="flex items-center gap-4 mt-2">
                {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="h-16 w-16 object-contain border dark:border-slate-700 rounded bg-white" />
                ) : (
                    <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                        <Upload size={20}/>
                    </div>
                )}
                <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm transition-colors">
                    Alterar Logo
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-6 transition-colors">
        <h3 className="font-bold text-lg border-b border-gray-100 dark:border-slate-800 pb-2 text-slate-800 dark:text-white">Regras de Negócio</h3>
        
        <div>
            <label className={labelClass}>Formas de Pagamento Aceitas</label>
            <div className="flex gap-2 mb-3">
                <input 
                    className={inputClass} 
                    placeholder="Nova forma (ex: Pix Nubank)"
                    value={newMethod}
                    onChange={e => setNewMethod(e.target.value)}
                />
                <button type="button" onClick={addPaymentMethod} className="bg-primary hover:bg-amber-600 text-white p-3 rounded-lg shadow-sm transition-colors">
                    <Plus size={20} />
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {settings.paymentMethods.map(method => (
                    <span key={method} className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                        {method}
                        <button onClick={() => removePaymentMethod(method)} className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200"><X size={14}/></button>
                    </span>
                ))}
            </div>
        </div>

        <div>
            <label className={`${labelClass} mb-3`}>Quais status contam como "Venda" no Dashboard?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(OrderStatus).map(s => (
                    <div key={s} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                        <input 
                            type="checkbox" 
                            id={`st-${s}`}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={settings.statusesConsideredSale.includes(s)}
                            onChange={() => toggleStatus(s)}
                        />
                        <label htmlFor={`st-${s}`} className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer flex-1">{s}</label>
                    </div>
                ))}
            </div>
        </div>

        <div>
            <label className={labelClass}>Termos Padrão (Orçamento)</label>
            <textarea className={inputClass} rows={3} value={settings.quoteTerms} onChange={e => setSettings({...settings, quoteTerms: e.target.value})} />
        </div>
      </div>

      <button onClick={handleSave} className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-amber-600 shadow-lg transition-transform active:scale-[0.99] text-lg">
        Salvar Configurações
      </button>
    </div>
  );
};
