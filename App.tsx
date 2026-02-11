
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Expenses } from './pages/Expenses';
import { SettingsPage } from './pages/Settings';
import { PrintOrder } from './pages/PrintOrder';
import { PrintReport } from './pages/PrintReport';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { auth } from './services/auth';
import { User } from './types';

const PrivateRoute = ({ children, hasAccess }: { children?: React.ReactNode, hasAccess: boolean }) => {
    if (!hasAccess) return <Navigate to="/login" />;
    return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
        const u = await auth.getCurrentUser();
        setUser(u);
        setLoading(false);
    };
    checkAccess();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <HashRouter>
      <Layout user={user}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          
          <Route path="/" element={<PrivateRoute hasAccess={!!user}><Dashboard /></PrivateRoute>} />
          <Route path="/clients" element={<PrivateRoute hasAccess={!!user}><Clients /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute hasAccess={!!user}><Products /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute hasAccess={!!user}><Orders /></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute hasAccess={!!user}><Expenses /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute hasAccess={!!user}><SettingsPage /></PrivateRoute>} />
          
          <Route path="/print/order/:id" element={<PrivateRoute hasAccess={!!user}><PrintOrder /></PrivateRoute>} />
          <Route path="/print/report/:month" element={<PrivateRoute hasAccess={!!user}><PrintReport /></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
