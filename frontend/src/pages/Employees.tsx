import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Phone, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../api/client';
import type { Employee, PaginatedResponse } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import EmployeeForm from '../components/forms/EmployeeForm';
import { getStatusBadge } from '../components/ui/Badge';

const Employees: React.FC = () => {
  const [result, setResult] = useState<PaginatedResponse<Employee> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await api.get(`/employees?${params}`);
      setResult(res.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleCreate = async (data: any) => {
    setFormLoading(true);
    try {
      await api.post('/employees', data);
      toast.success('Employé créé avec succès');
      setShowCreateModal(false);
      fetchEmployees();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editEmployee) return;
    setFormLoading(true);
    try {
      await api.put(`/employees/${editEmployee.id}`, data);
      toast.success('Employé mis à jour');
      setEditEmployee(null);
      fetchEmployees();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteEmployee) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/employees/${deleteEmployee.id}`);
      toast.success('Employé supprimé');
      setDeleteEmployee(null);
      fetchEmployees();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleteLoading(false);
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
            placeholder="Rechercher un employé..."
          />
          <select
            className="select w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} />
          Nouvel employé
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <LoadingSpinner fullPage text="Chargement des employés..." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom complet</th>
                    <th>Département</th>
                    <th>Poste</th>
                    <th>Site</th>
                    <th>Email</th>
                    <th>Statut</th>
                    <th>Numéro actuel</th>
                    <th>Coût Forfait</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result?.data.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        Aucun employé trouvé
                      </td>
                    </tr>
                  ) : (
                    result?.data.map((emp) => {
                      const activeAssignment = emp.assignments?.find((a) => !a.returnedAt);
                      const totalCost = emp.assignments
                        ?.filter((a) => !a.returnedAt && a.phoneNumber?.forfait)
                        .reduce((sum, a) => sum + (a.phoneNumber?.forfait?.price || 0), 0) || 0;
                      return (
                        <tr key={emp.id}>
                          <td className="text-slate-400 font-mono text-xs">#{emp.id}</td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {emp.fullName.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-800">{emp.fullName}</span>
                            </div>
                          </td>
                          <td className="text-slate-600">{emp.department}</td>
                          <td className="text-slate-600">{emp.position}</td>
                          <td className="text-slate-600 font-medium">{emp.site || '—'}</td>
                          <td className="text-slate-500 text-sm">{emp.email || '—'}</td>
                          <td>{getStatusBadge(emp.status)}</td>
                          <td>
                            {activeAssignment ? (
                              <div className="flex items-center gap-1.5 text-blue-600 text-sm font-mono font-medium">
                                <Phone size={13} />
                                {activeAssignment.phoneNumber?.phoneNumber}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">—</span>
                            )}
                          </td>
                          <td className="font-mono font-medium text-slate-800">
                            {totalCost > 0 ? `${totalCost.toFixed(2)} DH` : '—'}
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              <button
                                className="btn btn-ghost p-2"
                                onClick={() => setViewEmployee(emp)}
                                title="Voir les détails"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                className="btn btn-ghost p-2 text-blue-600 hover:bg-blue-50"
                                onClick={() => setEditEmployee(emp)}
                                title="Modifier"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                className="btn btn-ghost p-2 text-red-500 hover:bg-red-50"
                                onClick={() => setDeleteEmployee(emp)}
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
                <Pagination
                  pagination={result.pagination}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvel employé"
      >
        <EmployeeForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={formLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editEmployee}
        onClose={() => setEditEmployee(null)}
        title="Modifier l'employé"
      >
        {editEmployee && (
          <EmployeeForm
            initial={editEmployee}
            onSubmit={handleUpdate}
            onCancel={() => setEditEmployee(null)}
            loading={formLoading}
          />
        )}
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewEmployee}
        onClose={() => setViewEmployee(null)}
        title="Détails de l'employé"
        maxWidth="lg"
      >
        {viewEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-xl font-bold">
                {viewEmployee.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{viewEmployee.fullName}</h3>
                <p className="text-slate-500">{viewEmployee.position} — {viewEmployee.department}</p>
                <div className="mt-1">{getStatusBadge(viewEmployee.status)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <p className="text-sm font-medium text-slate-700">{viewEmployee.email || '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Site</p>
                <p className="text-sm font-medium text-slate-700">{viewEmployee.site || '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Créé le</p>
                <p className="text-sm font-medium text-slate-700">
                  {format(new Date(viewEmployee.createdAt), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Coût Mensuel Total</p>
                <p className="text-sm font-bold text-blue-600 font-mono">
                  {(viewEmployee.assignments
                    ?.filter((a) => !a.returnedAt && a.phoneNumber?.forfait)
                    .reduce((sum, a) => sum + (a.phoneNumber?.forfait?.price || 0), 0) || 0).toFixed(2)} DH
                </p>
              </div>
            </div>
            {viewEmployee.assignments && viewEmployee.assignments.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Historique des attributions</p>
                <div className="space-y-2">
                  {viewEmployee.assignments.map((a) => (
                    <div key={a.id} className={`text-sm p-3 rounded-lg border ${!a.returnedAt ? 'border-blue-200 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}>
                      <div className="flex justify-between items-start">
                        <span className="font-mono font-medium text-slate-700">
                          {a.phoneNumber?.phoneNumber}
                          {a.phoneNumber?.forfait && (
                            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded ml-2 font-sans font-normal">
                              {a.phoneNumber.forfait.name} ({a.phoneNumber.forfait.price} DH)
                            </span>
                          )}
                        </span>
                        {!a.returnedAt && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Actuel</span>}
                      </div>
                      <p className="text-slate-500 text-xs mt-1">
                        Du {format(new Date(a.assignedAt), 'dd/MM/yyyy')}
                        {a.returnedAt && ` au ${format(new Date(a.returnedAt), 'dd/MM/yyyy')}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteEmployee}
        onConfirm={handleDelete}
        onCancel={() => setDeleteEmployee(null)}
        title="Supprimer l'employé"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteEmployee?.fullName}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Employees;
