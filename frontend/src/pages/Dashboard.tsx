import React, { useEffect, useState } from 'react';
import {
  Users,
  Phone,
  CheckCircle,
  XCircle,
  PhoneOff,
  TrendingUp,
  ArrowRight,
  Calendar,
  User,
} from 'lucide-react';
import api from '../api/client';
import type { DashboardData } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getStatusBadge, getProviderBadge } from '../components/ui/Badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  subtitle?: string;
  to?: string;
}> = ({ label, value, icon, colorClass, subtitle, to }) => {
  const CardContent = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-white/70 text-sm font-medium mb-1">{label}</p>
        <p className="text-4xl font-bold">{value}</p>
        {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
        {icon}
      </div>
    </div>
  );

  const classes = `${colorClass} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {CardContent}
      </Link>
    );
  }

  return (
    <div className={classes}>
      {CardContent}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Chargement du tableau de bord..." />;
  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-500 font-medium">{error}</p>
    </div>
  );
  if (!data) return null;

  const { stats, recentAssignments } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label="Total Employés"
          value={stats.totalEmployees}
          icon={<Users size={22} className="text-white" />}
          colorClass="stat-card-blue"
          subtitle={`${stats.activeEmployees} actifs`}
          to="/employes"
        />
        <StatCard
          label="Numéros Attribués"
          value={stats.assignedNumbers}
          icon={<CheckCircle size={22} className="text-white" />}
          colorClass="stat-card-green"
          to="/numeros?status=Attribué"
        />
        <StatCard
          label="Numéros Disponibles"
          value={stats.availableNumbers}
          icon={<Phone size={22} className="text-white" />}
          colorClass="stat-card-amber"
          to="/numeros?status=Disponible"
        />
        <StatCard
          label="Indisponibles"
          value={stats.unavailableNumbers}
          icon={<PhoneOff size={22} className="text-white" />}
          colorClass="stat-card-red"
          to="/numeros?status=Indisponible"
        />
        <StatCard
          label="Total Numéros"
          value={stats.totalPhoneNumbers}
          icon={<Phone size={22} className="text-white" />}
          colorClass="stat-card-purple"
          to="/numeros"
        />
      </div>

      {/* Recent Assignments */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Attributions Actuelles</h3>
            <p className="text-slate-500 text-xs mt-0.5">Numéros actuellement attribués</p>
          </div>
          <Link to="/attributions" className="btn btn-secondary text-sm gap-1.5">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>

        {recentAssignments.length === 0 ? (
          <div className="py-12 text-center">
            <Phone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucune attribution active</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Numéro</th>
                  <th>Opérateur</th>
                  <th>Date d'attribution</th>
                  <th>Attribué par</th>
                </tr>
              </thead>
              <tbody>
                {recentAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {assignment.employee?.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{assignment.employee?.fullName}</p>
                          <p className="text-xs text-slate-500">{assignment.employee?.department}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono font-medium text-slate-700">
                        {assignment.phoneNumber?.phoneNumber}
                      </span>
                    </td>
                    <td>{getProviderBadge(assignment.phoneNumber?.provider || '')}</td>
                    <td>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar size={13} className="text-slate-400" />
                        {format(new Date(assignment.assignedAt), 'dd MMM yyyy', { locale: fr })}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <User size={13} />
                        {assignment.assignedBy}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/employes"
          className="glass-card rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-0.5 group"
        >
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
            <Users size={20} className="text-blue-600 group-hover:text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Gérer les employés</p>
            <p className="text-xs text-slate-500">Ajouter, modifier, supprimer</p>
          </div>
          <ArrowRight size={16} className="text-slate-300 ml-auto group-hover:text-blue-500 transition-colors" />
        </Link>
        <Link
          to="/numeros"
          className="glass-card rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-0.5 group"
        >
          <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
            <Phone size={20} className="text-green-600 group-hover:text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Numéros de téléphone</p>
            <p className="text-xs text-slate-500">Gérer le parc téléphonique</p>
          </div>
          <ArrowRight size={16} className="text-slate-300 ml-auto group-hover:text-green-500 transition-colors" />
        </Link>
        <Link
          to="/attributions"
          className="glass-card rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-0.5 group"
        >
          <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-500 transition-colors">
            <CheckCircle size={20} className="text-amber-600 group-hover:text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Nouvelles attributions</p>
            <p className="text-xs text-slate-500">Attribuer un numéro</p>
          </div>
          <ArrowRight size={16} className="text-slate-300 ml-auto group-hover:text-amber-500 transition-colors" />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
