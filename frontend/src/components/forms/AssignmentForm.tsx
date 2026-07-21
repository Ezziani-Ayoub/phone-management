import React, { useState, useEffect } from 'react';
import type { Employee, PhoneNumber, AssignmentFormData } from '../../types';
import api from '../../api/client';

interface AssignmentFormProps {
  onSubmit: (data: AssignmentFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  preselectedPhoneId?: number;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  preselectedPhoneId,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [formData, setFormData] = useState<AssignmentFormData>({
    employeeId: 0,
    phoneNumberId: preselectedPhoneId || 0,
    assignedBy: 'Admin IT',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AssignmentFormData, string>>>({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, phoneRes] = await Promise.all([
          api.get('/employees?limit=100&status=Actif'),
          api.get('/phone-numbers?limit=100&status=Disponible'),
        ]);
        setEmployees(empRes.data.data);
        setPhoneNumbers(phoneRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const validate = () => {
    const errs: Partial<Record<keyof AssignmentFormData, string>> = {};
    if (!formData.employeeId) errs.employeeId = 'Veuillez sélectionner un employé';
    if (!formData.phoneNumberId) errs.phoneNumberId = 'Veuillez sélectionner un numéro';
    if (!formData.assignedBy.trim()) errs.assignedBy = 'Ce champ est obligatoire';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    await onSubmit(formData);
  };

  const update = (field: keyof AssignmentFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (loadingData) {
    return <div className="py-8 text-center text-slate-500">Chargement des données...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Employee */}
      <div>
        <label className="label">Employé <span className="text-red-500">*</span></label>
        <select
          className={`select ${errors.employeeId ? 'border-red-400' : ''}`}
          value={formData.employeeId || ''}
          onChange={(e) => update('employeeId', parseInt(e.target.value))}
        >
          <option value="">Sélectionner un employé</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.fullName} — {emp.department}
            </option>
          ))}
        </select>
        {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>}
        {employees.length === 0 && (
          <p className="text-amber-600 text-xs mt-1">Aucun employé actif disponible</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="label">Numéro de téléphone <span className="text-red-500">*</span></label>
        <select
          className={`select ${errors.phoneNumberId ? 'border-red-400' : ''}`}
          value={formData.phoneNumberId || ''}
          onChange={(e) => update('phoneNumberId', parseInt(e.target.value))}
          disabled={!!preselectedPhoneId}
        >
          <option value="">Sélectionner un numéro disponible</option>
          {phoneNumbers.map((phone) => (
            <option key={phone.id} value={phone.id}>
              {phone.phoneNumber} — {phone.provider}
            </option>
          ))}
        </select>
        {errors.phoneNumberId && <p className="text-red-500 text-xs mt-1">{errors.phoneNumberId}</p>}
        {phoneNumbers.length === 0 && (
          <p className="text-amber-600 text-xs mt-1">Aucun numéro disponible</p>
        )}
      </div>

      {/* Assigned By */}
      <div>
        <label className="label">Attribué par <span className="text-red-500">*</span></label>
        <input
          type="text"
          className={`input ${errors.assignedBy ? 'border-red-400' : ''}`}
          value={formData.assignedBy}
          onChange={(e) => update('assignedBy', e.target.value)}
          placeholder="Nom de l'administrateur"
        />
        {errors.assignedBy && <p className="text-red-500 text-xs mt-1">{errors.assignedBy}</p>}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-blue-700 text-xs">
          ℹ️ Si le numéro sélectionné est déjà attribué à un autre employé, l'attribution précédente sera automatiquement clôturée.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 justify-end">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={loading}>
          Annuler
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading || employees.length === 0 || phoneNumbers.length === 0}>
          {loading ? 'Attribution...' : 'Attribuer le numéro'}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;
