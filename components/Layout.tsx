
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingCart, DollarSign, Settings as SettingsIcon, LogOut, User as UserIcon, Sun, Moon, Menu } from 'lucide-react';
import { auth } from '../services/auth';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
}

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-primary text-white shadow-md' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const MobileTabItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
    <Link to={to} className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${active ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        <span className="text-[10px] font-medium mt-1">{label}</span>
    </Link>
);

export const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('gesto_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gesto_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gesto_theme', 'light');
    }
  }, [darkMode]);

  // Adicionado location.pathname.startsWith('/track/') para remover o layout padrão na área do cliente
  if (location.pathname.startsWith('/print/') || location.pathname.startsWith('/track/') || location.pathname === '/login' || location.pathname === '/register') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar (Desktop Only) */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 hidden md:flex flex-col transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">G</div>
              Gesto Pro
            </h1>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
              title={darkMode ? "Mudar para Modo Claro" : "Mudar para Modo Noturno"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          
          {user && (
            <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <UserIcon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                </div>
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <NavItem to="/orders" icon={ShoppingCart} label="Pedidos" active={location.pathname.startsWith('/orders')} />
          <NavItem to="/clients" icon={Users} label="Clientes" active={location.pathname.startsWith('/clients')} />
          <NavItem to="/products" icon={Package} label="Produtos" active={location.pathname.startsWith('/products')} />
          <NavItem to="/expenses" icon={DollarSign} label="Despesas" active={location.pathname.startsWith('/expenses')} />
          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800">
            <NavItem to="/settings" icon={SettingsIcon} label="Configurações" active={location.pathname.startsWith('/settings')} />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800">
          <button onClick={() => auth.logout()} className="flex items-center space-x-3 px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 w-full rounded-lg transition-colors font-bold text-sm">
            <LogOut size={18} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header (Simplified) */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 flex justify-between items-center transition-colors shadow-sm z-10">
            <h1 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-xs">G</div>
                Gesto Pro
            </h1>
            <div className="flex gap-3 items-center">
               <button onClick={() => setDarkMode(!darkMode)} className="text-slate-600 dark:text-slate-400 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
               </button>
               <button onClick={() => auth.logout()} className="text-red-500 p-1"><LogOut size={20}/></button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex justify-around items-center px-2 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <MobileTabItem to="/" icon={LayoutDashboard} label="Início" active={location.pathname === '/'} />
            <MobileTabItem to="/orders" icon={ShoppingCart} label="Pedidos" active={location.pathname.startsWith('/orders')} />
            <div className="relative -top-5">
                 <Link to="/orders" className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg border-4 border-gray-50 dark:border-slate-950">
                    <span className="text-2xl font-bold mb-1">+</span>
                 </Link>
            </div>
            <MobileTabItem to="/expenses" icon={DollarSign} label="Despesas" active={location.pathname.startsWith('/expenses')} />
            <MobileTabItem to="/settings" icon={Menu} label="Menu" active={location.pathname.startsWith('/settings') || location.pathname.startsWith('/clients') || location.pathname.startsWith('/products')} />
        </div>
      </main>
    </div>
  );
};
