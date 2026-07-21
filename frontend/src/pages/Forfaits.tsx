import React, { useState, useEffect, useCallback } from 'react';
import { Phone, Wifi, TrendingUp, PackageCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import type { PhoneNumber, PaginatedResponse } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import { getProviderBadge } from '../components/ui/Badge';

const Forfaits: React.FC = () => {
  const [result, setResult] = useState<PaginatedResponse<PhoneNumber> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '50',
        ...(search && { search }),
        ...(operatorFilter && { provider: operatorFilter }),
      });
      const res = await api.get(`/phone-numbers?${params}`);
      setResult(res.data);
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [page, search, operatorFilter]);

  useEffect(() => { setPage(1); }, [search, operatorFilter]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const phonesWithForfait = result?.data.filter(p => p.forfait) ?? [];
  const phonesWithoutForfait = result?.data.filter(p => !p.forfait) ?? [];
  const grandTotal = phonesWithForfait.reduce((sum, p) => sum + (p.forfait?.price ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
            <Phone size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Lignes avec forfait</p>
            <p className="text-2xl font-bold text-slate-800">{phonesWithForfait.length}</p>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
            <Wifi size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Lignes sans forfait</p>
            <p className="text-2xl font-bold text-slate-800">{phonesWithoutForfait.length}</p>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
            <TrendingUp size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Coût total mensuel</p>
            <p className="text-2xl font-bold text-emerald-700">{grandTotal.toFixed(2)} DH</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un numéro..."
        />
        <select
          className="select w-48"
          value={operatorFilter}
          onChange={(e) => setOperatorFilter(e.target.value)}
        >
          <option value="">Tous les opérateurs</option>
          <option value="Maroc Telecom">Maroc Telecom</option>
          <option value="Orange Maroc">Orange Maroc</option>
          <option value="Inwi">Inwi</option>
        </select>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <PackageCheck size={17} className="text-blue-600" />
          <h2 className="font-semibold text-slate-700 text-sm">Lignes téléphoniques et Forfaits associés</h2>
        </div>
        {loading ? (
          <LoadingSpinner fullPage text="Chargement..." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Collaborateur</th>
                    <th>Numéro de téléphone</th>
                    <th>Forfait</th>
                    <th>Ce que comprend le forfait</th>
                    <th>Prix / mois</th>
                    <th>Total cumulé</th>
                  </tr>
                </thead>
                <tbody>
                  {result?.data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Aucune ligne trouvée
                      </td>
                    </tr>
                  ) : (() => {
                    let running = 0;
                    return result?.data.map((phone) => {
                      const currentEmployee = phone.assignments?.find((a: any) => !a.returnedAt)?.employee;
                      if (phone.forfait) running += phone.forfait.price;
                      const snap = running;
                      return (
                        <tr key={phone.id}>
                          <td>
                            {currentEmployee ? (
                              <div>
                                <div className="font-semibold text-slate-800 text-sm">{currentEmployee.fullName}</div>
                                <div className="text-xs text-slate-400">{currentEmployee.department}</div>
                                {currentEmployee.site && (
                                  <div className="text-xs text-slate-400">Site: {currentEmployee.site}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-sm">Non attribué</span>
                            )}
                          </td>
                          <td>
                            <div className="flex flex-col gap-1">
                              <span className="font-mono font-semibold text-slate-800 text-sm">{phone.phoneNumber}</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {getProviderBadge(phone.provider)}
                                <span className={`badge text-xs ${phone.lineStatus === 'Actif' ? 'badge-green' : 'badge-red'}`}>
                                  Ligne {phone.lineStatus}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            {phone.forfait ? (
                              <span className="font-semibold text-slate-800 text-sm">{phone.forfait.name}</span>
                            ) : (
                              <span className="text-slate-400 italic text-sm">Aucun forfait</span>
                            )}
                          </td>
                          <td className="text-slate-500 text-sm max-w-xs">
                            {phone.forfait?.description || <span className="text-slate-300 italic">—</span>}
                          </td>
                          <td>
                            {phone.forfait ? (
                              <span className="font-mono font-bold text-blue-700 text-sm">
                                {phone.forfait.price.toFixed(2)} DH
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td>
                            <span className={`font-mono font-bold text-sm ${phone.forfait ? 'text-emerald-700' : 'text-slate-300'}`}>
                              {phone.forfait ? `${snap.toFixed(2)} DH` : '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
                {phonesWithForfait.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50 border-t-2 border-slate-200">
                      <td colSpan={4} className="px-4 py-3 text-right font-semibold text-slate-600 text-sm">
                        Total mensuel ({phonesWithForfait.length} ligne(s) avec forfait)
                      </td>
                      <td colSpan={2} className="px-4 py-3 font-mono font-bold text-lg text-emerald-700">
                        {grandTotal.toFixed(2)} DH
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            {result?.pagination && result.pagination.totalPages > 1 && (
              <div className="border-t border-slate-100 px-4">
                <Pagination pagination={result.pagination} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Forfaits;
