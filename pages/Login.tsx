
import React, { useState } from 'react';
import { auth } from '../services/auth';
import { Key, PlusCircle, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const [inputKey, setInputKey] = useState('');
  const [view, setView] = useState<'initial' | 'enter'>('initial');

  const handleGenerate = () => {
    const newKey = auth.generateKey();
    if (confirm(`Sua nova chave é: ${newKey}\n\nANOTE ESTA CHAVE! Você precisará dela para acessar seus dados em outros dispositivos.`)) {
        auth.setAccessKey(newKey);
    }
  };

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.length < 4) return alert('Chave inválida');
    auth.setAccessKey(inputKey);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">G</div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Gestor Pro</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Controle total sem senhas chatas</p>
        </div>

        {view === 'initial' ? (
            <div className="space-y-4">
                <button 
                    onClick={handleGenerate}
                    className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-amber-600 text-white py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02]"
                >
                    <PlusCircle size={22} />
                    Começar Novo Sistema
                </button>
                <button 
                    onClick={() => setView('enter')}
                    className="w-full flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-xl font-bold transition-all"
                >
                    <LogIn size={22} />
                    Já tenho uma Chave
                </button>
                <div className="pt-4 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Seus dados são salvos na nuvem via chave</p>
                </div>
            </div>
        ) : (
            <form onSubmit={handleAccess} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Insira sua Chave de Acesso</label>
                    <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            required 
                            autoFocus
                            placeholder="GPRO-XXXXXX"
                            className="w-full border-2 border-slate-100 focus:border-primary rounded-xl p-4 pl-12 text-lg font-mono uppercase focus:outline-none transition-all" 
                            value={inputKey}
                            onChange={e => setInputKey(e.target.value)}
                        />
                    </div>
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 shadow-lg transition-all"
                >
                    Acessar Painel
                </button>
                <button 
                    type="button"
                    onClick={() => setView('initial')}
                    className="w-full text-slate-400 text-sm font-bold hover:text-slate-600"
                >
                    Voltar
                </button>
            </form>
        )}
      </div>
    </div>
  );
};
