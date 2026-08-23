import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Mail, 
  CreditCard, 
  Inbox, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  XCircle, 
  Ban, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Search, 
  Trash2, 
  Save, 
  Eye, 
  ChevronRight,
  TrendingUp,
  DollarSign,
  Clock,
  ShieldCheck,
  Smartphone,
  Layers,
  ArrowRight,
  X,
  FileText,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Copy,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../utils/avatar';
import { WithdrawalRequest, GmailSubmission, GmailAccountItem, User, AdminEmailStock, AutoCheckResult } from '../types';

export const AdminView: React.FC = () => {
  const { 
    currentUser, 
    allUsers, 
    allGmailAccounts, 
    submissions, 
    withdrawals, 
    settings, 
    adminEmailStocks,
    adminAddEmailStock,
    adminDeleteEmailStock,
    adminClearUnusedStock,
    adminApproveBatch, 
    adminRejectBatch, 
    adminApproveAllPending, 
    adminApproveSingleAccount, 
    adminRejectSingleAccount, 
    adminUpdateAllSetoran,
    adminAddAllPendingSaldo,
    adminCommitStagedSetoran,
    adminBlockUser, 
    adminUnblockUser, 
    adminProcessWithdrawal, 
    adminUpdateSettings, 
    adminDeleteUser,
    adminResetAllDatabase,
    setIsAdminMode,
    setActiveTab,
    addToast
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'users' | 'setoran' | 'pembayaran' | 'stok' | 'gmail' | 'settings'>('users');

  // Payout Mode & Update All State (Instant vs Delay)
  const [payoutMode, setPayoutMode] = useState<'instant' | 'delay'>('instant');
  const [delaySeconds, setDelaySeconds] = useState<number>(5);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [bulkProgressMessage, setBulkProgressMessage] = useState('');
  const [bulkCountdown, setBulkCountdown] = useState(0);
  const [autoCheckResultModal, setAutoCheckResultModal] = useState<AutoCheckResult | null>(null);

  // Filter & Search untuk Tab Daftar User (Sesuai Foto 1)
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [userSortFilter, setUserSortFilter] = useState<'saldo' | 'kualitas' | 'total' | 'nama'>('saldo');
  const [userQualityFilter, setUserQualityFilter] = useState<'all' | 'elite' | 'good' | 'low'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Stock Management Input
  const [stockInputText, setStockInputText] = useState('');

  // Action Modals State
  const [rejectWdTarget, setRejectWdTarget] = useState<WithdrawalRequest | null>(null);
  const [rejectWdReason, setRejectWdReason] = useState('Nomor DANA tidak terdaftar / Tidak valid');

  const [approveWdTarget, setApproveWdTarget] = useState<WithdrawalRequest | null>(null);

  const [rejectBatchTarget, setRejectBatchTarget] = useState<GmailSubmission | null>(null);
  const [rejectBatchReason, setRejectBatchReason] = useState('VERIFY / Password salah');

  const [rejectGmailTarget, setRejectGmailTarget] = useState<GmailAccountItem | null>(null);
  const [rejectGmailReason, setRejectGmailReason] = useState('VERIFY');

  const [blockUserTarget, setBlockUserTarget] = useState<User | null>(null);
  const [blockUserReason, setBlockUserReason] = useState('Kualitas akun (trusted) rendah / melanggar ketentuan');

  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Settings Edit Form
  const [namaDashboard, setNamaDashboard] = useState(settings.namaDashboard || 'Carlos69');
  const [ratePerAkun, setRatePerAkun] = useState(settings.ratePerAkun);
  const [mandatoryPassword, setMandatoryPassword] = useState(settings.mandatoryPassword);
  const [linkSaluran, setLinkSaluran] = useState(settings.linkSaluran);
  const [infoDashboard, setInfoDashboard] = useState(settings.infoDashboard);
  const [isStorOpen, setIsStorOpen] = useState(settings.isStorOpen);
  const [storStatusMessage, setStorStatusMessage] = useState(settings.storStatusMessage);
  const [syaratKetentuan, setSyaratKetentuan] = useState(settings.syaratKetentuan);
  const [rulesHariIni, setRulesHariIni] = useState(settings.rulesHariIni);

  // Keep local settings in sync when settings update
  React.useEffect(() => {
    setNamaDashboard(settings.namaDashboard || 'Carlos69');
    setRatePerAkun(settings.ratePerAkun);
    setMandatoryPassword(settings.mandatoryPassword);
    setLinkSaluran(settings.linkSaluran);
    setInfoDashboard(settings.infoDashboard);
    setIsStorOpen(settings.isStorOpen);
    setStorStatusMessage(settings.storStatusMessage);
    setSyaratKetentuan(settings.syaratKetentuan);
    setRulesHariIni(settings.rulesHariIni);
  }, [settings]);

  // Stats
  const totalUsers = allUsers.filter(u => u.role !== 'admin').length;
  const totalAccountsSold = allGmailAccounts.filter(a => a.status === 'accepted').length;
  const totalRevenue = withdrawals.filter(w => w.status === 'success').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingSubmissionsCount = submissions.filter(s => s.status === 'pending').length;
  const pendingAccountsCount = allGmailAccounts.filter(a => a.status === 'pending').length;
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;

  const unusedStockCount = adminEmailStocks.filter(s => !s.isUsed).length;
  const usedStockCount = adminEmailStocks.filter(s => s.isUsed).length;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    adminUpdateSettings({
      namaDashboard,
      ratePerAkun: Number(ratePerAkun),
      mandatoryPassword,
      linkSaluran,
      infoDashboard,
      isStorOpen,
      storStatusMessage,
      syaratKetentuan,
      rulesHariIni,
    });
  };

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInputText.trim()) return;
    const res = adminAddEmailStock(stockInputText);
    if (res.success) {
      setStockInputText('');
    }
  };

  const handleConfirmRejectWd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectWdTarget) return;
    adminProcessWithdrawal(rejectWdTarget.id, 'rejected', rejectWdReason.trim() || 'Ditolak oleh admin');
    setRejectWdTarget(null);
  };

  const handleConfirmApproveWd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveWdTarget) return;
    adminProcessWithdrawal(approveWdTarget.id, 'success');
    setApproveWdTarget(null);
  };

  const handleConfirmRejectBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectBatchTarget) return;
    adminRejectBatch(rejectBatchTarget.id, rejectBatchReason.trim() || 'VERIFY');
    setRejectBatchTarget(null);
  };

  const handleConfirmRejectGmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectGmailTarget) return;
    adminRejectSingleAccount(rejectGmailTarget.id, rejectGmailReason.trim() || 'VERIFY');
    setRejectGmailTarget(null);
  };

  const handleConfirmBlockUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockUserTarget) return;
    adminBlockUser(blockUserTarget.id, blockUserReason.trim() || 'Pelanggaran ketentuan');
    setBlockUserTarget(null);
  };

  // Staging decisions for Setoran verification (Ditahan di menu sampai admin klik Update All)
  const [stagedDecisions, setStagedDecisions] = useState<Record<string, { status: 'accepted' | 'rejected'; reason?: string }>>({});

  const stagedKeys = Object.keys(stagedDecisions);
  const stagedCount = stagedKeys.length;
  const stagedAcceptedCount = stagedKeys.filter((k) => stagedDecisions[k].status === 'accepted').length;
  const stagedRejectedCount = stagedKeys.filter((k) => stagedDecisions[k].status === 'rejected').length;
  const stagedSaldo = stagedAcceptedCount * (settings.ratePerAkun || 4500);

  // Toggle individual account stage (✓ / ❌)
  const handleToggleStageAccount = (acc: GmailAccountItem, status: 'accepted' | 'rejected', defaultReason = 'Ditolak oleh admin') => {
    setStagedDecisions((prev) => {
      const next = { ...prev };
      if (next[acc.id] && next[acc.id].status === status) {
        delete next[acc.id];
      } else {
        next[acc.id] = { status, reason: defaultReason };
      }
      return next;
    });
  };

  // Stage whole batch (Terima Batch / Tolak Batch)
  const handleStageBatch = (sub: GmailSubmission, status: 'accepted' | 'rejected', defaultReason = 'Ditolak oleh admin') => {
    setStagedDecisions((prev) => {
      const next = { ...prev };
      sub.accounts.forEach((acc) => {
        if (acc.status === 'pending') {
          next[acc.id] = { status, reason: defaultReason };
        }
      });
      return next;
    });

    addToast(
      status === 'accepted' ? 'Batch Ditandai DI-ACC' : 'Batch Ditandai DITOLAK',
      `Ditahan di menu. Klik "Update All" untuk mencairkan saldo ke user.`,
      status === 'accepted' ? 'success' : 'warning'
    );
  };

  const handleClearAllStaging = () => {
    setStagedDecisions({});
    addToast('Draft Direset', 'Semua perubahan yang ditahan dibatalkan.', 'info');
  };

  // ⚡ EKSEKUSI COMMIT PERUBAHAN YANG DITAHAN ATAU AUTO-VERIFIKASI KE USER
  const handleRunCommitOrUpdateAll = async () => {
    if (isProcessingBulk) return;
    setIsProcessingBulk(true);

    if (payoutMode === 'delay') {
      setBulkProgressMessage(`Memproses Update All ke akun user dengan antrean delay (${delaySeconds} detik)...`);
      setBulkCountdown(delaySeconds);
      const interval = setInterval(() => {
        setBulkCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBulkProgressMessage('Menerapkan Update All ke akun user secara INSTAN...');
    }

    try {
      if (stagedCount > 0) {
        const res = await adminCommitStagedSetoran(stagedDecisions, payoutMode, delaySeconds);
        setStagedDecisions({});
        setAutoCheckResultModal(res);
      } else {
        const res = await adminUpdateAllSetoran(payoutMode, delaySeconds);
        setAutoCheckResultModal(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingBulk(false);
      setBulkProgressMessage('');
      setBulkCountdown(0);
    }
  };

  // ⚡ EKSEKUSI UPDATE ALL & AUTO-VERIFIKASI GMAIL SESUAI HASIL GENERATE & RATE
  const handleRunUpdateAll = async () => {
    return handleRunCommitOrUpdateAll();
  };

  // 💰 EKSEKUSI PENAMBAHAN ALL SALDO KE AKUN USER (INSTANT / DELAY)
  const handleAddAllSaldo = async () => {
    if (isProcessingBulk) return;
    setIsProcessingBulk(true);

    if (payoutMode === 'delay') {
      setBulkProgressMessage(`Mencairkan All Saldo ke akun user dengan delay (${delaySeconds} detik)...`);
      setBulkCountdown(delaySeconds);
      const interval = setInterval(() => {
        setBulkCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBulkProgressMessage('Mencairkan All Saldo ke akun user secara INSTAN...');
    }

    try {
      const res = await adminAddAllPendingSaldo(payoutMode, delaySeconds);
      addToast(
        'Saldo Berhasil Ditambahkan',
        `Total Rp ${res.totalSaldo.toLocaleString('id-ID')} (${res.totalAccounts} akun di-ACC) berhasil dicairkan ke ${res.totalUsers} akun user!`,
        'success'
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingBulk(false);
      setBulkProgressMessage('');
      setBulkCountdown(0);
    }
  };

  // Filter and sort user list (matching Foto 1 logic)
  const filteredUsers = allUsers
    .filter(u => u.role !== 'admin')
    .filter(u => {
      if (userStatusFilter === 'active') return u.status === 'active';
      if (userStatusFilter === 'blocked') return u.status === 'blocked';
      return true;
    })
    .filter(u => {
      if (userQualityFilter === 'elite') return u.qualityScore >= 95;
      if (userQualityFilter === 'good') return u.qualityScore >= 80 && u.qualityScore < 95;
      if (userQualityFilter === 'low') return u.qualityScore < 60;
      return true;
    })
    .filter(u => {
      const q = userSearchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        (u.username && u.username.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (userSortFilter === 'saldo') return b.saldo - a.saldo;
      if (userSortFilter === 'kualitas') return b.qualityScore - a.qualityScore;
      if (userSortFilter === 'total') return (b.totalSubmissions || 0) - (a.totalSubmissions || 0);
      if (userSortFilter === 'nama') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-24">
      {/* 1. ADMIN TOP HEADER */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo S3L Carlos69 Kiri */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs font-black">
              69
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-white flex items-center gap-1.5">
                <span>S3L GMAIL</span>
                <span className="text-blue-400">{settings.namaDashboard || 'CARLOS69'}</span>
              </div>
              <div className="text-[10px] text-indigo-400 font-mono font-semibold">PANEL PUSAT ADMIN</div>
            </div>
          </div>

          {/* Center Title */}
          <div className="hidden sm:block text-center">
            <h1 className="text-sm font-extrabold text-white tracking-tight">Dashboard Admin</h1>
            <p className="text-[10px] text-slate-400">Pusat Kendali &amp; Verifikasi Setoran Real-Time</p>
          </div>

          {/* Admin Profile & Switch to User View */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsAdminMode(false);
                setActiveTab('beranda');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Lihat Tampilan User
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <UserAvatar
                nameOrEmail={currentUser?.email || 'Admin'}
                size="sm"
              />
              <span className="hidden md:inline text-xs font-bold text-slate-200">
                {currentUser?.username || 'Ryuu0508'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. ADMIN NAVIGATION TABS */}
      <div className="bg-[#0F172A] border-b border-slate-800 sticky top-[57px] z-30 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-6xl mx-auto flex items-center gap-1.5 py-2">
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'users'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar User</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('stok')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'stok'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Stok Generate User</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] font-mono">
              {unusedStockCount}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('setoran')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'setoran'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Setoran Masuk</span>
            {pendingSubmissionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                {pendingSubmissionsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('pembayaran')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'pembayaran'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pembayaran (DANA)</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] font-mono">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Statistik</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'settings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Pengaturan</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* ================= TAB: DAFTAR USER (PERSIS FOTO 1) ================= */}
        {activeAdminTab === 'users' && (
          <div className="space-y-4">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Daftar User</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Menampilkan {filteredUsers.length} dari {allUsers.filter(u => u.role !== 'admin').length} user
                </p>
              </div>

              {/* Filters Bar matching Foto 1 */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Segmented Status: [Semua] [Aktif] [Diblokir] */}
                <div className="bg-[#1E293B] p-1 rounded-xl border border-slate-700/80 flex items-center">
                  <button
                    onClick={() => setUserStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userStatusFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setUserStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userStatusFilter === 'active'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Aktif
                  </button>
                  <button
                    onClick={() => setUserStatusFilter('blocked')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      userStatusFilter === 'blocked'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Diblokir
                  </button>
                </div>

                {/* Urut Dropdown */}
                <select
                  value={userSortFilter}
                  onChange={(e) => setUserSortFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-[#1E293B] border border-slate-700/80 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="saldo">Urut: Saldo</option>
                  <option value="kualitas">Urut: Kualitas</option>
                  <option value="total">Urut: Total Setoran</option>
                  <option value="nama">Urut: Nama</option>
                </select>

                {/* Kualitas Dropdown */}
                <select
                  value={userQualityFilter}
                  onChange={(e) => setUserQualityFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-[#1E293B] border border-slate-700/80 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Kualitas: Semua</option>
                  <option value="elite">Elite (&ge;95%)</option>
                  <option value="good">Good (80-94%)</option>
                  <option value="low">Rendah (&lt;60%)</option>
                </select>
              </div>
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Cari nama, email, UID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1E293B] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              {userSearchQuery && (
                <button
                  onClick={() => setUserSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Table matching Screenshot Foto 1 */}
            <div className="bg-[#1E293B] rounded-3xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] text-slate-400 border-b border-slate-800/80 bg-slate-900/60 font-semibold">
                    <tr>
                      <th className="p-4 pl-5">Nama</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Kualitas</th>
                      <th className="p-4">Saldo</th>
                      <th className="p-4 text-center">Total</th>
                      <th className="p-4 text-center">Diterima</th>
                      <th className="p-4 text-center">Ditolak</th>
                      <th className="p-4 pr-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          Tidak ada user yang sesuai dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        // Determine quality badge styling matching Foto 1
                        const score = u.qualityScore || 0;
                        let qualityBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                        let qualityTier = 'Elite Seller';

                        if (score < 60) {
                          qualityBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                          qualityTier = 'Low Quality';
                        } else if (score < 80) {
                          qualityBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                          qualityTier = 'Seller';
                        } else if (score < 95) {
                          qualityBg = 'bg-amber-400/20 text-amber-300 border-amber-400/40';
                          qualityTier = 'Good Seller';
                        } else {
                          qualityBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                          qualityTier = score === 100 ? 'Elite Seller' : 'Trusted Seller';
                        }

                        return (
                          <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                            {/* Nama + UID */}
                            <td className="p-4 pl-5">
                              <div className="font-bold text-white text-xs">{u.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono tracking-tight mt-0.5 select-all">
                                {u.id}
                              </div>
                            </td>

                            {/* Email */}
                            <td className="p-4 font-mono text-slate-300 select-all">
                              {u.email}
                            </td>

                            {/* Status: Dot + Aktif */}
                            <td className="p-4">
                              {u.status === 'active' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[11px] font-bold">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>Aktif</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/60 text-[11px] font-bold">
                                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                                  <span>Diblokir</span>
                                </span>
                              )}
                            </td>

                            {/* Kualitas: Pill Pill */}
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${qualityBg}`}>
                                {score}% • {qualityTier}
                              </span>
                            </td>

                            {/* Saldo */}
                            <td className="p-4 font-mono font-bold text-white text-xs whitespace-nowrap">
                              Rp{u.saldo.toLocaleString('id-ID')}
                            </td>

                            {/* Total Setoran */}
                            <td className="p-4 text-center font-mono font-bold text-slate-300">
                              {u.totalSubmissions || 0}
                            </td>

                            {/* Diterima */}
                            <td className="p-4 text-center font-mono font-bold text-emerald-400">
                              {u.acceptedCount || 0}
                            </td>

                            {/* Ditolak */}
                            <td className="p-4 text-center font-mono font-bold text-rose-400">
                              {u.rejectedCount || 0}
                            </td>

                            {/* Aksi */}
                            <td className="p-4 pr-5 text-right whitespace-nowrap space-x-1.5">
                              {u.status === 'active' ? (
                                <button
                                  onClick={() => {
                                    setBlockUserTarget(u);
                                    setBlockUserReason('Kualitas setoran rendah / melanggar ketentuan');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-900/40 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px] font-bold cursor-pointer transition-all"
                                >
                                  Blokir
                                </button>
                              ) : (
                                <button
                                  onClick={() => adminUnblockUser(u.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-bold cursor-pointer transition-all"
                                >
                                  Aktifkan
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  if (confirm(`Hapus akun user ${u.name}?`)) {
                                    adminDeleteUser(u.id);
                                  }
                                }}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 cursor-pointer"
                                title="Hapus User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: STOK GENERATE USER (POOL EMAIL) ================= */}
        {activeAdminTab === 'stok' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Stok Generate Email User</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Masukkan daftar email yang siap digunakan user saat menekan tombol "Generate Akun" di menu Stor.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={adminClearUnusedStock}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bersihkan Stok Belum Terpakai</span>
                </button>
              </div>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Sisa Stok Tersedia</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">{unusedStockCount} Akun</div>
                <div className="text-[10px] text-slate-400">Siap diambil saat user request generate</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Stok Terpakai</div>
                <div className="text-2xl font-black text-blue-400 font-mono">{usedStockCount} Akun</div>
                <div className="text-[10px] text-slate-400">Telah digenerate oleh para user</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Total Pool Database</div>
                <div className="text-2xl font-black text-white font-mono">{adminEmailStocks.length} Akun</div>
                <div className="text-[10px] text-slate-400">Semua data stok email admin</div>
              </div>
            </div>

            {/* Form Input Tambah Stok Email */}
            <div className="bg-[#1E293B] rounded-3xl p-5 sm:p-6 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-bold text-white">Tambah Stok Email Baru</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste daftar email di bawah ini (1 email per baris). Email ini akan otomatis dibagikan secara adil ke user yang melakukan generate di menu setor.
              </p>

              <form onSubmit={handleAddStock} className="space-y-3">
                <textarea
                  value={stockInputText}
                  onChange={(e) => setStockInputText(e.target.value)}
                  placeholder={`dhmgkamalperdana3899@gmail.com\nikmoandrewraksa3596@gmail.com\nrmigjessicaallen6975@gmail.com`}
                  rows={6}
                  className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {stockInputText.split('\n').filter(l => l.trim().includes('@')).length} email terdeteksi
                  </span>
                  <button
                    type="submit"
                    disabled={!stockInputText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan ke Stok Pool</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Table Daftar Stok Email */}
            <div className="bg-[#1E293B] rounded-3xl p-5 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white">Daftar Stok Email dalam Sistem</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] text-slate-400 border-b border-slate-800 bg-slate-900/50">
                    <tr>
                      <th className="p-3">Email</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Diambil Oleh</th>
                      <th className="p-3">Waktu Ambil / Dibuat</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {adminEmailStocks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 font-sans">
                          Belum ada stok email. Silakan isi form di atas!
                        </td>
                      </tr>
                    ) : (
                      adminEmailStocks.slice(0, 30).map((stk) => (
                        <tr key={stk.id} className="hover:bg-slate-800/40">
                          <td className="p-3 text-indigo-300 select-all font-bold">{stk.email}</td>
                          <td className="p-3 font-sans">
                            {stk.isUsed ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">
                                SUDAH DIGENERATE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                                TERSEDIA
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-sans text-slate-300">
                            {stk.usedByUserName ? (
                              <div>
                                <span className="font-bold text-white">{stk.usedByUserName}</span>
                                <span className="text-[10px] text-slate-500 block font-mono">{stk.usedByUserId}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-400 text-[11px]">
                            {stk.usedAt || stk.createdAt}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => adminDeleteEmailStock(stk.id)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: SETORAN MASUK ================= */}
        {activeAdminTab === 'setoran' && (
          <div className="space-y-5">
            {/* 1. KONTROL PANEL AUTO-VERIFIKASI & SALDO (INSTANT / DELAY) */}
            <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 rounded-3xl p-5 sm:p-6 border border-blue-800/50 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h2 className="text-base font-black text-white tracking-tight">
                      Panel Kontrol Auto-Verifikasi &amp; Penambahan Saldo
                    </h2>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Fitur otomatis untuk memeriksa kecocokan akun dengan stok generate admin, menambah saldo user sesuai rate (<strong className="text-emerald-400 font-mono">Rp {settings.ratePerAkun.toLocaleString('id-ID')}/akun</strong>), serta menolak otomatis akun yang tidak sesuai.
                  </p>
                </div>

                {/* Mode Selector: Instant vs Delay */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/70">
                  <span className="text-[11px] font-bold text-slate-400 px-2">Mode Saldo:</span>
                  <button
                    onClick={() => setPayoutMode('instant')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      payoutMode === 'instant'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>⚡ Instan</span>
                  </button>

                  <button
                    onClick={() => setPayoutMode('delay')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      payoutMode === 'delay'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>⏳ Delay</span>
                  </button>

                  {payoutMode === 'delay' && (
                    <select
                      value={delaySeconds}
                      onChange={(e) => setDelaySeconds(Number(e.target.value))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-300 focus:outline-none cursor-pointer"
                    >
                      <option value={3}>3 Detik</option>
                      <option value={5}>5 Detik</option>
                      <option value={10}>10 Detik</option>
                      <option value={30}>30 Detik</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Progress Countdown Bar when processing */}
              {isProcessingBulk && (
                <div className="p-4 bg-blue-900/40 rounded-2xl border border-blue-500/50 space-y-2 animate-pulse">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-white rounded-full animate-spin" />
                      <span>{bulkProgressMessage}</span>
                    </div>
                    {bulkCountdown > 0 && (
                      <span className="font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/40">
                        Sisa Waktu: {bulkCountdown}s
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2 rounded-full animate-[progress_1s_ease-in-out_infinite]" />
                  </div>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* BUTTON 1: UPDATE ALL & AUTO-VERIFIKASI GMAIL */}
                <button
                  onClick={handleRunUpdateAll}
                  disabled={isProcessingBulk}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-between gap-2 cursor-pointer transition-all border border-blue-400/30"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <RefreshCw className={`w-4 h-4 text-white ${isProcessingBulk ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <div className="text-xs font-black tracking-wide uppercase">⚡ Update All Status Gmail</div>
                      <div className="text-[10px] text-blue-100 font-normal">
                        Auto-cek stok generate, tolak yg beda, ACC &amp; beri saldo
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-200 shrink-0" />
                </button>

                {/* BUTTON 2: TAMBAH ALL SALDO KE AKUN USER */}
                <button
                  onClick={handleAddAllSaldo}
                  disabled={isProcessingBulk}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-between gap-2 cursor-pointer transition-all border border-emerald-400/30"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-black tracking-wide uppercase">
                        💰 Tambah All Saldo ke User ({payoutMode === 'instant' ? 'Instan' : `Delay ${delaySeconds}s`})
                      </div>
                      <div className="text-[10px] text-emerald-100 font-normal">
                        Tambah saldo ke user sesuai rate &amp; jumlah akun di-ACC
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-200 shrink-0" />
                </button>
              </div>
            </div>

            {/* Header List Setoran */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <h3 className="text-sm font-bold text-white">Daftar Antrean Setoran</h3>
                <p className="text-xs text-slate-400">Total {submissions.length} batch setoran terdaftar di sistem</p>
              </div>

              {stagedCount > 0 ? (
                <button
                  onClick={handleRunCommitOrUpdateAll}
                  disabled={isProcessingBulk}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-white text-xs font-black rounded-full shadow-lg shadow-emerald-900/50 cursor-pointer flex items-center gap-1.5 uppercase transition-all animate-pulse"
                >
                  <Zap className="w-4 h-4" />
                  <span>UPDATE ALL ({stagedCount})</span>
                </button>
              ) : pendingAccountsCount > 0 ? (
                <button
                  onClick={handleRunCommitOrUpdateAll}
                  disabled={isProcessingBulk}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-black rounded-full shadow-md shadow-emerald-950/40 cursor-pointer flex items-center gap-1.5 uppercase transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ACC SEMUA PENDING ({pendingAccountsCount})</span>
                </button>
              ) : null}
            </div>

            {/* STAGED FLOATING BANNER (Notice changes are held until Update All) */}
            {stagedCount > 0 && (
              <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-blue-950/90 border border-emerald-500/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-2">
                      <span>{stagedAcceptedCount} Akun Ditandai ACC, {stagedRejectedCount} Ditandai Tolak</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        SALDO DITAHAN (Belum Masuk User)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Potensi Saldo Cair: <strong className="text-emerald-400 font-mono">Rp {stagedSaldo.toLocaleString('id-ID')}</strong>. Tekan tombol <strong className="text-white">Update All</strong> untuk menerapkan resmi ke saldo akun user.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleClearAllStaging}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Batal Draft
                  </button>
                  <button
                    onClick={handleRunCommitOrUpdateAll}
                    disabled={isProcessingBulk}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Update All Sekarang (+Rp {stagedSaldo.toLocaleString('id-ID')})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Setoran Items List */}
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <div className="p-8 text-center bg-[#1E293B] rounded-3xl border border-slate-800 text-slate-400 text-xs">
                  Tidak ada setoran masuk (0 setoran pending)
                </div>
              ) : (
                submissions.map((sub) => {
                  const isPending = sub.status === 'pending';
                  const isApproved = sub.status === 'approved';
                  const isPartially = sub.status === 'partially_approved';
                  const isRejected = sub.status === 'rejected';

                  return (
                    <div
                      key={sub.id}
                      className="bg-[#131C31] rounded-3xl p-5 border border-slate-800/90 space-y-3.5 shadow-lg"
                    >
                      {/* Top Row: Batch ID, Status, Seller info & Amount */}
                      <div className="flex items-start justify-between gap-3 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-white text-base tracking-tight">{sub.batchId}</span>
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                              isApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              isPartially ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              isPending ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60' :
                              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {isPartially ? 'SEBAGIAN DISETUJUI' : sub.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Seller: <strong className="text-slate-200">{sub.userName}</strong> ({sub.userEmail}) • {sub.createdAt}
                          </div>
                          {sub.rejectReason && (
                            <div className="text-xs text-rose-400 font-semibold mt-1.5 bg-rose-950/40 p-2 rounded-xl border border-rose-900/60">
                              Alasan Penolakan: {sub.rejectReason}
                            </div>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-base font-black text-emerald-400 font-mono tracking-tight">
                            Rp {sub.totalAmount.toLocaleString('id-ID')}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{sub.totalCount} Akun Gmail</div>
                        </div>
                      </div>

                      {/* Account list with check (✓) and cross (X) buttons matching screenshot */}
                      <div className="space-y-2">
                        {sub.accounts.map((acc, idx) => {
                          const staged = stagedDecisions[acc.id];
                          const isStagedAccepted = staged?.status === 'accepted';
                          const isStagedRejected = staged?.status === 'rejected';

                          return (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                isStagedAccepted
                                  ? 'bg-emerald-950/30 border-emerald-600/60'
                                  : isStagedRejected
                                  ? 'bg-rose-950/30 border-rose-600/60'
                                  : 'bg-[#0B132B] border-slate-800/80'
                              }`}
                            >
                              {/* Left: Email + Password & Status Badge */}
                              <div className="space-y-1.5 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs">
                                  <span className="select-all text-slate-100 font-bold truncate">{acc.email}</span>
                                  <span className="text-slate-400 text-xs shrink-0">Pass: {acc.password}</span>
                                </div>

                                <div>
                                  {isStagedAccepted ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse font-mono">
                                      ✅ SIAP DI-ACC (Ditahan)
                                    </span>
                                  ) : isStagedRejected ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse font-mono truncate max-w-[250px]">
                                      ❌ SIAP DITOLAK (Ditahan)
                                    </span>
                                  ) : acc.status === 'accepted' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                                      ✅ DISETUJUI (+Rp {acc.price.toLocaleString('id-ID')})
                                    </span>
                                  ) : acc.status === 'rejected' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 font-mono truncate max-w-[250px]" title={acc.rejectReason}>
                                      ❌ {acc.rejectReason || 'DITOLAK'}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono">
                                      ⏳ PENDING
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right: Quick Action Icon Buttons matching Screenshot (✓ and ❌) */}
                              <div className="flex items-center gap-2 shrink-0">
                                {/* 1. Green Checkmark Action Button */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleStageAccount(acc, 'accepted')}
                                  title={isStagedAccepted ? 'Batalkan ACC (Ditahan)' : 'ACC Akun Ini (Ditahan)'}
                                  className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                                    isStagedAccepted
                                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/40 scale-105'
                                      : 'bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50'
                                  }`}
                                >
                                  <Check className="w-5 h-5 stroke-[3]" />
                                </button>

                                {/* 2. Red X Action Button */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleStageAccount(acc, 'rejected', 'Ditolak oleh admin')}
                                  title={isStagedRejected ? 'Batalkan Tolak' : 'Tolak Akun Ini (Ditahan)'}
                                  className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                                    isStagedRejected
                                      ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow-lg shadow-rose-600/40 scale-105'
                                      : 'bg-slate-900/80 hover:bg-rose-950/60 text-rose-500 hover:text-rose-400 border border-slate-700/60 hover:border-rose-700/60'
                                  }`}
                                >
                                  <X className="w-5 h-5 stroke-[3]" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Admin Batch Actions */}
                      {sub.status === 'pending' && (
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => handleStageBatch(sub, 'accepted')}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer transition-all"
                          >
                            <Check className="w-4 h-4 stroke-[2.5]" />
                            <span>Terima Batch (+Rp {sub.totalAmount.toLocaleString('id-ID')})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStageBatch(sub, 'rejected', 'Email tidak sesuai hasil generate / password salah')}
                            className="px-5 py-3 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/40 transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Tolak Batch</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================= TAB: PEMBAYARAN (DANA) ================= */}
        {activeAdminTab === 'pembayaran' && (
          <div className="bg-[#1E293B] rounded-3xl p-5 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>Daftar Pembayaran &amp; Penarikan Saldo (DANA)</span>
                </h2>
                <p className="text-xs text-slate-400">Kelola konfirmasi transfer penarikan saldo seller ke nomor DANA</p>
              </div>

              {pendingWithdrawalsCount > 0 && (
                <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{pendingWithdrawalsCount} Menunggu Konfirmasi</span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] text-slate-400 border-b border-slate-800 bg-slate-900/50">
                  <tr>
                    <th className="p-3">No</th>
                    <th className="p-3">Waktu</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Nomor DANA User</th>
                    <th className="p-3">Nominal (Rp)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Keterangan / Alasan Penolakan</th>
                    <th className="p-3 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400">
                        Belum ada permintaan pembayaran penarikan (0 penarikan)
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((wd, index) => (
                      <tr key={wd.id} className="hover:bg-slate-800/50">
                        <td className="p-3 font-mono text-slate-400">{index + 1}</td>
                        <td className="p-3 font-mono text-slate-400 text-[11px]">{wd.createdAt}</td>
                        <td className="p-3">
                          <div className="font-bold text-white">{wd.userName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{wd.userEmail}</div>
                        </td>
                        <td className="p-3 font-mono">
                          <div className="font-bold text-blue-400">{wd.accountNumber}</div>
                          <div className="text-[10px] text-slate-400 font-sans">a/n {wd.accountName}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-400">
                          Rp {wd.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            wd.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                            wd.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-rose-500/20 text-rose-400'
                          }`}>
                            {wd.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 max-w-[220px]">
                          {wd.status === 'rejected' && wd.rejectReason ? (
                            <div className="text-rose-400 bg-rose-950/40 p-2 rounded-xl border border-rose-900/60 text-[11px]">
                              <strong className="block font-bold">Alasan Ditolak:</strong>
                              <span>{wd.rejectReason}</span>
                            </div>
                          ) : wd.status === 'success' ? (
                            <div className="text-emerald-400 font-mono text-[10px] bg-emerald-950/30 p-1.5 rounded-lg border border-emerald-900/40 break-all">
                              {wd.providerInfo || `Ref: ${wd.txId}`}
                            </div>
                          ) : (
                            <span className="text-slate-500 font-mono">Menunggu Konfirmasi Admin</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {wd.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => setApproveWdTarget(wd)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                              >
                                ✅ ACC
                              </button>
                              <button
                                onClick={() => {
                                  setRejectWdTarget(wd);
                                  setRejectWdReason('Nomor DANA tidak terdaftar / Tidak valid');
                                }}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                              >
                                ❌ Tolak
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono">Selesai</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: STATISTIK ================= */}
        {activeAdminTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-[#1E293B] rounded-2xl p-4 border border-slate-800 shadow-sm space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Total User</div>
                <div className="text-2xl font-black text-white font-mono">{totalUsers}</div>
                <div className="text-[10px] text-emerald-400">Terdaftar di Database</div>
              </div>

              <div className="bg-[#1E293B] rounded-2xl p-4 border border-slate-800 shadow-sm space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Stok Tersedia</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">{unusedStockCount}</div>
                <div className="text-[10px] text-slate-400">Siap digenerate user</div>
              </div>

              <div className="bg-[#1E293B] rounded-2xl p-4 border border-slate-800 shadow-sm space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Total Pencairan DANA</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-400">Penarikan Sukses</div>
              </div>

              <div className="bg-[#1E293B] rounded-2xl p-4 border border-slate-800 shadow-sm space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Pending Setoran</div>
                <div className="text-2xl font-black text-rose-400 font-mono">{pendingAccountsCount} Akun</div>
                <div className="text-[10px] text-amber-400">{pendingSubmissionsCount} Batch Menunggu</div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: PENGATURAN ================= */}
        {activeAdminTab === 'settings' && (
          <div className="bg-[#1E293B] rounded-3xl p-6 border border-slate-800 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-blue-400" />
                <span>Pengaturan Sistem {settings.namaDashboard || 'Carlos69'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Perubahan pada formulir ini langsung disinkronkan secara real-time ke seluruh user!
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Nama Dashboard</label>
                  <input
                    type="text"
                    value={namaDashboard}
                    onChange={(e) => setNamaDashboard(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Harga / Rate per Akun (Rp)</label>
                  <input
                    type="number"
                    value={ratePerAkun}
                    onChange={(e) => setRatePerAkun(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Password Wajib Setoran</label>
                  <input
                    type="text"
                    value={mandatoryPassword}
                    onChange={(e) => setMandatoryPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Link Saluran WhatsApp</label>
                  <input
                    type="text"
                    value={linkSaluran}
                    onChange={(e) => setLinkSaluran(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Status Open / Tutup Setoran */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Status Penerimaan Setoran</div>
                  <div className="text-[11px] text-slate-400">Buka atau tutup sementara formulir setor akun untuk seluruh user</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isStorOpen}
                    onChange={(e) => setIsStorOpen(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Pesan Pengumuman Dashboard</label>
                <textarea
                  value={infoDashboard}
                  onChange={(e) => setInfoDashboard(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  Simpan Semua Pengaturan
                </button>
              </div>
            </form>

            {/* DANGER ZONE: RESET ALL DATABASE */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Zona Berbahaya (Reset Database)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tombol di bawah ini akan mereset seluruh setoran, antrean verifikasi, riwayat penarikan, dan saldo seluruh akun kembali ke Rp 0 seperti semula.
              </p>
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Seluruh Database ke 0 (Setoran &amp; Saldo 0)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL TOLAK PENARIKAN DANA */}
      {rejectWdTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>Tolak Penarikan Saldo DANA</span>
              </div>
              <button onClick={() => setRejectWdTarget(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1 text-xs">
              <div className="text-slate-400">User: <strong className="text-white">{rejectWdTarget.userName}</strong></div>
              <div className="text-slate-400">Nomor DANA: <strong className="text-blue-400 font-mono">{rejectWdTarget.accountNumber}</strong></div>
              <div className="text-slate-400">Nominal: <strong className="text-emerald-400 font-mono">Rp {rejectWdTarget.amount.toLocaleString('id-ID')}</strong></div>
            </div>

            <form onSubmit={handleConfirmRejectWd} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Pilih / Tulis Alasan Penolakan:</label>
                <div className="space-y-1.5 mb-2">
                  {[
                    'Nomor DANA tidak terdaftar / Tidak valid',
                    'Akun DANA Limit / Tidak bisa terima saldo',
                    'Nama Akun DANA tidak sesuai identitas',
                    'Indikasi setoran tidak valid / Checkpoint',
                  ].map((quickReason, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRejectWdReason(quickReason)}
                      className={`w-full text-left p-2 rounded-xl text-[11px] border transition-all cursor-pointer ${
                        rejectWdReason === quickReason
                          ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {quickReason}
                    </button>
                  ))}
                </div>

                <textarea
                  value={rejectWdReason}
                  onChange={(e) => setRejectWdReason(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-rose-500"
                  placeholder="Ketik alasan lainnya..."
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectWdTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg"
                >
                  Konfirmasi Tolak &amp; Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ACC PENARIKAN DANA */}
      {approveWdTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Konfirmasi ACC Transfer DANA</span>
              </div>
              <button onClick={() => setApproveWdTarget(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">User:</span>
                <strong className="text-white">{approveWdTarget.userName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nomor DANA Tujuan:</span>
                <strong className="text-blue-400 font-mono text-sm">{approveWdTarget.accountNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Atas Nama:</span>
                <strong className="text-slate-200">{approveWdTarget.accountName}</strong>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1.5">
                <span className="text-slate-400">Total Ditransfer:</span>
                <strong className="text-emerald-400 font-mono text-sm">Rp {approveWdTarget.amount.toLocaleString('id-ID')}</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Pastikan Anda telah mengirimkan saldo ke akun DANA di atas. Status akan ditandai <strong>SUKSES</strong> dan notifikasi otomatis dikirimkan ke user.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApproveWdTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApproveWd}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
              >
                ACC &amp; Selesaikan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LAPORAN HASIL UPDATE ALL & AUTO-VERIFIKASI */}
      {autoCheckResultModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-blue-600/60 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Sparkles className="w-5 h-5" />
                <span>Laporan Hasil Update All &amp; Auto-Verifikasi</span>
              </div>
              <button
                onClick={() => setAutoCheckResultModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stat Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Diproses</div>
                <div className="text-lg font-black text-white font-mono">{autoCheckResultModal.totalProcessed}</div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 text-center">
                <div className="text-[10px] text-emerald-400 font-bold uppercase">Disetujui (ACC)</div>
                <div className="text-lg font-black text-emerald-400 font-mono">{autoCheckResultModal.totalApproved}</div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-center">
                <div className="text-[10px] text-rose-400 font-bold uppercase">Ditolak</div>
                <div className="text-lg font-black text-rose-400 font-mono">{autoCheckResultModal.totalRejected}</div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-950/50 border border-blue-800/60 text-center">
                <div className="text-[10px] text-blue-300 font-bold uppercase">Saldo Ditambahkan</div>
                <div className="text-sm font-black text-emerald-400 font-mono mt-1">
                  +Rp {autoCheckResultModal.totalSaldoAdded.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300">
              Rincian hasil verifikasi otomatis berdasarkan kecocokan <strong>stok generate admin</strong> &amp; <strong>password wajib</strong>:
            </div>

            {/* Detail items list table */}
            <div className="flex-1 overflow-y-auto bg-slate-900/90 rounded-2xl border border-slate-800 p-2 space-y-1.5 min-h-[160px]">
              {autoCheckResultModal.details.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Tidak ada data rincian akun dalam pemrosesan ini.
                </div>
              ) : (
                autoCheckResultModal.details.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                  >
                    <div className="truncate">
                      <span className="font-bold text-white select-all">{item.email}</span>
                      <span className="text-slate-400 text-[11px] block font-sans">
                        User: <strong className="text-slate-300">{item.userName}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'accepted' ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          ✅ Disetujui (+Rp {item.amountAdded.toLocaleString('id-ID')})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 truncate max-w-[220px]">
                          ❌ {item.reason || 'Ditolak'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">
                Mode Eksekusi: <strong className="text-white uppercase font-mono">{autoCheckResultModal.mode}</strong>
              </span>

              <button
                type="button"
                onClick={() => setAutoCheckResultModal(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg cursor-pointer transition-all"
              >
                Selesai &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BLOKIR AKUN USER */}
      {blockUserTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-rose-600/60 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Ban className="w-5 h-5" />
                <span>Blokir Akun Pengguna</span>
              </div>
              <button onClick={() => setBlockUserTarget(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1 text-xs">
              <div className="text-slate-400">Nama User: <strong className="text-white">{blockUserTarget.name}</strong></div>
              <div className="text-slate-400">Email: <strong className="text-blue-400 font-mono">{blockUserTarget.email}</strong></div>
              <div className="text-slate-400">UID: <strong className="text-slate-300 font-mono text-[11px]">{blockUserTarget.id}</strong></div>
              <div className="text-slate-400">Saldo saat ini: <strong className="text-emerald-400 font-mono">Rp {blockUserTarget.saldo.toLocaleString('id-ID')}</strong></div>
            </div>

            <form onSubmit={handleConfirmBlockUser} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Pilih / Ketik Alasan Pemblokiran:</label>
                <div className="space-y-1.5 mb-2">
                  {[
                    'Kualitas setoran rendah / 0% Trusted',
                    'Email CP / Password tidak sesuai aturan',
                    'Menyetor email bukan dari hasil generate',
                    'Pelanggaran syarat & ketentuan sistem',
                  ].map((quickReason, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBlockUserReason(quickReason)}
                      className={`w-full text-left p-2 rounded-xl text-[11px] border transition-all cursor-pointer ${
                        blockUserReason === quickReason
                          ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {quickReason}
                    </button>
                  ))}
                </div>

                <textarea
                  value={blockUserReason}
                  onChange={(e) => setBlockUserReason(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-rose-500"
                  placeholder="Ketik alasan lainnya..."
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockUserTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg cursor-pointer"
                >
                  Ya, Blokir Akun Ini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TOLAK BATCH SETORAN */}
      {rejectBatchTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-rose-600/60 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>Tolak Batch Setoran</span>
              </div>
              <button onClick={() => setRejectBatchTarget(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1 text-xs">
              <div className="text-slate-400">Batch ID: <strong className="text-white font-mono">{rejectBatchTarget.batchId}</strong></div>
              <div className="text-slate-400">User: <strong className="text-white">{rejectBatchTarget.userName}</strong></div>
              <div className="text-slate-400">Total Akun: <strong className="text-rose-400 font-mono">{rejectBatchTarget.totalCount} Akun</strong></div>
            </div>

            <form onSubmit={handleConfirmRejectBatch} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Pilih / Ketik Alasan Penolakan:</label>
                <div className="space-y-1.5 mb-2">
                  {[
                    'Email tidak sesuai hasil generate stok admin',
                    'Password salah / bukan password wajib',
                    'Akun terkena Checkpoint (CP)',
                    'Format email tidak valid / bermasalah',
                  ].map((quickReason, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRejectBatchReason(quickReason)}
                      className={`w-full text-left p-2 rounded-xl text-[11px] border transition-all cursor-pointer ${
                        rejectBatchReason === quickReason
                          ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {quickReason}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={rejectBatchReason}
                  onChange={(e) => setRejectBatchReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  placeholder="Ketik alasan lainnya..."
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectBatchTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg cursor-pointer"
                >
                  Konfirmasi Tolak Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TOLAK SINGLE GMAIL */}
      {rejectGmailTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-rose-600/60 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>Tolak Akun Gmail</span>
              </div>
              <button onClick={() => setRejectGmailTarget(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1 text-xs">
              <div className="text-slate-400">Email: <strong className="text-white font-mono">{rejectGmailTarget.email}</strong></div>
              <div className="text-slate-400">Password: <strong className="text-blue-400 font-mono">{rejectGmailTarget.password}</strong></div>
            </div>

            <form onSubmit={handleConfirmRejectGmail} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Alasan Penolakan:</label>
                <input
                  type="text"
                  value={rejectGmailReason}
                  onChange={(e) => setRejectGmailReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  placeholder="VERIFY / Password salah / CP"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectGmailTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg cursor-pointer"
                >
                  Tolak Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESET DATABASE CONFIRMATION */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-rose-700/60 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Konfirmasi Reset Seluruh Database</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin <strong>mereset semua data</strong>? 
              <br />• Seluruh saldo user akan kembali menjadi <strong>Rp 0</strong>.
              <br />• Seluruh riwayat setoran &amp; penarikan akan dikosongkan (0).
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  adminResetAllDatabase();
                  setShowResetConfirmModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
