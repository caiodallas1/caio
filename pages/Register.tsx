
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../services/auth';
import { UserPlus, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.register(name, email, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">G</div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Crie sua Conta</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Comece a gerenciar seu negócio hoje</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                <AlertCircle size={18} />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Nome da Empresa / Seu Nome</label>
                <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        required 
                        placeholder="Ex: Minha Loja"
                        className="w-full border-2 border-slate-100 focus:border-primary rounded-xl p-3.5 pl-12 text-slate-700 focus:outline-none transition-all" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">E-mail</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="email" 
                        required 
                        placeholder="seu@email.com"
                        className="w-full border-2 border-slate-100 focus:border-primary rounded-xl p-3.5 pl-12 text-slate-700 focus:outline-none transition-all" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Senha</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="password" 
                        required 
                        placeholder="••••••••"
                        className="w-full border-2 border-slate-100 focus:border-primary rounded-xl p-3.5 pl-12 text-slate-700 focus:outline-none transition-all" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-bold hover:bg-amber-600 shadow-lg transition-all transform hover:scale-[1.01] disabled:opacity-50"
            >
                {loading ? 'Criando Conta...' : (
                    <>
                        <UserPlus size={20} />
                        Criar Conta Grátis
                    </>
                )}
            </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline">
                    Fazer Login
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};
