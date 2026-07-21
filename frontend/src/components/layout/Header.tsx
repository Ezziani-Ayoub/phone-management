import React from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Tableau de bord', subtitle: 'Vue d\'ensemble du système' },
  '/employes': { title: 'Gestion des Employés', subtitle: 'Créer, modifier et gérer les employés' },
  '/numeros': { title: 'Numéros de Téléphone', subtitle: 'Gérer le parc téléphonique' },
  '/attributions': { title: 'Attributions', subtitle: 'Attribuer et retourner des numéros' },
  '/historique': { title: 'Historique des Attributions', subtitle: 'Consulter l\'historique complet' },
};

const Header: React.FC = () => {
  const location = useLocation();
  const page = pageTitles[location.pathname] || pageTitles['/'];

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-bold text-slate-800">{page.title}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{page.subtitle}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-700">Admin</p>
            <p className="text-xs text-slate-500">IT Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
