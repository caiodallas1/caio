
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingCart, DollarSign, Settings as SettingsIcon, LogOut, Key } from 'lucide-react';
import { auth } from '../services/auth';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
}

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const location = useLocation();
  const accessKey = auth.getAccessKey();

  if (location.pathname.startsWith('/print/') || location.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">G</div>
            Gestor Pro
          </h1>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Key size={10} /> Sua Chave
             </div>
             <div className="text-xs font-mono font-bold text-slate-700 break-all select-all cursor-pointer" title="Clique para selecionar">
                {accessKey}
             </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <NavItem to="/orders" icon={ShoppingCart} label="Pedidos" active={location.pathname.startsWith('/orders')} />
          <NavItem to="/clients" icon={Users} label="Clientes" active={location.pathname.startsWith('/clients')} />
          <NavItem to="/products" icon={Package} label="Produtos" active={location.pathname.startsWith('/products')} />
          <NavItem to="/expenses" icon={DollarSign} label="Despesas" active={location.pathname.startsWith('/expenses')} />
          <div className="pt-4 mt-4 border-t border-gray-100">
            <NavItem to="/settings" icon={SettingsIcon} label="Configurações" active={location.pathname.startsWith('/settings')} />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={() => auth.logout()} className="flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 w-full rounded-lg transition-colors font-bold text-sm">
            <LogOut size={18} />
            <span>Desconectar Chave</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h1 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-xs">G</div>
                Gestor Pro
            </h1>
            <nav className="flex gap-4 items-center">
               <Link to="/" className="text-slate-600"><LayoutDashboard size={20}/></Link>
               <Link to="/orders" className="text-slate-600"><ShoppingCart size={20}/></Link>
               <button onClick={() => auth.logout()} className="text-red-500"><LogOut size={20}/></button>
            </nav>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
