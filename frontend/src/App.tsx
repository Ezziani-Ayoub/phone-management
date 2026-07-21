import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import PhoneNumbers from './pages/PhoneNumbers';
import Assignments from './pages/Assignments';
import History from './pages/History';
import Forfaits from './pages/Forfaits';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employes" element={<Employees />} />
          <Route path="/numeros" element={<PhoneNumbers />} />
          <Route path="/attributions" element={<Assignments />} />
          <Route path="/historique" element={<History />} />
          <Route path="/forfaits" element={<Forfaits />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
