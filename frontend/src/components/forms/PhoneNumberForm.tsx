import React, { useState, useEffect } from 'react';
import type { PhoneNumber, PhoneNumberFormData } from '../../types';
import { PROVIDERS } from '../../types';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface PhoneNumberFormProps {
  initial?: PhoneNumber;
  onSubmit: (data: PhoneNumberFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const PhoneNumberForm: React.FC<PhoneNumberFormProps> = ({
  initial,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<PhoneNumberFormData>({
    phoneNumber: initial?.phoneNumber || '',
    provider: initial?.provider || '',
    status: initial?.status || 'Disponible',
    lineStatus: initial?.lineStatus || 'Actif',
    notes: initial?.notes || '',
    forfaitId: initial?.forfaitId || null,
  });

  const [forfaits, setForfaits] = useState<any[]>([]);
  const [loadingForfaits, setLoadingForfaits] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PhoneNumberFormData, string>>>({});

  useEffect(() => {
    const fetchForfaits = async () => {
      setLoadingForfaits(true);
      try {
        const res = await api.get('/forfaits/all');
        setForfaits(res.data);
      } catch (e: any) {
        toast.error('Erreur lors du chargement des forfaits');
      } finally {
        setLoadingForfaits(false);
      }
    };
    fetchForfaits();
  }, []);

  const validate = () => {
    const newErrors: Partial<Record<keyof PhoneNumberFormData, string>> = {};
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Le numéro de téléphone est obligatoire';
    if (!formData.provider.trim()) newErrors.provider = 'L\'opérateur est obligatoire';
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

  const update = (field: keyof PhoneNumberFormData, value: any) => {
    setFormData((prev) => {
      // Reset forfait if provider changes
      if (field === 'provider' && value !== prev.provider) {
        return { ...prev, provider: value, forfaitId: null };
      }
      return { ...prev, [field]: value };
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const statusColors = {
    'Disponible': 'border-green-500 bg-green-50',
    'Indisponible': 'border-red-400 bg-red-50',
  };

  const filteredForfaits = forfaits.filter((f) => f.operator === formData.provider);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Phone Number */}
      <div>
        <label className="label">Numéro de téléphone <span className="text-red-500">*</span></label>
        <input
          type="text"
          className={`input ${errors.phoneNumber ? 'border-red-400' : ''}`}
          value={formData.phoneNumber}
          onChange={(e) => update('phoneNumber', e.target.value)}
          placeholder="ex. +212 600 000 001"
          disabled={!!initial && initial.status === 'Attribué'}
        />
        {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
      </div>

      {/* Provider */}
      <div>
        <label className="label">Opérateur <span className="text-red-500">*</span></label>
        <select
          className={`select ${errors.provider ? 'border-red-400' : ''}`}
          value={formData.provider}
          onChange={(e) => update('provider', e.target.value)}
        >
          <option value="">Sélectionner un opérateur</option>
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {errors.provider && <p className="text-red-500 text-xs mt-1">{errors.provider}</p>}
      </div>

      {/* Forfait */}
      <div>
        <label className="label">Forfait</label>
        <select
          className="select"
          value={formData.forfaitId || ''}
          onChange={(e) => update('forfaitId', e.target.value ? parseInt(e.target.value) : null)}
          disabled={!formData.provider || loadingForfaits}
        >
          <option value="">Aucun forfait</option>
          {filteredForfaits.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.price.toFixed(2)} DH/mois)
            </option>
          ))}
        </select>
        {!formData.provider && (
          <p className="text-slate-400 text-xs mt-1">Sélectionnez d'abord un opérateur pour voir les forfaits disponibles.</p>
        )}
        {formData.provider && filteredForfaits.length === 0 && !loadingForfaits && (
          <p className="text-amber-600 text-xs mt-1">Aucun forfait disponible pour cet opérateur.</p>
        )}
      </div>

      {/* Statut de ligne */}
      <div>
        <label className="label">Statut de la ligne</label>
        <div className="flex gap-3">
          {(['Actif', 'Inactif'] as const).map((s) => (
            <label
              key={s}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.lineStatus === s
                  ? s === 'Actif'
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-400 bg-red-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="lineStatus"
                value={s}
                checked={formData.lineStatus === s}
                onChange={() => update('lineStatus', s)}
                className="hidden"
              />
              <span className={`w-2.5 h-2.5 rounded-full ${s === 'Actif' ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className="text-sm font-medium text-slate-700">{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability Status — only allow toggling if not Attribué */}
      {(!initial || initial.status !== 'Attribué') && (
        <div>
          <label className="label">Disponibilité</label>
          <div className="flex gap-3">
            {(['Disponible', 'Indisponible'] as const).map((s) => (
              <label
                key={s}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.status === s ? statusColors[s] : 'border-slate-200 hover:border-slate-300'
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
                <span className={`w-2.5 h-2.5 rounded-full ${s === 'Disponible' ? 'bg-green-500' : 'bg-red-400'}`} />
                <span className="text-sm font-medium text-slate-700">{s}</span>
              </label>
            ))}
          </div>
          {initial?.status === 'Attribué' && (
            <p className="text-amber-600 text-xs mt-1">⚠ Ce numéro est actuellement attribué. Retournez-le d'abord pour changer son statut.</p>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="label">Notes <span className="text-slate-400 font-normal">(optionnel)</span></label>
        <textarea
          className="input resize-none"
          rows={3}
          value={formData.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder="Informations supplémentaires..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 justify-end">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={loading}>
          Annuler
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'En cours...' : initial ? 'Mettre à jour' : 'Ajouter le numéro'}
        </button>
      </div>
    </form>
  );
};

export default PhoneNumberForm;
