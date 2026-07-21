import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, History, PhoneCall, PhoneOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../api/client';
import type { PhoneNumber, PaginatedResponse } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import PhoneNumberForm from '../components/forms/PhoneNumberForm';
import AssignmentForm from '../components/forms/AssignmentForm';
import { getStatusBadge, getProviderBadge } from '../components/ui/Badge';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PhoneNumbers: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlStatus = searchParams.get('status') || '';

  const [result, setResult] = useState<PaginatedResponse<PhoneNumber> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [lineStatusFilter, setLineStatusFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [page, setPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editPhone, setEditPhone] = useState<PhoneNumber | null>(null);
  const [deletePhone, setDeletePhone] = useState<PhoneNumber | null>(null);
  const [assignPhone, setAssignPhone] = useState<PhoneNumber | null>(null);
  const [returnAssignmentId, setReturnAssignmentId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

  // Sync with URL parameter if it changes
  useEffect(() => {
    if (urlStatus) {
      setStatusFilter(urlStatus);
    }
  }, [urlStatus]);

  const fetchPhones = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(lineStatusFilter && { lineStatus: lineStatusFilter }),
        ...(providerFilter && { provider: providerFilter }),
      });
      const res = await api.get(`/phone-numbers?${params}`);
      setResult(res.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, lineStatusFilter, providerFilter]);

  useEffect(() => { setPage(1); }, [search, statusFilter, lineStatusFilter, providerFilter]);
  useEffect(() => { fetchPhones(); }, [fetchPhones]);

  const handleCreate = async (data: any) => {
    setFormLoading(true);
    try {
      await api.post('/phone-numbers', data);
      toast.success('Numéro ajouté avec succès');
      setShowCreateModal(false);
      fetchPhones();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editPhone) return;
    setFormLoading(true);
    try {
      await api.put(`/phone-numbers/${editPhone.id}`, data);
      toast.success('Numéro mis à jour');
      setEditPhone(null);
      fetchPhones();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePhone) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/phone-numbers/${deletePhone.id}`);
      toast.success('Numéro supprimé');
      setDeletePhone(null);
      fetchPhones();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAssign = async (data: any) => {
    setFormLoading(true);
    try {
      await api.post('/assignments', data);
      toast.success('Numéro attribué avec succès');
      setAssignPhone(null);
      fetchPhones();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!returnAssignmentId) return;
    setReturnLoading(true);
    try {
      await api.put(`/assignments/${returnAssignmentId}/return`);
      toast.success('Numéro retourné avec succès');
      setReturnAssignmentId(null);
      fetchPhones();
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
            placeholder="Rechercher un numéro..."
          />
          <select className="select w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tous les statuts d'attribution</option>
            <option value="Disponible">Disponible</option>
            <option value="Attribué">Attribué</option>
            <option value="Indisponible">Indisponible</option>
          </select>
          <select className="select w-48" value={lineStatusFilter} onChange={(e) => setLineStatusFilter(e.target.value)}>
            <option value="">Tous les états de ligne</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
          <select className="select w-48" value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
            <option value="">Tous les opérateurs</option>
            <option value="Maroc Telecom">Maroc Telecom</option>
            <option value="Orange Maroc">Orange Maroc</option>
            <option value="Inwi">Inwi</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          Ajouter un numéro
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <LoadingSpinner fullPage text="Chargement des numéros..." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Numéro</th>
                    <th>Opérateur</th>
                    <th>Statut Attribution</th>
                    <th>Statut Ligne</th>
                    <th>Forfait</th>
                    <th>Employé actuel</th>
                    <th>Notes</th>
                    <th>Ajouté le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result?.data.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        Aucun numéro trouvé
                      </td>
                    </tr>
                  ) : (
                    result?.data.map((phone) => {
                      const activeAssignment = phone.assignments?.find((a) => !a.returnedAt);
                      return (
                        <tr key={phone.id}>
                          <td>
                            <span className="font-mono font-semibold text-slate-800">
                              {phone.phoneNumber}
                            </span>
                          </td>
                          <td>{getProviderBadge(phone.provider)}</td>
                          <td>{getStatusBadge(phone.status)}</td>
                          <td>{getStatusBadge(phone.lineStatus)}</td>
                          <td>
                            {phone.forfait ? (
                              <div className="text-sm font-medium text-slate-800">
                                <span>{phone.forfait.name}</span>
                                <span className="block text-xs font-mono text-slate-500 font-normal">{phone.forfait.price.toFixed(2)} DH</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">—</span>
                            )}
                          </td>
                          <td>
                            {activeAssignment?.employee ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                                  {activeAssignment.employee.fullName.charAt(0)}
                                </div>
                                <span className="text-sm text-slate-700">{activeAssignment.employee.fullName}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">—</span>
                            )}
                          </td>
                          <td className="text-slate-500 text-sm max-w-xs truncate">
                            {phone.notes || '—'}
                          </td>
                          <td className="text-slate-500 text-sm">
                            {format(new Date(phone.createdAt), 'dd/MM/yyyy', { locale: fr })}
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              {phone.status === 'Disponible' && (
                                <button
                                  className="btn btn-ghost p-2 text-green-600 hover:bg-green-50"
                                  onClick={() => setAssignPhone(phone)}
                                  title="Attribuer"
                                >
                                  <PhoneCall size={15} />
                                </button>
                              )}
                              {phone.status === 'Attribué' && activeAssignment && (
                                <button
                                  className="btn btn-ghost p-2 text-amber-600 hover:bg-amber-50"
                                  onClick={() => setReturnAssignmentId(activeAssignment.id)}
                                  title="Retourner le numéro"
                                >
                                  <PhoneOff size={15} />
                                </button>
                              )}
                              <button
                                className="btn btn-ghost p-2 text-slate-500 hover:bg-slate-100"
                                onClick={() => navigate(`/historique?phoneId=${phone.id}`)}
                                title="Voir l'historique"
                              >
                                <History size={15} />
                              </button>
                              <button
                                className="btn btn-ghost p-2 text-blue-600 hover:bg-blue-50"
                                onClick={() => setEditPhone(phone)}
                                title="Modifier"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                className="btn btn-ghost p-2 text-red-500 hover:bg-red-50"
                                onClick={() => setDeletePhone(phone)}
                                title="Supprimer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Ajouter un numéro de téléphone">
        <PhoneNumberForm onSubmit={handleCreate} onCancel={() => setShowCreateModal(false)} loading={formLoading} />
      </Modal>

      <Modal isOpen={!!editPhone} onClose={() => setEditPhone(null)} title="Modifier le numéro">
        {editPhone && (
          <PhoneNumberForm initial={editPhone} onSubmit={handleUpdate} onCancel={() => setEditPhone(null)} loading={formLoading} />
        )}
      </Modal>

      <Modal isOpen={!!assignPhone} onClose={() => setAssignPhone(null)} title="Attribuer le numéro" maxWidth="lg">
        {assignPhone && (
          <AssignmentForm
            preselectedPhoneId={assignPhone.id}
            onSubmit={handleAssign}
            onCancel={() => setAssignPhone(null)}
            loading={formLoading}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletePhone}
        onConfirm={handleDelete}
        onCancel={() => setDeletePhone(null)}
        title="Supprimer le numéro"
        message={`Êtes-vous sûr de vouloir supprimer le numéro "${deletePhone?.phoneNumber}" ?`}
        confirmLabel="Supprimer"
        loading={deleteLoading}
      />

      <ConfirmDialog
        isOpen={!!returnAssignmentId}
        onConfirm={handleReturn}
        onCancel={() => setReturnAssignmentId(null)}
        title="Retourner le numéro"
        message="Êtes-vous sûr de vouloir marquer ce numéro comme retourné ? Il redeviendra disponible."
        confirmLabel="Confirmer le retour"
        variant="warning"
        loading={returnLoading}
      />
    </div>
  );
};

export default PhoneNumbers;
