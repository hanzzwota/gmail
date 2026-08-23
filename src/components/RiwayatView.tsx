import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock3, 
  Copy, 
  Check, 
  Filter, 
  Eye, 
  EyeOff, 
  X, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GmailAccountItem } from '../types';

export const RiwayatView: React.FC = () => {
  const { allGmailAccounts, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter accounts for current user
  const userAccounts = allGmailAccounts.filter(a =>
    currentUser?.role === 'admin' ? true : a.userId === currentUser?.id
  );

  const filteredAccounts = userAccounts.filter(acc => {
    // Status filter
    if (statusFilter !== 'all' && acc.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        acc.email.toLowerCase().includes(q) ||
        (acc.rejectReason && acc.rejectReason.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-24 space-y-4">
      {/* Search Bar - Matching Screenshot 5 */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari Gmail..."
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Pills Row 1: Status (Semua, Pending, Diterima, Ditolak) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock3 className="w-3 h-3" /> Pending
        </button>
        <button
          onClick={() => setStatusFilter('accepted')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
            statusFilter === 'accepted'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" /> Diterima
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
            statusFilter === 'rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <XCircle className="w-3 h-3" /> Ditolak
        </button>
      </div>

      {/* Filter Pills Row 2: Time Filter (Semua, Hari ini, 7 Hari, 30 Hari) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setTimeFilter('all')}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            timeFilter === 'all'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setTimeFilter('today')}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            timeFilter === 'today'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Hari ini
        </button>
        <button
          onClick={() => setTimeFilter('7days')}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            timeFilter === '7days'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          7 Hari
        </button>
        <button
          onClick={() => setTimeFilter('30days')}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            timeFilter === '30days'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          30 Hari
        </button>
      </div>

      {/* Cards List Matching Screenshot 5 */}
      <div className="space-y-3">
        {filteredAccounts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-400 text-xs shadow-xs">
            Tidak ada riwayat akun yang cocok dengan filter
          </div>
        ) : (
          filteredAccounts.map((acc) => {
            const isAccepted = acc.status === 'accepted';
            const isRejected = acc.status === 'rejected';
            const isPending = acc.status === 'pending';

            return (
              <div
                key={acc.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-indigo-300 transition-all space-y-2.5"
              >
                {/* Header: Email + Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div 
                    onClick={() => handleCopyEmail(acc.email, acc.id)}
                    className="font-mono text-xs font-bold text-slate-900 truncate max-w-[240px] cursor-pointer hover:text-indigo-600 flex items-center gap-1.5"
                    title="Klik untuk salin email"
                  >
                    <span className="truncate">{acc.email}</span>
                    {copiedId === acc.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 flex items-center gap-1 ${
                    isAccepted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    isRejected ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isAccepted ? 'bg-emerald-500' :
                      isRejected ? 'bg-rose-500' :
                      'bg-amber-500 animate-ping'
                    }`} />
                    {isAccepted ? 'Diterima' : isRejected ? 'Ditolak' : 'Pending'}
                  </span>
                </div>

                {/* Stor & Verifikasi Timestamps (Matching Screenshot 5) */}
                <div className="text-[11px] text-slate-500 font-mono space-y-0.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Stor:</span>
                    <span>{acc.storDate || '16/8/2026, 18.49.33'}</span>
                  </div>
                  {acc.verifikasiDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Verifikasi:</span>
                      <span>{acc.verifikasiDate}</span>
                    </div>
                  )}
                </div>

                {/* Reject Reason Callout Box (Pink Callout matching Screenshot 5) */}
                {isRejected && (
                  <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-rose-700 text-xs flex items-start gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Alasan penolakan: </span>
                      <span className="font-bold uppercase font-mono">{acc.rejectReason || 'VERIFY'}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
