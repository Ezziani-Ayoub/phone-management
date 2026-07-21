import React, { useState, useEffect, useCallback } from 'react';
import { Plus, PhoneOff, Calendar, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../api/client';
import type { Assignment, PaginatedResponse } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import AssignmentForm from '../components/forms/AssignmentForm';
import { getProviderBadge } from '../components/ui/Badge';

const Assignments: React.FC = () => {
  const [result, setResult] = useState<PaginatedResponse<Assignment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeOnly, setActiveOnly] = useState(true);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [returnId, setReturnId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(search && { search }),
        ...(activeOnly && { active: 'true' }),
      });
      const res = await api.get(`/assignments?${params}`);
      setResult(res.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeOnly]);

  useEffect(() => { setPage(1); }, [search, activeOnly]);
  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleAssign = async (data: any) => {
    setFormLoading(true);
    try {
      await api.post('/assignments', data);
      toast.success('Numéro attribué avec succès');
      setShowAssignModal(false);
      fetchAssignments();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!returnId) return;
    setReturnLoading(true);
    try {
      await api.put(`/assignments/${returnId}/return`);
      toast.success('Numéro retourné avec succès');
      setReturnId(null);
      fetchAssignments();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Rechercher..."
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className={`w-10 h-6 rounded-full transition-colors relative ${activeOnly ? 'bg-blue-600' : 'bg-slate-300'}`}
              onClick={() => setActiveOnly(!activeOnly)}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${activeOnly ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
            <span className="text-sm text-slate-600 font-medium">Attributions actives seulement</span>
          </label>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
          <Plus size={16} />
          Nouvelle attribution
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <LoadingSpinner fullPage text="Chargement des attributions..." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Département</th>
                    <th>Numéro</th>
                    <th>Opérateur</th>
                    <th>Date d'attribution</th>
                    <th>Date de retour</th>
                    <th>Attribué par</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result?.data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Aucune attribution trouvée
                      </td>
                    </tr>
                  ) : (
                    result?.data.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                              {assignment.employee?.fullName.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-800">{assignment.employee?.fullName}</span>
                          </div>
                        </td>
                        <td className="text-slate-500">{assignment.employee?.department}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} className="text-slate-400" />
                            <span className="font-mono font-medium text-slate-700">{assignment.phoneNumber?.phoneNumber}</span>
                          </div>
                        </td>
                        <td>{getProviderBadge(assignment.phoneNumber?.provider || '')}</td>
                        <td>
                          <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                            <Calendar size={12} className="text-green-500" />
                            {format(new Date(assignment.assignedAt), 'dd MMM yyyy', { locale: fr })}
                          </div>
                        </td>
                        <td>
                          {assignment.returnedAt ? (
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                              <Calendar size={12} className="text-red-400" />
                              {format(new Date(assignment.returnedAt), 'dd MMM yyyy', { locale: fr })}
                            </div>
                          ) : (
                            <span className="badge badge-blue text-xs">En cours</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-slate-500 text-sm">
                            <User size={12} />
                            {assignment.assignedBy}
                          </div>
                        </td>
                        <td>
                          {!assignment.returnedAt && (
                            <button
                              className="btn btn-ghost p-2 text-amber-600 hover:bg-amber-50"
                              onClick={() => setReturnId(assignment.id)}
                              title="Retourner"
                            >
                              <PhoneOff size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {result?.pagination && (
              <div className="border-t border-slate-100 px-4">
                <Pagination pagination={result.pagination} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Nouvelle attribution" maxWidth="lg">
        <AssignmentForm onSubmit={handleAssign} onCancel={() => setShowAssignModal(false)} loading={formLoading} />
      </Modal>

      <ConfirmDialog
        isOpen={!!returnId}
        onConfirm={handleReturn}
        onCancel={() => setReturnId(null)}
        title="Retourner le numéro"
        message="Confirmer le retour de ce numéro ? Il sera marqué comme disponible."
        confirmLabel="Confirmer le retour"
        variant="warning"
        loading={returnLoading}
      />
    </div>
  );
};

export default Assignments;
