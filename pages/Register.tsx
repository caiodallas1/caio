import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/auth';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res: any = await auth.register(name, email, password);
      
      if (res && res.confirmationRequired) {
        setSuccess('Conta criada com sucesso! Verifique seu e-mail para confirmar seu cadastro antes de fazer login.');
        setName('');
        setEmail('');
        setPassword('');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-primary">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Crie sua Conta</h1>
        <p className="text-center text-slate-500 mb-6">Gestão simples e eficiente</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-800 p-4 rounded mb-4 text-sm font-medium border border-green-200">{success}</div>}
        
        {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Nome da Empresa / Seu Nome</label>
                <input 
                type="text" 
                required 
                className="w-full border rounded-lg p-3" 
                value={name}
                onChange={e => setName(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <input 
                type="email" 
                required 
                className="w-full border rounded-lg p-3" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <input 
                type="password" 
                required 
                className="w-full border rounded-lg p-3" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                />
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-yellow-700 shadow-md disabled:opacity-50"
            >
                {loading ? 'Registrando...' : 'Registrar'}
            </button>
            </form>
        )}

        <div className="mt-6 text-center text-sm text-slate-600">
          Já tem conta? <Link to="/login" className="text-primary font-bold hover:underline">Fazer login</Link>
        </div>
      </div>
    </div>
  );
};