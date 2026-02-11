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
import { PrintReport } from './pages/PrintReport';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { auth } from './services/auth';

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
    return auth.isAuthenticated() ? children : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          
          <Route path="/print/order/:id" element={<PrivateRoute><PrintOrder /></PrivateRoute>} />
          <Route path="/print/report/:month" element={<PrivateRoute><PrintReport /></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;