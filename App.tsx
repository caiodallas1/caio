import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Expenses } from './pages/Expenses';
import { SettingsPage } from './pages/Settings';
import { PrintOrder } from './pages/PrintOrder';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/print/order/:id" element={<PrintOrder />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
