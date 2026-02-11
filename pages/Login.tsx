
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../services/auth';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.login(email, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">G</div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Gesto Pro</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Faça login para acessar seu painel</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm animate-shake">
                <AlertCircle size={18} />
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-wider">E-mail</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="email" 
                        required 
                        autoFocus
                        placeholder="seu@email.com"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-primary rounded-xl p-3.5 pl-12 text-slate-700 dark:text-slate-200 focus:outline-none transition-all placeholder:text-slate-400" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-wider">Senha</label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="password" 
                        required 
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-primary rounded-xl p-3.5 pl-12 text-slate-700 dark:text-slate-200 focus:outline-none transition-all placeholder:text-slate-400" 
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
                {loading ? 'Entrando...' : (
                    <>
                        <LogIn size={20} />
                        Entrar no Sistema
                    </>
                )}
            </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-primary font-bold hover:underline">
                    Cadastre-se grátis
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};
