import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Phone,
  Link,
  History,
  Building2,
  ChevronRight,
  Receipt,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/employes', label: 'Employés', icon: Users },
  { to: '/numeros', label: 'Numéros de téléphone', icon: Phone },
  { to: '/forfaits', label: 'Forfaits', icon: Receipt },
  { to: '/attributions', label: 'Attributions', icon: Link },
  { to: '/historique', label: 'Historique', icon: History },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="sidebar flex flex-col">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">SOS Villages d'Enfants Maroc</p>
          </div>
        </div>
        <div className="mt-3 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
          <p className="text-slate-400 text-xs leading-snug">Système de gestion des numéros de téléphone</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Menu principal</p>
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);

            return (
              <li key={to}>
                <NavLink
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} size={18} />
                  <span className="text-sm font-medium flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-300" size={14} />}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            IT
          </div>
          <div>
            <p className="text-white text-xs font-medium">Département IT</p>
            <p className="text-slate-500 text-xs">Administrateur</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
