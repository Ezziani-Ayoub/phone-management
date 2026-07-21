import React, { useState, useEffect, useCallback } from 'react';
import { Phone, Search, ChevronDown, ChevronUp, Calendar, User, ArrowRight, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../api/client';
import type { PhoneNumber, Assignment, PaginatedResponse } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getStatusBadge, getProviderBadge } from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import Pagination from '../components/ui/Pagination';

interface PhoneHistory {
  phoneNumber: PhoneNumber;
  history: Assignment[];
}

const HistoryTimeline: React.FC<{ history: Assignment[] }> = ({ history }) => {
  if (history.length === 0) {
    return <p className="text-slate-400 text-sm py-4 text-center">Aucun historique disponible</p>;
  }

  return (
    <div className="space-y-0 mt-4">
      {history.map((assignment, index) => {
        const isCurrent = !assignment.returnedAt;
        return (
          <div key={assignment.id} className="timeline-item">
            <div
              className={`timeline-dot ${isCurrent ? 'text-blue-500' : 'text-slate-400'}`}
              style={{ backgroundColor: isCurrent ? '#3b82f6' : '#94a3b8' }}
            />
            <div className={`rounded-xl border p-4 transition-all ${
              isCurrent
                ? 'border-blue-200 bg-blue-50 shadow-sm'
                : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    isCurrent ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-slate-400 to-slate-600'
                  }`}>
                    {assignment.employee?.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{assignment.employee?.fullName}</p>
                    <p className="text-xs text-slate-500">{assignment.employee?.department} — {assignment.employee?.position}</p>
                  </div>
                </div>
                {isCurrent && (
                  <span className="badge badge-blue text-xs">Utilisateur actuel</span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-green-600">
                  <Calendar size={13} />
                  <span className="font-medium">Attribué:</span>
                  <span className="text-slate-600">{format(new Date(assignment.assignedAt), 'dd MMMM yyyy', { locale: fr })}</span>
                </div>
                {assignment.returnedAt ? (
                  <div className="flex items-center gap-1.5 text-red-500">
                    <Calendar size={13} />
                    <span className="font-medium">Retourné:</span>
                    <span className="text-slate-600">{format(new Date(assignment.returnedAt), 'dd MMMM yyyy', { locale: fr })}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-blue-500">
                    <ArrowRight size={13} />
                    <span className="font-medium italic">En cours d'utilisation</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-slate-400">
                  <User size={13} />
                  <span>par {assignment.assignedBy}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const History: React.FC = () => {
  const handlePrint = (phoneHistory: PhoneHistory) => {
    const { phoneNumber, history } = phoneHistory;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression. Veuillez autoriser les popups.');
      return;
    }

    const formattedDate = format(new Date(), 'dd/MM/yyyy à HH:mm');

    const historyRows = history.map((a, index) => {
      const start = format(new Date(a.assignedAt), 'dd/MM/yyyy');
      const end = a.returnedAt ? format(new Date(a.returnedAt), 'dd/MM/yyyy') : 'Actuellement attribué';
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${index + 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
            <div style="font-weight: bold; color: #1e293b;">${a.employee?.fullName}</div>
            <div style="font-size: 11px; color: #64748b;">${a.employee?.department} — ${a.employee?.position}</div>
            ${a.employee?.site ? `<div style="font-size: 11px; color: #64748b;">Site: ${a.employee.site}</div>` : ''}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #0f766e; font-weight: 500;">${start}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: ${a.returnedAt ? '#b91c1c' : '#2563eb'}; font-weight: 500;">${end}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${a.assignedBy}</td>
        </tr>
      `;
    }).join('');

    const forfaitHtml = phoneNumber.forfait 
      ? `<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-top: 10px;">
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Forfait Actif</div>
          <div style="font-size: 15px; font-weight: bold; color: #1e293b; margin-top: 2px;">${phoneNumber.forfait.name}</div>
          <div style="font-size: 13px; font-weight: bold; color: #2563eb; margin-top: 2px;">${phoneNumber.forfait.price.toFixed(2)} DH / mois</div>
          ${phoneNumber.forfait.description ? `<div style="font-size: 12px; color: #475569; margin-top: 4px;">${phoneNumber.forfait.description}</div>` : ''}
         </div>`
      : '<div style="color: #64748b; font-style: italic; font-size: 13px; margin-top: 10px;">Aucun forfait associé</div>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Historique - ${phoneNumber.phoneNumber}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 40px; color: #334155; }
          .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo-area { display: flex; align-items: center; gap: 12px; }
          .logo-box { background: linear-gradient(135deg, #3b82f6, #1d4ed8); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
          .title { font-size: 22px; font-weight: 800; color: #1e293b; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin: 4px 0 0 0; }
          .date-stamp { font-size: 12px; color: #94a3b8; text-align: right; }
          .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .meta-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background-color: #ffffff; }
          .meta-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; }
          .meta-val { font-size: 16px; font-weight: 700; color: #1e293b; margin-top: 4px; }
          .table-container { margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; text-align: left; }
          th { background-color: #f8fafc; color: #475569; font-weight: 600; font-size: 12px; text-transform: uppercase; padding: 12px 10px; border-bottom: 2px solid #e2e8f0; }
          .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
          .signature-box { margin-top: 40px; display: flex; justify-content: flex-end; }
          .signature { border-top: 1px dashed #cbd5e1; width: 200px; text-align: center; padding-top: 8px; font-size: 12px; color: #64748b; font-weight: 500; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-area">
            <div class="logo-box">SOS</div>
            <div>
              <h1 class="title">SOS Villages d'Enfants Maroc</h1>
              <p class="subtitle">Rapport d'Historique de Ligne Téléphonique</p>
            </div>
          </div>
          <div class="date-stamp">
            <div>Généré le ${formattedDate}</div>
            <div style="font-weight: 500; color: #64748b; margin-top: 4px;">Document Confidentiel</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-card">
            <div class="meta-label">Détails de la Ligne</div>
            <div class="meta-val" style="font-family: monospace; font-size: 18px; color: #2563eb;">${phoneNumber.phoneNumber}</div>
            <div style="margin-top: 8px; display: flex; gap: 8px; font-size: 12px;">
              <span style="background-color: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-weight: 500; color: #475569;">${phoneNumber.provider}</span>
              <span style="background-color: ${phoneNumber.status === 'Disponible' ? '#d1fae5' : phoneNumber.status === 'Attribué' ? '#dbeafe' : '#fee2e2'}; padding: 3px 8px; border-radius: 4px; font-weight: 500; color: ${phoneNumber.status === 'Disponible' ? '#065f46' : phoneNumber.status === 'Attribué' ? '#1e40af' : '#991b1b'};">${phoneNumber.status}</span>
              <span style="background-color: ${phoneNumber.lineStatus === 'Actif' ? '#d1fae5' : '#fee2e2'}; padding: 3px 8px; border-radius: 4px; font-weight: 500; color: ${phoneNumber.lineStatus === 'Actif' ? '#065f46' : '#991b1b'};">Ligne ${phoneNumber.lineStatus}</span>
            </div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Forfait Téléphonique</div>
            ${forfaitHtml}
          </div>
        </div>

        <div class="table-container">
          <h2 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">Historique des Attributions</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">N°</th>
                <th>Collaborateur</th>
                <th>Date Attribution</th>
                <th>Date Retour</th>
                <th>Attribué par</th>
              </tr>
            </thead>
            <tbody>
              ${historyRows}
            </tbody>
          </table>
        </div>

        <div class="signature-box">
          <div>
            <div style="height: 60px;"></div>
            <div class="signature">Visa de l'Administrateur IT</div>
          </div>
        </div>

        <div class="footer">
          <div>SOS Villages d'Enfants Maroc &copy; 2026 - Tous droits réservés</div>
          <div>Système de gestion du parc télécom</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const [result, setResult] = useState<PaginatedResponse<PhoneNumber> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Record<number, PhoneHistory | null>>({});
  const [loadingHistory, setLoadingHistory] = useState<Record<number, boolean>>({});

  // Get preselected phoneId from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const phoneId = params.get('phoneId');
    if (phoneId) {
      toggleHistory(parseInt(phoneId));
    }
  }, []);

  const fetchPhones = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '8',
        ...(search && { search }),
      });
      const res = await api.get(`/phone-numbers?${params}`);
      setResult(res.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { fetchPhones(); }, [fetchPhones]);

  const toggleHistory = async (phoneId: number) => {
    if (expanded[phoneId] !== undefined) {
      // Collapse
      setExpanded((prev) => {
        const next = { ...prev };
        delete next[phoneId];
        return next;
      });
      return;
    }

    setLoadingHistory((prev) => ({ ...prev, [phoneId]: true }));
    try {
      const res = await api.get(`/phone-numbers/${phoneId}/history`);
      setExpanded((prev) => ({ ...prev, [phoneId]: res.data }));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingHistory((prev) => ({ ...prev, [phoneId]: false }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search */}
      <div className="flex items-center gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un numéro ou opérateur..."
        />
      </div>

      {/* Phone list with expandable history */}
      {loading ? (
        <LoadingSpinner fullPage text="Chargement..." />
      ) : (
        <div className="space-y-3">
          {result?.data.length === 0 ? (
            <div className="glass-card rounded-2xl py-12 text-center text-slate-400">
              Aucun numéro trouvé
            </div>
          ) : (
            result?.data.map((phone) => (
              <div key={phone.id} className="glass-card rounded-2xl overflow-hidden">
                {/* Phone header */}
                <div
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleHistory(phone.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                      <Phone size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-slate-800">{phone.phoneNumber}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {getProviderBadge(phone.provider)}
                        {getStatusBadge(phone.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {loadingHistory[phone.id] ? (
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    ) : expanded[phone.id] !== undefined ? (
                      <ChevronUp size={18} className="text-slate-500" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Voir l'historique</span>
                        <ChevronDown size={18} className="text-slate-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* History timeline */}
                {expanded[phone.id] !== undefined && (
                  <div className="border-t border-slate-100 px-6 pb-6">
                    <div className="flex items-center justify-between mt-4 mb-2">
                      <p className="text-sm font-semibold text-slate-600">
                        Historique complet — {expanded[phone.id]?.history.length || 0} attribution(s)
                      </p>
                      <button
                        onClick={() => handlePrint(expanded[phone.id]!)}
                        className="btn btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 hover:bg-slate-100"
                      >
                        <Printer size={13} />
                        Imprimer l'historique
                      </button>
                    </div>
                    <HistoryTimeline history={expanded[phone.id]?.history || []} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {result?.pagination && (
        <div className="glass-card rounded-2xl px-4">
          <Pagination pagination={result.pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default History;
