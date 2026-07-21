import React, { useState } from 'react';
import type { Forfait, ForfaitFormData } from '../../types';
import { PROVIDERS } from '../../types';

interface ForfaitFormProps {
  initial?: Forfait;
  onSubmit: (data: ForfaitFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ForfaitForm: React.FC<ForfaitFormProps> = ({
  initial,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ForfaitFormData>({
    name: initial?.name || '',
    price: initial?.price || 0,
    operator: initial?.operator || '',
    description: initial?.description || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ForfaitFormData, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof ForfaitFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom du forfait est obligatoire';
    if (!formData.operator.trim()) newErrors.operator = 'L\'opérateur est obligatoire';
    if (formData.price === undefined || formData.price < 0) {
      newErrors.price = 'Le prix mensuel doit être supérieur ou égal à 0';
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

  const update = (field: keyof ForfaitFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="label">Nom du forfait <span className="text-red-500">*</span></label>
        <input
          type="text"
          className={`input ${errors.name ? 'border-red-400' : ''}`}
          value={formData.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="ex. Forfait Business Class 99 DH"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Operator */}
      <div>
        <label className="label">Opérateur <span className="text-red-500">*</span></label>
        <select
          className={`select ${errors.operator ? 'border-red-400' : ''}`}
          value={formData.operator}
          onChange={(e) => update('operator', e.target.value)}
        >
          <option value="">Sélectionner un opérateur</option>
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {errors.operator && <p className="text-red-500 text-xs mt-1">{errors.operator}</p>}
      </div>

      {/* Price */}
      <div>
        <label className="label">Prix mensuel (DH) <span className="text-red-500">*</span></label>
        <input
          type="number"
          step="0.01"
          min="0"
          className={`input ${errors.price ? 'border-red-400' : ''}`}
          value={formData.price || ''}
          onChange={(e) => update('price', parseFloat(e.target.value) || 0)}
          placeholder="ex. 99"
        />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="label">Description <span className="text-slate-400 font-normal">(optionnel)</span></label>
        <textarea
          className="input resize-none"
          rows={3}
          value={formData.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="ex. 15 Go internet, 15 heures d'appels..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 justify-end">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={loading}>
          Annuler
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'En cours...' : initial ? 'Mettre à jour' : 'Ajouter le forfait'}
        </button>
      </div>
    </form>
  );
};

export default ForfaitForm;
