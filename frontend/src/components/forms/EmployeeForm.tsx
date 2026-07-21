import React, { useState, useEffect } from 'react';
import type { Employee, EmployeeFormData } from '../../types';
import { DEPARTMENTS } from '../../types';

interface EmployeeFormProps {
  initial?: Employee;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initial,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    fullName: initial?.fullName || '',
    department: initial?.department || '',
    position: initial?.position || '',
    email: initial?.email || '',
    site: initial?.site || '',
    status: initial?.status || 'Actif',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Le nom complet est obligatoire';
    if (!formData.department.trim()) newErrors.department = 'Le département est obligatoire';
    if (!formData.position.trim()) newErrors.position = 'Le poste est obligatoire';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    return newErrors;
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

  const update = (field: keyof EmployeeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="label">Nom complet <span className="text-red-500">*</span></label>
        <input
          type="text"
          className={`input ${errors.fullName ? 'border-red-400' : ''}`}
          value={formData.fullName}
          onChange={(e) => update('fullName', e.target.value)}
          placeholder="ex. Ahmed Benali"
        />
        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
      </div>

      {/* Department */}
      <div>
        <label className="label">Département <span className="text-red-500">*</span></label>
        <select
          className={`select ${errors.department ? 'border-red-400' : ''}`}
          value={formData.department}
          onChange={(e) => update('department', e.target.value)}
        >
          <option value="">Sélectionner un département</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
      </div>

      {/* Position */}
      <div>
        <label className="label">Poste <span className="text-red-500">*</span></label>
        <input
          type="text"
          className={`input ${errors.position ? 'border-red-400' : ''}`}
          value={formData.position}
          onChange={(e) => update('position', e.target.value)}
          placeholder="ex. Responsable IT"
        />
        {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
      </div>

      {/* Site */}
      <div>
        <label className="label">Site <span className="text-slate-400 font-normal">(optionnel)</span></label>
        <input
          type="text"
          className="input"
          value={formData.site}
          onChange={(e) => update('site', e.target.value)}
          placeholder="ex. Casablanca"
        />
      </div>

      {/* Email */}
      <div>
        <label className="label">Email <span className="text-slate-400 font-normal">(optionnel)</span></label>
        <input
          type="email"
          className={`input ${errors.email ? 'border-red-400' : ''}`}
          value={formData.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="ex. ahmed@sos-villages.ma"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Status */}
      <div>
        <label className="label">Statut</label>
        <div className="flex gap-3">
          {(['Actif', 'Inactif'] as const).map((s) => (
            <label
              key={s}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.status === s
                  ? s === 'Actif'
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-400 bg-red-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={s}
                checked={formData.status === s}
                onChange={() => update('status', s)}
                className="hidden"
              />
              <span
                className={`w-2.5 h-2.5 rounded-full ${s === 'Actif' ? 'bg-green-500' : 'bg-red-400'}`}
              />
              <span className="text-sm font-medium text-slate-700">{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 justify-end">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={loading}>
          Annuler
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'En cours...' : initial ? 'Mettre à jour' : 'Créer l\'employé'}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
