import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, 
  GmailAccountItem, 
  GmailSubmission, 
  WithdrawalRequest, 
  Transaction, 
  PlatformSettings, 
  ActivityLog, 
  GeneratedGmail, 
  AppNotification, 
  Announcement,
  AdminEmailStock,
  AutoCheckResult
} from '../types';
import { playNotificationSound } from '../utils/sound';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  currentUser: User | null;
  allUsers: User[];
  submissions: GmailSubmission[];
  allGmailAccounts: GmailAccountItem[];
  withdrawals: WithdrawalRequest[];
  transactions: Transaction[];
  settings: PlatformSettings;
  activityLogs: ActivityLog[];
  generatedGmails: GeneratedGmail[];
  notifications: AppNotification[];
  announcements: Announcement[];
  adminEmailStocks: AdminEmailStock[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (val: boolean) => void;
  toasts: ToastItem[];
  removeToast: (id: string) => void;
  liveEvent: string | null;

  // Auth Operations
  login: (identifier: string, pass: string) => { success: boolean; message: string };
  loginWithGoogle: () => void;
  register: (name: string, email: string, pass: string, referralCode?: string) => { success: boolean; message: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  updateUserProfile: (data: Partial<User>) => void;
  saveDanaNumber: (danaNum: string, accountName?: string) => void;
  changePassword: (newPass: string) => void;

  // User Operations
  submitBulkGmail: (rawText: string, note?: string) => { success: boolean; message: string; count?: number };
  requestWithdrawal: (amount: number, danaNumber: string, accountName: string) => { success: boolean; message: string };
  generateNewGmails: (count: number) => { success: boolean; message: string; count: number };
  deleteGeneratedGmail: (id: string) => void;
  clearMyGeneratedGmails: () => void;

  // Admin Operations
  adminAddEmailStock: (rawEmails: string) => { success: boolean; count: number; message: string };
  adminDeleteEmailStock: (id: string) => void;
  adminClearUnusedStock: () => void;
  adminApproveBatch: (batchId: string) => void;
  adminRejectBatch: (batchId: string, reason: string) => void;
  adminApproveSingleAccount: (accountId: string) => void;
  adminRejectSingleAccount: (accountId: string, reason: string) => void;
  adminApproveAllPending: () => void;
  adminUpdateAllSetoran: (mode?: 'instant' | 'delay', delaySec?: number) => Promise<AutoCheckResult>;
  adminAddAllPendingSaldo: (mode?: 'instant' | 'delay', delaySec?: number) => Promise<{ totalUsers: number; totalSaldo: number; totalAccounts: number }>;
  adminCommitStagedSetoran: (
    stagedDecisions: Record<string, { status: 'accepted' | 'rejected'; reason?: string }>,
    mode?: 'instant' | 'delay',
    delaySec?: number
  ) => Promise<AutoCheckResult>;
  adminBlockUser: (userId: string, reason: string) => void;
  adminUnblockUser: (userId: string) => void;
  adminProcessWithdrawal: (withdrawalId: string, status: 'success' | 'rejected', reason?: string) => void;
  adminUpdateSettings: (newSettings: Partial<PlatformSettings>) => void;
  adminDeleteUser: (userId: string) => void;
  adminResetAllDatabase: () => void;

  // Global Notification & Toast
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const STORAGE_KEY_USER = 'carlos69_current_user_v5';
const STORAGE_KEY_USERS = 'carlos69_all_users_v5';
const STORAGE_KEY_ACCOUNTS = 'carlos69_gmail_accounts_v5';
const STORAGE_KEY_SUBMISSIONS = 'carlos69_submissions_v5';
const STORAGE_KEY_WITHDRAWALS = 'carlos69_withdrawals_v5';
const STORAGE_KEY_SETTINGS = 'carlos69_settings_v5';
const STORAGE_KEY_LOGS = 'carlos69_activity_logs_v5';
const STORAGE_KEY_GENERATED = 'carlos69_generated_gmails_v5';
const STORAGE_KEY_NOTIFS = 'carlos69_notifications_v5';
const STORAGE_KEY_EMAIL_STOCK = 'carlos69_admin_email_stocks_v5';

// Fallback helper to migrate from old keys if needed
const getSavedStorage = (key: string, fallbackKey: string) => {
  try {
    const val = localStorage.getItem(key);
    if (val) return JSON.parse(val);
    const oldVal = localStorage.getItem(fallbackKey);
    if (oldVal) return JSON.parse(oldVal);
    return null;
  } catch {
    return null;
  }
};

// SEED DATA: Clean & Reset As Requested
const SEED_ADMIN: User = {
  id: 'usr-admin-001',
  name: 'Admin Carlos69 Pusat',
  username: 'Ryuu0508',
  email: 'admin@carlos69.com',
  password: 'Hanzz0508',
  role: 'admin',
  danaNumber: '081199990000',
  danaAccountName: 'ADMIN CARLOS69 PUSAT',
  saldo: 0,
  status: 'active',
  qualityScore: 100,
  trustBadge: 'Super Administrator',
  phone: '081199990000',
  joinedAt: '01/01/2026',
  referralCode: 'ADMIN-CARLOS69',
  passwordChangedAt: '10/01/2026',
  totalSubmissions: 0,
  acceptedCount: 0,
  pendingCount: 0,
  rejectedCount: 0,
};

const INITIAL_USERS: User[] = [
  SEED_ADMIN,
  {
    id: 'ab95e9f0-efa3-4dc7-b414-4d027d0b56f9',
    name: 'Hanzz Wota',
    username: 'Hanzz0508',
    email: 'hanzzwota@gmail.com',
    password: 'Hanzz0508',
    role: 'user',
    danaNumber: '083164982848',
    danaAccountName: 'Lina',
    saldo: 0,
    status: 'active',
    qualityScore: 91,
    trustBadge: '91% • Trusted Seller',
    phone: '083164982848',
    joinedAt: '18/08/2026',
    referralCode: 'CARLOS-HANZZ69',
    passwordChangedAt: 'Belum pernah',
    totalSubmissions: 0,
    acceptedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
  },
  {
    id: 'c0494446-0255-4c04-bbf9-33512ed0fb2b',
    name: 'gystar aguq',
    username: 'gystaraguq',
    email: 'gystaraguq@gmail.com',
    password: 'Password123!',
    role: 'user',
    danaNumber: '085298765432',
    danaAccountName: 'Gystar Aguq',
    saldo: 0,
    status: 'active',
    qualityScore: 89,
    trustBadge: '89% • Good Seller',
    phone: '085298765432',
    joinedAt: '10/08/2026',
    referralCode: 'GYSTAR-01',
    totalSubmissions: 0,
    acceptedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
  },
  {
    id: '61748f2a-ec81-42c9-aa14-40699b731b99',
    name: 'Andra lesmana',
    username: 'andralesmana',
    email: 'andraa.lesmanaa01@gmail.com',
    password: 'Password123!',
    role: 'user',
    danaNumber: '081234567890',
    danaAccountName: 'Andra Lesmana',
    saldo: 0,
    status: 'active',
    qualityScore: 100,
    trustBadge: '100% • Elite Seller',
    phone: '081234567890',
    joinedAt: '05/08/2026',
    referralCode: 'ANDRA-02',
    totalSubmissions: 0,
    acceptedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
  },
  {
    id: '00f0955d-2938-4154-9799-2084315f900c',
    name: 'Ricanwardana',
    username: 'ricanganteng',
    email: 'ricanganteng2@gmail.com',
    password: 'Password123!',
    role: 'user',
    danaNumber: '087812345678',
    danaAccountName: 'Rican Wardana',
    saldo: 0,
    status: 'active',
    qualityScore: 98,
    trustBadge: '98% • Elite Seller',
    phone: '087812345678',
    joinedAt: '01/08/2026',
    referralCode: 'RICAN-03',
    totalSubmissions: 0,
    acceptedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
  },
  {
    id: '4d6ede2d-a32a-4d95-b79f-51313fb744c3',
    name: 'ridho anjay',
    username: 'ridhoanjay',
    email: 'useradj653@gmail.com',
    password: 'Password123!',
    role: 'user',
    danaNumber: '089612349999',
    danaAccountName: 'Ridho Anjay',
    saldo: 0,
    status: 'active',
    qualityScore: 90,
    trustBadge: '90% • Trusted Seller',
    phone: '089612349999',
    joinedAt: '12/08/2026',
    referralCode: 'RIDHO-04',
    totalSubmissions: 0,
    acceptedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
  },
];

const SEED_SETTINGS: PlatformSettings = {
  id: 'set-001',
  namaDashboard: 'Carlos69',
  linkSaluran: 'https://whatsapp.com/channel/0029Vb4F9G1J3RujV8yE6l',
  ratePerAkun: 4500,
  mandatoryPassword: 'sgsg1122',
  infoDashboard: 'Open Senin - Jumat Open Jam 07:00 Close ( Ga nentu ) Estimasi close ( 14:00 - 16:00 ) More info di saluran',
  isStorOpen: true,
  storStatusMessage: 'Storan dibuka! Silakan stor akun Gmail sesuai aturan password sgsg1122.',
  syaratKetentuan: `1. Akun Gmail yang disetor wajib fresh / berumur dengan status aktif.\n2. Gunakan password wajib yang telah ditentukan sistem admin: sgsg1122.\n3. Jangan menyetor akun yang terkena checkpoint (CP) atau membutuhkan verifikasi nomor telepon.\n4. Pembayaran hasil setor diproses langsung ke saldo dan dapat ditarik instan ke DANA.\n5. Akun dengan reputasi (trusted) 0% otomatis diblokir sistem.`,
  rulesHariIni: `Wajib baca: Pastikan akun Gmail yang Anda buat menggunakan password wajib sgsg1122. Akun dengan password berbeda otomatis ditolak sistem verifikasi!`,
};

// Initial Stok Gmail Pool disediakan oleh Admin/Owner
const SEED_EMAIL_STOCKS: AdminEmailStock[] = [
  { id: 'stk-1', email: 'dhmgkamalperdana3899@gmail.com', isUsed: false, createdAt: '2026-08-23 12:00' },
  { id: 'stk-2', email: 'ikmoandrewraksa3596@gmail.com', isUsed: false, createdAt: '2026-08-23 12:00' },
  { id: 'stk-3', email: 'rmigjessicaallen6975@gmail.com', isUsed: false, createdAt: '2026-08-23 12:00' },
  { id: 'stk-4', email: 'haiaikapermana4714@gmail.com', isUsed: false, createdAt: '2026-08-23 12:00' },
  { id: 'stk-5', email: 'gjevhidayahsantoso7243@gmail.com', isUsed: false, createdAt: '2026-08-23 12:00' },
  { id: 'stk-6', email: 'vzkobaguswidodo2091@gmail.com', isUsed: false, createdAt: '2026-08-23 12:00' },
  { id: 'stk-7', email: 'plmqputriananda8821@gmail.com', isUsed: false, createdAt: '2026-08-23 12:00' },
  { id: 'stk-8', email: 'zrtybayupratama5514@gmail.com', isUsed: false, createdAt: '2026-08-23 12:00' },
  { id: 'stk-9', email: 'qxwdratnasari3349@gmail.com', isUsed: false, createdAt: '2026-08-23 12:00' },
  { id: 'stk-10', email: 'mnbvrizkymaulana9912@gmail.com', isUsed: false, createdAt: '2026-08-23 12:00' },
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'INFO PENTING CARLOS69',
    content: 'Untuk yang mau stor silakan request/generate email dari stok admin di menu Stor. Gunakan password wajib sgsg1122!',
    dotsColor: 'rose',
    date: '23/08/2026',
  },
  {
    id: 'ann-2',
    title: 'INFORMASI JADWAL SETORAN',
    content: 'Open Senin - Jumat Jam 07:00 WIB. Minimal penarikan saldo ke DANA adalah Rp 4.000 tanpa potongan biaya admin.',
    dotsColor: 'emerald',
    date: '23/08/2026',
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Mode
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [liveEvent, setLiveEvent] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Persistent States
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    return getSavedStorage(STORAGE_KEY_USERS, 'zero99_all_users_v4') || INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = getSavedStorage(STORAGE_KEY_USER, 'zero99_current_user_v4');
    return saved || INITIAL_USERS[1]; // Default to Hanzz Wota
  });

  const [submissions, setSubmissions] = useState<GmailSubmission[]>(() => {
    return getSavedStorage(STORAGE_KEY_SUBMISSIONS, 'zero99_submissions_v4') || [];
  });

  const [allGmailAccounts, setAllGmailAccounts] = useState<GmailAccountItem[]>(() => {
    return getSavedStorage(STORAGE_KEY_ACCOUNTS, 'zero99_gmail_accounts_v4') || [];
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => {
    return getSavedStorage(STORAGE_KEY_WITHDRAWALS, 'zero99_withdrawals_v4') || [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [adminEmailStocks, setAdminEmailStocks] = useState<AdminEmailStock[]>(() => {
    return getSavedStorage(STORAGE_KEY_EMAIL_STOCK, 'zero99_admin_email_stocks_v4') || SEED_EMAIL_STOCKS;
  });

  const [settings, setSettings] = useState<PlatformSettings>(() => {
    const saved = getSavedStorage(STORAGE_KEY_SETTINGS, 'zero99_settings_v4');
    return saved ? { ...SEED_SETTINGS, ...saved } : SEED_SETTINGS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    return getSavedStorage(STORAGE_KEY_LOGS, 'zero99_activity_logs_v4') || [];
  });

  const [generatedGmails, setGeneratedGmails] = useState<GeneratedGmail[]>(() => {
    return getSavedStorage(STORAGE_KEY_GENERATED, 'zero99_generated_gmails_v4') || [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return getSavedStorage(STORAGE_KEY_NOTIFS, 'zero99_notifications_v4') || [];
  });

  const [announcements] = useState<Announcement[]>(SEED_ANNOUNCEMENTS);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(allGmailAccounts));
  }, [allGmailAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WITHDRAWALS, JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GENERATED, JSON.stringify(generatedGmails));
  }, [generatedGmails]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EMAIL_STOCK, JSON.stringify(adminEmailStocks));
  }, [adminEmailStocks]);

  // Toast Dispatcher (Limited to max 2 items for a clean non-intrusive UI)
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = 't-' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => {
      const filtered = prev.slice(-1); // Keep at most 1 previous toast
      return [...filtered, { id, title, message, type }];
    });
    setLiveEvent(`${title}: ${message}`);
    playNotificationSound(type);

    setTimeout(() => {
      removeToast(id);
    }, 3200);
  }, [removeToast]);

  // Helper notification creator
  const createNotification = (userId: string, title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toLocaleString('id-ID'),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Log Activity
  const logActivity = (action: ActivityLog['action'], description: string, userId?: string, accountId?: string) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      action,
      description,
      userId,
      accountId,
      timestamp: new Date().toLocaleString('id-ID'),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Auth Operations
  const login = (identifier: string, pass: string): { success: boolean; message: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const found = allUsers.find(
      (u) => (u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId) && u.password === pass
    );

    if (!found) {
      return { success: false, message: 'Email/Username atau Kata Sandi salah!' };
    }

    if (found.status === 'blocked') {
      return { success: false, message: 'Akun Anda telah DIBLOKIR oleh sistem karena kualitas setoran (0% Trusted).' };
    }

    setCurrentUser(found);
    if (found.role === 'admin') {
      setIsAdminMode(true);
      setActiveTab('admin');
    } else {
      setIsAdminMode(false);
      setActiveTab('beranda');
    }

    addToast('Login Berhasil', `Selamat datang kembali, ${found.name}!`, 'success');
    return { success: true, message: 'Login berhasil!' };
  };

  const loginWithGoogle = () => {
    // Demo real simulation of Google OAuth
    const googleEmail = 'user.google@gmail.com';
    let user = allUsers.find((u) => u.email.toLowerCase() === googleEmail.toLowerCase());
    
    if (!user) {
      user = {
        id: 'usr-g-' + Date.now(),
        name: 'Google User',
        username: 'googleuser',
        email: googleEmail,
        role: 'user',
        danaNumber: '',
        saldo: 0,
        status: 'active',
        qualityScore: 100,
        trustBadge: '100% • Elite Seller',
        phone: '',
        joinedAt: new Date().toLocaleDateString('id-ID'),
        referralCode: 'GGL-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        totalSubmissions: 0,
        acceptedCount: 0,
        pendingCount: 0,
        rejectedCount: 0,
      };
      setAllUsers((prev) => [...prev, user!]);
    }

    setCurrentUser(user);
    setIsAdminMode(false);
    setActiveTab('beranda');
    addToast('Google Sign-In', `Berhasil masuk dengan akun Google: ${user.email}`, 'success');
  };

  const register = (
    name: string,
    email: string,
    pass: string,
    referralCode?: string
  ): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const exists = allUsers.some((u) => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: 'Email sudah terdaftar. Silakan login!' };
    }

    if (pass.length < 6) {
      return { success: false, message: 'Kata sandi minimal 6 karakter!' };
    }

    // Generate clean username from email
    const username = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');

    const newUser: User = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      name: name.trim(),
      username: username || 'user' + Math.floor(Math.random() * 1000),
      email: cleanEmail,
      password: pass,
      role: 'user',
      danaNumber: '',
      saldo: 0,
      status: 'active',
      qualityScore: 100,
      trustBadge: '100% • New Seller',
      phone: '',
      joinedAt: new Date().toLocaleDateString('id-ID'),
      referralCode: 'ZERO-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      referredBy: referralCode ? referralCode.trim() : undefined,
      passwordChangedAt: 'Belum pernah',
      totalSubmissions: 0,
      acceptedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
    };

    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAdminMode(false);
    setActiveTab('beranda');

    addToast('Pendaftaran Berhasil', `Akun ${newUser.name} berhasil dibuat!`, 'success');
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    } catch {}

    return { success: true, message: 'Registrasi sukses!' };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdminMode(false);
    setActiveTab('beranda');
    addToast('Logout', 'Anda telah keluar dari sesi akun.', 'info');
  };

  const switchUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin') {
        setIsAdminMode(true);
        setActiveTab('admin');
      } else {
        setIsAdminMode(false);
        setActiveTab('beranda');
      }
      addToast('Beralih Akun', `Sekarang login sebagai ${user.name}`, 'info');
    }
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    addToast('Profil Disimpan', 'Data akun berhasil diperbarui.', 'success');
  };

  const saveDanaNumber = (danaNum: string, accountName?: string) => {
    if (!currentUser) return;
    updateUserProfile({
      danaNumber: danaNum.trim(),
      danaAccountName: accountName ? accountName.trim() : currentUser.danaAccountName || currentUser.name,
    });
  };

  const changePassword = (newPass: string) => {
    if (!currentUser) return;
    updateUserProfile({
      password: newPass,
      passwordChangedAt: new Date().toLocaleDateString('id-ID'),
    });
  };

  // User Operation: Submit Bulk Gmail
  const submitBulkGmail = (rawText: string, note?: string): { success: boolean; message: string; count?: number } => {
    if (!currentUser) {
      return { success: false, message: 'Silakan login terlebih dahulu untuk setor akun!' };
    }

    if (!settings.isStorOpen) {
      return { success: false, message: settings.storStatusMessage || 'Penyetoran saat ini sedang DITUTUP oleh Admin.' };
    }

    if (currentUser.status === 'blocked') {
      return { success: false, message: 'Akun Anda telah DIBLOKIR karena reputasi 0%. Penyetoran ditolak.' };
    }

    if (!rawText || !rawText.trim()) {
      return { success: false, message: 'Kotak setoran kosong! Masukkan minimal 1 baris email.' };
    }

    // Split by newlines, carriage returns, or semicolons
    const rawLines = rawText.split(/[\r\n;]+/).map((l) => l.trim()).filter(Boolean);
    const parsedAccounts: GmailAccountItem[] = [];
    const seenEmails = new Set<string>();
    const timestampStr = new Date().toLocaleString('id-ID');
    const defaultPass = settings.mandatoryPassword || 'sgsg1122';

    for (const line of rawLines) {
      // Also split multiple items per line if separated by comma or tabs
      const tokens = line.split(/[,\t]+/).map((t) => t.trim()).filter(Boolean);

      for (const token of tokens) {
        if (!token.includes('@')) continue;

        let email = '';
        let pass = defaultPass;

        if (token.includes('|')) {
          const parts = token.split('|');
          email = parts[0].trim();
          pass = parts[1] ? parts[1].trim() : defaultPass;
        } else if (token.includes(':') && !token.startsWith('http')) {
          const parts = token.split(':');
          email = parts[0].trim();
          pass = parts[1] ? parts[1].trim() : defaultPass;
        } else {
          const spaceParts = token.split(/\s+/);
          if (spaceParts.length >= 2 && spaceParts[0].includes('@')) {
            email = spaceParts[0].trim();
            pass = spaceParts[1].trim();
          } else {
            email = token.trim();
          }
        }

        // Clean email format
        email = email.replace(/[<>'"\s]/g, '').toLowerCase();

        if (email.includes('@') && !seenEmails.has(email)) {
          seenEmails.add(email);
          parsedAccounts.push({
            id: 'acc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
            email,
            password: pass || defaultPass,
            status: 'pending',
            trusted: currentUser.qualityScore || 100,
            price: settings.ratePerAkun,
            userId: currentUser.id,
            userName: currentUser.name,
            storDate: timestampStr,
            isSetoran: true,
          });
        }
      }
    }

    if (parsedAccounts.length === 0) {
      return { success: false, message: 'Format akun tidak valid. Pastikan berisi alamat Gmail yang benar.' };
    }

    const batchId = '#ST-' + Math.floor(100000 + Math.random() * 900000);
    const totalAmount = parsedAccounts.length * settings.ratePerAkun;

    const newSubmission: GmailSubmission = {
      id: 'sub-' + Date.now(),
      batchId,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      accounts: parsedAccounts,
      totalCount: parsedAccounts.length,
      pricePerAccount: settings.ratePerAkun,
      totalAmount,
      status: 'pending',
      notes: note?.trim() || undefined,
      createdAt: timestampStr,
    };

    // Update global and user states
    setSubmissions((prev) => [newSubmission, ...prev]);
    setAllGmailAccounts((prev) => [...parsedAccounts, ...prev]);

    // Mark user's generated emails as deposited if matched
    setGeneratedGmails((prev) =>
      prev.map((g) => {
        const isMatched = parsedAccounts.some((p) => p.email.toLowerCase() === g.email.toLowerCase());
        return isMatched ? { ...g, isDeposited: true } : g;
      })
    );

    // Update current user stats
    const updatedUser: User = {
      ...currentUser,
      totalSubmissions: (currentUser.totalSubmissions || 0) + parsedAccounts.length,
      pendingCount: (currentUser.pendingCount || 0) + parsedAccounts.length,
    };
    setCurrentUser(updatedUser);
    setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

    logActivity('approve', `User ${currentUser.name} menyetor batch ${batchId} (${parsedAccounts.length} akun Gmail)`, currentUser.id);

    addToast(
      'Setoran Terkirim',
      `Berhasil menyetor ${parsedAccounts.length} akun Gmail (${batchId}). Menunggu verifikasi admin.`,
      'success'
    );

    return { success: true, message: 'Setoran berhasil dikirim!', count: parsedAccounts.length };
  };

  // User Operation: Request Withdrawal (DANA Only)
  const requestWithdrawal = (
    amount: number,
    danaNumber: string,
    accountName: string
  ): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Silakan login terlebih dahulu!' };
    }

    if (amount < 4000) {
      return { success: false, message: 'Minimal penarikan saldo adalah Rp 4.000' };
    }

    if (currentUser.saldo < amount) {
      return { success: false, message: `Saldo tidak mencukupi! Saldo Anda saat ini: Rp ${currentUser.saldo.toLocaleString('id-ID')}` };
    }

    if (!danaNumber.trim()) {
      return { success: false, message: 'Nomor DANA wajib diisi!' };
    }

    const txId = 'WD-DANA-' + Math.floor(100000 + Math.random() * 900000);
    const newWd: WithdrawalRequest = {
      id: 'wd-' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      amount,
      fee: 0,
      netAmount: amount,
      method: 'DANA',
      accountNumber: danaNumber.trim(),
      accountName: accountName.trim() || currentUser.name,
      status: 'pending',
      txId,
      createdAt: new Date().toLocaleString('id-ID'),
    };

    // Deduct user balance immediately
    const updatedUser: User = {
      ...currentUser,
      saldo: currentUser.saldo - amount,
      danaNumber: danaNumber.trim(),
      danaAccountName: accountName.trim() || currentUser.name,
    };
    setCurrentUser(updatedUser);
    setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setWithdrawals((prev) => [newWd, ...prev]);

    logActivity('withdrawal', `Permintaan penarikan DANA Rp ${amount.toLocaleString('id-ID')} (${txId})`, currentUser.id);

    addToast(
      'Permintaan DANA Diterima',
      `Penarikan Rp ${amount.toLocaleString('id-ID')} ke ${danaNumber} sedang diproses admin.`,
      'info'
    );

    return { success: true, message: 'Penarikan berhasil diajukan!' };
  };

  // User: Generate Email Pool dari Stok Admin
  const generateNewGmails = (count: number): { success: boolean; message: string; count: number } => {
    if (!currentUser) {
      return { success: false, message: 'Silakan login terlebih dahulu!', count: 0 };
    }

    if (count <= 0) {
      return { success: false, message: 'Masukkan jumlah akun yang valid (minimal 1)!', count: 0 };
    }

    const firstNames = ['budi', 'rizky', 'aditya', 'dimas', 'hendra', 'bayu', 'fajar', 'rendy', 'deni', 'dika', 'angga', 'wahyu', 'ilham', 'agus', 'ari', 'andre', 'bagas', 'gilang', 'arif', 'eko', 'yoga', 'yudi', 'indra', 'surya', 'donny', 'kevin', 'reza', 'rio', 'alif', 'rama'];
    const lastNames = ['saputra', 'pratama', 'santoso', 'wijaya', 'kurniawan', 'nugroho', 'hidayat', 'firmansyah', 'setiawan', 'kusuma', 'gunawan', 'lestari', 'wibowo', 'susanto', 'permana', 'ramadhan', 'putra', 'wardhana', 'pangestu', 'utama'];

    // Ambil email dari stok admin yang belum terpakai
    const unusedStocks = adminEmailStocks.filter((stk) => !stk.isUsed);
    const nowTime = new Date().toLocaleString('id-ID');
    let selectedStocks: AdminEmailStock[] = [];

    if (unusedStocks.length >= count) {
      selectedStocks = unusedStocks.slice(0, count);
    } else {
      selectedStocks = [...unusedStocks];
      const needed = count - unusedStocks.length;
      for (let i = 0; i < needed; i++) {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        const num = Math.floor(100 + Math.random() * 9000);
        const sep = Math.random() > 0.5 ? '.' : '';
        const generatedEmail = `${fn}${sep}${ln}${num}@gmail.com`.toLowerCase();

        const autoStock: AdminEmailStock = {
          id: 'stk-auto-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          email: generatedEmail,
          isUsed: true,
          createdAt: nowTime,
          usedByUserId: currentUser.id,
          usedByUserName: currentUser.name,
          usedAt: nowTime,
        };
        selectedStocks.push(autoStock);
      }
    }

    const selectedIds = selectedStocks.map((s) => s.id);

    // Tandai stok admin sebagai sudah terpakai
    setAdminEmailStocks((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const updatedExisting = prev.map((s) => {
        if (selectedIds.includes(s.id)) {
          return {
            ...s,
            isUsed: true,
            usedByUserId: currentUser.id,
            usedByUserName: currentUser.name,
            usedAt: nowTime,
          };
        }
        return s;
      });
      const newCreated = selectedStocks.filter((s) => !existingIds.has(s.id));
      return [...newCreated, ...updatedExisting];
    });

    // Tambahkan ke generated gmails milik user
    const newGmails: GeneratedGmail[] = selectedStocks.map((s) => ({
      id: 'gen-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      email: s.email,
      isDeposited: false,
      createdAt: nowTime,
      userId: currentUser.id,
    }));

    setGeneratedGmails((prev) => [...newGmails, ...prev]);

    addToast(
      'Email Berhasil Digenerate',
      `Berhasil membuat ${newGmails.length} email! Silakan buat akun dengan password wajib ${settings.mandatoryPassword}.`,
      'success'
    );

    return { 
      success: true, 
      message: `Berhasil mendapatkan ${newGmails.length} email.`, 
      count: newGmails.length 
    };
  };

  const deleteGeneratedGmail = (id: string) => {
    setGeneratedGmails((prev) => prev.filter((g) => g.id !== id));
  };

  const clearMyGeneratedGmails = () => {
    if (!currentUser) return;
    setGeneratedGmails((prev) => prev.filter((g) => g.userId && g.userId !== currentUser.id));
    addToast('Daftar Dibersihkan', 'Daftar email yang telah digenerate berhasil dihapus.', 'info');
  };

  // Admin Operations: Manage Stock Pool
  const adminAddEmailStock = (rawEmails: string): { success: boolean; count: number; message: string } => {
    const lines = rawEmails.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && l.includes('@'));
    if (lines.length === 0) {
      return { success: false, count: 0, message: 'Tidak ada email valid yang ditemukan!' };
    }

    const timestamp = new Date().toLocaleString('id-ID');
    const newItems: AdminEmailStock[] = lines.map((email) => ({
      id: 'stk-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      email,
      isUsed: false,
      createdAt: timestamp,
    }));

    setAdminEmailStocks((prev) => [...newItems, ...prev]);
    logActivity('stock_add', `Admin menambah ${newItems.length} stok email untuk generate user`);

    addToast('Stok Email Ditambahkan', `Berhasil menambahkan ${newItems.length} email ke pool stok generate user.`, 'success');
    return { success: true, count: newItems.length, message: `Berhasil menambah ${newItems.length} stok email!` };
  };

  const adminDeleteEmailStock = (id: string) => {
    setAdminEmailStocks((prev) => prev.filter((s) => s.id !== id));
    addToast('Stok Dihapus', 'Item stok berhasil dihapus dari pool.', 'info');
  };

  const adminClearUnusedStock = () => {
    setAdminEmailStocks((prev) => prev.filter((s) => s.isUsed));
    addToast('Stok Dibersihkan', 'Seluruh stok email yang belum terpakai telah dibersihkan.', 'info');
  };

  // Admin Batch Actions
  const adminApproveBatch = (batchId: string) => {
    const sub = submissions.find((s) => s.id === batchId);
    if (!sub || sub.status !== 'pending') return;

    // Approve submission
    setSubmissions((prev) =>
      prev.map((s) => (s.id === batchId ? { ...s, status: 'approved', processedAt: new Date().toLocaleString('id-ID') } : s))
    );

    // Update account statuses
    const subAccountIds = sub.accounts.map((a) => a.id);
    setAllGmailAccounts((prev) =>
      prev.map((a) => (subAccountIds.includes(a.id) ? { ...a, status: 'accepted', verifikasiDate: new Date().toLocaleString('id-ID') } : a))
    );

    // Credit user's balance
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === sub.userId) {
          const newSaldo = u.saldo + sub.totalAmount;
          const newAccepted = (u.acceptedCount || 0) + sub.totalCount;
          const newPending = Math.max(0, (u.pendingCount || 0) - sub.totalCount);
          const totalValid = newAccepted + (u.rejectedCount || 0);
          const newScore = totalValid > 0 ? Math.round((newAccepted / totalValid) * 100) : 100;
          return {
            ...u,
            saldo: newSaldo,
            acceptedCount: newAccepted,
            pendingCount: newPending,
            qualityScore: newScore,
            trustBadge: `${newScore}% • ${newScore >= 95 ? 'Elite Seller' : newScore >= 80 ? 'Good Seller' : 'Seller'}`,
          };
        }
        return u;
      })
    );

    // If current logged-in user is the seller, update currentUser
    if (currentUser && currentUser.id === sub.userId) {
      const newSaldo = currentUser.saldo + sub.totalAmount;
      const newAccepted = (currentUser.acceptedCount || 0) + sub.totalCount;
      const newPending = Math.max(0, (currentUser.pendingCount || 0) - sub.totalCount);
      const totalValid = newAccepted + (currentUser.rejectedCount || 0);
      const newScore = totalValid > 0 ? Math.round((newAccepted / totalValid) * 100) : 100;
      setCurrentUser({
        ...currentUser,
        saldo: newSaldo,
        acceptedCount: newAccepted,
        pendingCount: newPending,
        qualityScore: newScore,
        trustBadge: `${newScore}% • ${newScore >= 95 ? 'Elite Seller' : newScore >= 80 ? 'Good Seller' : 'Seller'}`,
      });
    }

    createNotification(
      sub.userId,
      'Setoran Diterima! (+Rp ' + sub.totalAmount.toLocaleString('id-ID') + ')',
      `Batch setoran ${sub.batchId} (${sub.totalCount} akun) telah di-ACC oleh Admin. Saldo telah ditambahkan ke akun Anda.`,
      'success'
    );

    logActivity('approve', `Admin menyetujui batch ${sub.batchId} (+Rp ${sub.totalAmount.toLocaleString('id-ID')})`, sub.userId);
    addToast('Batch Di-ACC', `Batch ${sub.batchId} (${sub.totalCount} akun) berhasil disetujui!`, 'success');
  };

  const adminRejectBatch = (batchId: string, reason: string) => {
    const sub = submissions.find((s) => s.id === batchId);
    if (!sub || sub.status !== 'pending') return;

    setSubmissions((prev) =>
      prev.map((s) => (s.id === batchId ? { ...s, status: 'rejected', rejectReason: reason, processedAt: new Date().toLocaleString('id-ID') } : s))
    );

    const subAccountIds = sub.accounts.map((a) => a.id);
    setAllGmailAccounts((prev) =>
      prev.map((a) => (subAccountIds.includes(a.id) ? { ...a, status: 'rejected', rejectReason: reason, verifikasiDate: new Date().toLocaleString('id-ID') } : a))
    );

    // Update user stats
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === sub.userId) {
          const newRejected = (u.rejectedCount || 0) + sub.totalCount;
          const newPending = Math.max(0, (u.pendingCount || 0) - sub.totalCount);
          const totalValid = (u.acceptedCount || 0) + newRejected;
          const newScore = totalValid > 0 ? Math.round(((u.acceptedCount || 0) / totalValid) * 100) : 0;
          const isBlocked = newScore === 0 && totalValid >= 5;
          return {
            ...u,
            rejectedCount: newRejected,
            pendingCount: newPending,
            qualityScore: newScore,
            status: isBlocked ? 'blocked' : u.status,
            trustBadge: isBlocked ? '0% • BANNED' : `${newScore}% • Seller`,
          };
        }
        return u;
      })
    );

    if (currentUser && currentUser.id === sub.userId) {
      const newRejected = (currentUser.rejectedCount || 0) + sub.totalCount;
      const newPending = Math.max(0, (currentUser.pendingCount || 0) - sub.totalCount);
      const totalValid = (currentUser.acceptedCount || 0) + newRejected;
      const newScore = totalValid > 0 ? Math.round(((currentUser.acceptedCount || 0) / totalValid) * 100) : 0;
      const isBlocked = newScore === 0 && totalValid >= 5;
      setCurrentUser({
        ...currentUser,
        rejectedCount: newRejected,
        pendingCount: newPending,
        qualityScore: newScore,
        status: isBlocked ? 'blocked' : currentUser.status,
        trustBadge: isBlocked ? '0% • BANNED' : `${newScore}% • Seller`,
      });
    }

    createNotification(
      sub.userId,
      'Setoran Ditolak',
      `Batch setoran ${sub.batchId} (${sub.totalCount} akun) ditolak oleh Admin. Alasan: ${reason}`,
      'error'
    );

    logActivity('reject', `Admin menolak batch ${sub.batchId}. Alasan: ${reason}`, sub.userId);
    addToast('Batch Ditolak', `Batch ${sub.batchId} ditolak. Alasan: ${reason}`, 'error');
  };

  const adminApproveAllPending = () => {
    const pendingSubs = submissions.filter((s) => s.status === 'pending');
    if (pendingSubs.length === 0) {
      addToast('Tidak Ada Pending', 'Tidak ada setoran yang menunggu verifikasi saat ini.', 'info');
      return;
    }

    pendingSubs.forEach((sub) => {
      adminApproveBatch(sub.id);
    });

    addToast('ACC Semua Akun Selesai', `Seluruh ${pendingSubs.length} batch setoran berhasil di-ACC!`, 'success');
  };

  // ⚡ UPDATE ALL: Auto-Verifikasi Status Gmail (Wajib Sesuai Hasil Generate & Password)
  const adminUpdateAllSetoran = async (
    mode: 'instant' | 'delay' = 'instant',
    delaySec: number = 5
  ): Promise<AutoCheckResult> => {
    // If delay mode is requested, simulate processing delay
    if (mode === 'delay' && delaySec > 0) {
      await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));
    }

    const timestamp = new Date().toLocaleString('id-ID');
    const pendingSubs = submissions.filter((s) => s.status === 'pending');

    const result: AutoCheckResult = {
      totalProcessed: 0,
      totalApproved: 0,
      totalRejected: 0,
      totalSaldoAdded: 0,
      mode,
      delaySeconds: delaySec,
      details: [],
    };

    if (pendingSubs.length === 0 && allGmailAccounts.filter((a) => a.status === 'pending').length === 0) {
      addToast('Update All Selesai', 'Tidak ada akun atau setoran pending yang perlu diverifikasi.', 'info');
      return result;
    }

    // Map of user ID to total accepted counts & amounts in this run
    const userCredits: Record<string, { acceptedCount: number; rejectedCount: number; amount: number; userName: string }> = {};

    // Get all generated emails and admin stock records
    const allGeneratedList = generatedGmails;
    const allStockList = adminEmailStocks;

    // Track updated submissions and accounts
    const updatedAccountIds = new Set<string>();
    const updatedAccountsMap: Record<string, GmailAccountItem> = {};

    const updatedSubmissions = submissions.map((sub) => {
      if (sub.status !== 'pending') return sub;

      const subUserId = sub.userId;
      if (!userCredits[subUserId]) {
        userCredits[subUserId] = { acceptedCount: 0, rejectedCount: 0, amount: 0, userName: sub.userName };
      }

      let subAccepted = 0;
      let subRejected = 0;

      const newAccounts = sub.accounts.map((acc) => {
        result.totalProcessed += 1;
        updatedAccountIds.add(acc.id);

        const cleanEmail = acc.email.trim().toLowerCase();

        // 1. RULE VALIDASI: Harus Sesuai Hasil Generate Stok Admin
        const isFromGenerated = allGeneratedList.some(
          (g) => g.email.trim().toLowerCase() === cleanEmail && (!g.userId || g.userId === subUserId)
        );
        const isFromStockUsed = allStockList.some(
          (s) => s.email.trim().toLowerCase() === cleanEmail && s.usedByUserId === subUserId
        );
        const isValidGenerated = isFromGenerated || isFromStockUsed;

        // 2. RULE VALIDASI: Password Wajib Sesuai
        const expectedPass = (settings.mandatoryPassword || 'sgsg1122').trim();
        const isPassValid = !acc.password || acc.password.trim() === expectedPass;

        if (!isValidGenerated) {
          // AUTO REJECT: Email tidak sesuai dengan hasil generate stok admin
          subRejected += 1;
          result.totalRejected += 1;
          userCredits[subUserId].rejectedCount += 1;

          const updatedAcc: GmailAccountItem = {
            ...acc,
            status: 'rejected',
            rejectReason: 'Ditolak: Email tidak sesuai dengan hasil generate stok admin!',
            verifikasiDate: timestamp,
          };
          updatedAccountsMap[acc.id] = updatedAcc;

          result.details.push({
            email: acc.email,
            userName: sub.userName,
            userId: subUserId,
            status: 'rejected',
            reason: 'Email bukan dari stok generate admin!',
            amountAdded: 0,
          });

          return updatedAcc;
        } else if (!isPassValid) {
          // AUTO REJECT: Password tidak sesuai
          subRejected += 1;
          result.totalRejected += 1;
          userCredits[subUserId].rejectedCount += 1;

          const updatedAcc: GmailAccountItem = {
            ...acc,
            status: 'rejected',
            rejectReason: `Ditolak: Password tidak sesuai (${expectedPass})`,
            verifikasiDate: timestamp,
          };
          updatedAccountsMap[acc.id] = updatedAcc;

          result.details.push({
            email: acc.email,
            userName: sub.userName,
            userId: subUserId,
            status: 'rejected',
            reason: `Password salah (wajib ${expectedPass})`,
            amountAdded: 0,
          });

          return updatedAcc;
        } else {
          // ACC (DISETUJUI): Lolos verifikasi
          subAccepted += 1;
          result.totalApproved += 1;
          const rate = settings.ratePerAkun || 4500;
          result.totalSaldoAdded += rate;
          userCredits[subUserId].acceptedCount += 1;
          userCredits[subUserId].amount += rate;

          const updatedAcc: GmailAccountItem = {
            ...acc,
            status: 'accepted',
            verifikasiDate: timestamp,
            price: rate,
          };
          updatedAccountsMap[acc.id] = updatedAcc;

          result.details.push({
            email: acc.email,
            userName: sub.userName,
            userId: subUserId,
            status: 'accepted',
            amountAdded: rate,
          });

          return updatedAcc;
        }
      });

      let newStatus: GmailSubmission['status'] = 'approved';
      let rejectReason = '';
      if (subAccepted === 0 && subRejected > 0) {
        newStatus = 'rejected';
        rejectReason = 'Semua akun ditolak (tidak sesuai hasil generate / password salah)';
      } else if (subAccepted > 0 && subRejected > 0) {
        newStatus = 'partially_approved';
      }

      return {
        ...sub,
        status: newStatus,
        accounts: newAccounts,
        rejectReason: rejectReason || sub.rejectReason,
        processedAt: timestamp,
        totalAmount: subAccepted * (settings.ratePerAkun || 4500),
      };
    });

    // Update global submissions
    setSubmissions(updatedSubmissions);

    // Update global allGmailAccounts
    setAllGmailAccounts((prev) =>
      prev.map((acc) => (updatedAccountsMap[acc.id] ? updatedAccountsMap[acc.id] : acc))
    );

    // Credit all users' saldo & quality score
    setAllUsers((prev) =>
      prev.map((u) => {
        const cred = userCredits[u.id];
        if (!cred) return u;

        const newSaldo = u.saldo + cred.amount;
        const newAccepted = (u.acceptedCount || 0) + cred.acceptedCount;
        const newRejected = (u.rejectedCount || 0) + cred.rejectedCount;
        const newPending = Math.max(0, (u.pendingCount || 0) - (cred.acceptedCount + cred.rejectedCount));
        const totalValid = newAccepted + newRejected;
        const newScore = totalValid > 0 ? Math.round((newAccepted / totalValid) * 100) : 100;
        const isBlocked = newScore === 0 && totalValid >= 5;

        return {
          ...u,
          saldo: newSaldo,
          acceptedCount: newAccepted,
          rejectedCount: newRejected,
          pendingCount: newPending,
          qualityScore: newScore,
          status: isBlocked ? 'blocked' : u.status,
          trustBadge: isBlocked ? '0% • BANNED' : `${newScore}% • ${newScore >= 95 ? 'Elite Seller' : newScore >= 80 ? 'Good Seller' : 'Seller'}`,
        };
      })
    );

    // Update currentUser if affected
    if (currentUser && userCredits[currentUser.id]) {
      const cred = userCredits[currentUser.id];
      const newSaldo = currentUser.saldo + cred.amount;
      const newAccepted = (currentUser.acceptedCount || 0) + cred.acceptedCount;
      const newRejected = (currentUser.rejectedCount || 0) + cred.rejectedCount;
      const newPending = Math.max(0, (currentUser.pendingCount || 0) - (cred.acceptedCount + cred.rejectedCount));
      const totalValid = newAccepted + newRejected;
      const newScore = totalValid > 0 ? Math.round((newAccepted / totalValid) * 100) : 100;
      const isBlocked = newScore === 0 && totalValid >= 5;

      setCurrentUser({
        ...currentUser,
        saldo: newSaldo,
        acceptedCount: newAccepted,
        rejectedCount: newRejected,
        pendingCount: newPending,
        qualityScore: newScore,
        status: isBlocked ? 'blocked' : currentUser.status,
        trustBadge: isBlocked ? '0% • BANNED' : `${newScore}% • ${newScore >= 95 ? 'Elite Seller' : newScore >= 80 ? 'Good Seller' : 'Seller'}`,
      });
    }

    // Send notifications to each user
    Object.entries(userCredits).forEach(([userId, cred]) => {
      if (cred.acceptedCount > 0) {
        createNotification(
          userId,
          `Setoran Disetujui! (+Rp ${cred.amount.toLocaleString('id-ID')})`,
          `Sebanyak ${cred.acceptedCount} akun Gmail Anda telah disetujui dan saldo Rp ${cred.amount.toLocaleString('id-ID')} telah ditambahkan ke menu saldo.${
            cred.rejectedCount > 0 ? ` (${cred.rejectedCount} akun ditolak karena tidak sesuai hasil generate/password).` : ''
          }`,
          'success'
        );
      } else if (cred.rejectedCount > 0) {
        createNotification(
          userId,
          `Setoran Ditolak (${cred.rejectedCount} Akun)`,
          `Akun yang disetor ditolak otomatis karena tidak sesuai dengan email hasil generate dari stok admin atau password salah.`,
          'error'
        );
      }
    });

    logActivity(
      'approve',
      `Admin menjalankan Update All (${result.totalApproved} Disetujui, ${result.totalRejected} Ditolak, Total Saldo +Rp ${result.totalSaldoAdded.toLocaleString('id-ID')}) [Mode: ${mode.toUpperCase()}]`
    );

    addToast(
      'Update All Status Selesai',
      `${result.totalApproved} Disetujui (+Rp ${result.totalSaldoAdded.toLocaleString('id-ID')}), ${result.totalRejected} Ditolak. Saldo otomatis masuk ke menu saldo user!`,
      result.totalApproved > 0 ? 'success' : 'warning'
    );

    return result;
  };

  // 💰 TAMBAH ALL SALDO: Eksekusi penambahan saldo untuk semua akun yang disetujui (Instant / Delay)
  const adminAddAllPendingSaldo = async (
    mode: 'instant' | 'delay' = 'instant',
    delaySec: number = 5
  ): Promise<{ totalUsers: number; totalSaldo: number; totalAccounts: number }> => {
    if (mode === 'delay' && delaySec > 0) {
      await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));
    }

    // First auto-verify if there are pending ones, or add saldo directly
    const checkRes = await adminUpdateAllSetoran(mode, 0);

    return {
      totalUsers: Object.keys(checkRes.details.reduce((acc, curr) => ({ ...acc, [curr.userId]: true }), {})).length,
      totalSaldo: checkRes.totalSaldoAdded,
      totalAccounts: checkRes.totalApproved,
    };
  };

  // ⚡ COMMIT STAGED SETORAN: Terapkan perubahan akun yang sudah di-ACC/Tolak di menu ke user & berikan saldo
  const adminCommitStagedSetoran = async (
    stagedDecisions: Record<string, { status: 'accepted' | 'rejected'; reason?: string }>,
    mode: 'instant' | 'delay' = 'instant',
    delaySec: number = 5
  ): Promise<AutoCheckResult> => {
    const stagedKeys = Object.keys(stagedDecisions);
    if (stagedKeys.length === 0) {
      // Fallback to update all if no manual staging was selected
      return adminUpdateAllSetoran(mode, delaySec);
    }

    if (mode === 'delay' && delaySec > 0) {
      await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));
    }

    const timestamp = new Date().toLocaleString('id-ID');
    const result: AutoCheckResult = {
      totalProcessed: stagedKeys.length,
      totalApproved: 0,
      totalRejected: 0,
      totalSaldoAdded: 0,
      mode,
      delaySeconds: delaySec,
      details: [],
    };

    const userCredits: Record<string, { acceptedCount: number; rejectedCount: number; amount: number; userName: string }> = {};
    const updatedAccountIds = new Set<string>(stagedKeys);
    const updatedAccountsMap: Record<string, GmailAccountItem> = {};

    // Process all accounts based on staged decisions
    const updatedSubmissions = submissions.map((sub) => {
      let hasChangeInSub = false;
      const newAccounts = sub.accounts.map((acc) => {
        if (!stagedDecisions[acc.id]) return acc;
        hasChangeInSub = true;

        const decision = stagedDecisions[acc.id];
        const subUserId = sub.userId;
        if (!userCredits[subUserId]) {
          userCredits[subUserId] = { acceptedCount: 0, rejectedCount: 0, amount: 0, userName: sub.userName };
        }

        if (decision.status === 'accepted') {
          result.totalApproved += 1;
          const rate = acc.price || settings.ratePerAkun || 4500;
          result.totalSaldoAdded += rate;
          userCredits[subUserId].acceptedCount += 1;
          userCredits[subUserId].amount += rate;

          const updatedAcc: GmailAccountItem = {
            ...acc,
            status: 'accepted',
            verifikasiDate: timestamp,
            price: rate,
          };
          updatedAccountsMap[acc.id] = updatedAcc;
          result.details.push({
            email: acc.email,
            userName: sub.userName,
            userId: subUserId,
            status: 'accepted',
            amountAdded: rate,
          });
          return updatedAcc;
        } else {
          result.totalRejected += 1;
          userCredits[subUserId].rejectedCount += 1;
          const reason = decision.reason || 'Ditolak oleh admin';

          const updatedAcc: GmailAccountItem = {
            ...acc,
            status: 'rejected',
            rejectReason: reason,
            verifikasiDate: timestamp,
          };
          updatedAccountsMap[acc.id] = updatedAcc;
          result.details.push({
            email: acc.email,
            userName: sub.userName,
            userId: subUserId,
            status: 'rejected',
            reason,
            amountAdded: 0,
          });
          return updatedAcc;
        }
      });

      if (!hasChangeInSub) return sub;

      const totalAccCount = newAccounts.length;
      const acceptedCount = newAccounts.filter((a) => a.status === 'accepted').length;
      const rejectedCount = newAccounts.filter((a) => a.status === 'rejected').length;
      const pendingCount = newAccounts.filter((a) => a.status === 'pending').length;

      let subStatus = sub.status;
      let rejectReason = sub.rejectReason;

      if (pendingCount === 0) {
        if (acceptedCount === totalAccCount) {
          subStatus = 'approved';
        } else if (rejectedCount === totalAccCount) {
          subStatus = 'rejected';
          rejectReason = 'Semua akun ditolak oleh Admin';
        } else if (acceptedCount > 0) {
          subStatus = 'partially_approved';
        }
      } else if (acceptedCount > 0 || rejectedCount > 0) {
        subStatus = 'partially_approved';
      }

      return {
        ...sub,
        status: subStatus,
        accounts: newAccounts,
        rejectReason,
        processedAt: timestamp,
        totalAmount: acceptedCount * (settings.ratePerAkun || 4500),
      };
    });

    setSubmissions(updatedSubmissions);

    // Update global accounts
    setAllGmailAccounts((prev) =>
      prev.map((acc) => (updatedAccountsMap[acc.id] ? updatedAccountsMap[acc.id] : acc))
    );

    // Update all users' balance & quality stats
    setAllUsers((prev) =>
      prev.map((u) => {
        const cred = userCredits[u.id];
        if (!cred) return u;

        const newSaldo = u.saldo + cred.amount;
        const newAccepted = (u.acceptedCount || 0) + cred.acceptedCount;
        const newRejected = (u.rejectedCount || 0) + cred.rejectedCount;
        const newPending = Math.max(0, (u.pendingCount || 0) - (cred.acceptedCount + cred.rejectedCount));
        const totalValid = newAccepted + newRejected;
        const newScore = totalValid > 0 ? Math.round((newAccepted / totalValid) * 100) : 100;
        const isBlocked = newScore === 0 && totalValid >= 5;

        return {
          ...u,
          saldo: newSaldo,
          acceptedCount: newAccepted,
          rejectedCount: newRejected,
          pendingCount: newPending,
          qualityScore: newScore,
          status: isBlocked ? 'blocked' : u.status,
          trustBadge: isBlocked ? '0% • BANNED' : `${newScore}% • ${newScore >= 95 ? 'Elite Seller' : newScore >= 80 ? 'Good Seller' : 'Seller'}`,
        };
      })
    );

    // Update currentUser if affected
    if (currentUser && userCredits[currentUser.id]) {
      const cred = userCredits[currentUser.id];
      const newSaldo = currentUser.saldo + cred.amount;
      const newAccepted = (currentUser.acceptedCount || 0) + cred.acceptedCount;
      const newRejected = (currentUser.rejectedCount || 0) + cred.rejectedCount;
      const newPending = Math.max(0, (currentUser.pendingCount || 0) - (cred.acceptedCount + cred.rejectedCount));
      const totalValid = newAccepted + newRejected;
      const newScore = totalValid > 0 ? Math.round((newAccepted / totalValid) * 100) : 100;
      const isBlocked = newScore === 0 && totalValid >= 5;

      setCurrentUser({
        ...currentUser,
        saldo: newSaldo,
        acceptedCount: newAccepted,
        rejectedCount: newRejected,
        pendingCount: newPending,
        qualityScore: newScore,
        status: isBlocked ? 'blocked' : currentUser.status,
        trustBadge: isBlocked ? '0% • BANNED' : `${newScore}% • ${newScore >= 95 ? 'Elite Seller' : newScore >= 80 ? 'Good Seller' : 'Seller'}`,
      });
    }

    // Send notifications to affected users
    Object.entries(userCredits).forEach(([userId, cred]) => {
      if (cred.acceptedCount > 0) {
        createNotification(
          userId,
          `Setoran Di-ACC! (+Rp ${cred.amount.toLocaleString('id-ID')})`,
          `Sebanyak ${cred.acceptedCount} akun Gmail Anda telah disetujui Admin dan saldo Rp ${cred.amount.toLocaleString('id-ID')} telah ditambahkan ke akun Anda.${
            cred.rejectedCount > 0 ? ` (${cred.rejectedCount} akun ditolak).` : ''
          }`,
          'success'
        );
      } else if (cred.rejectedCount > 0) {
        createNotification(
          userId,
          `Setoran Ditolak (${cred.rejectedCount} Akun)`,
          `Sebanyak ${cred.rejectedCount} akun Gmail yang Anda setor telah ditolak oleh Admin.`,
          'error'
        );
      }
    });

    logActivity(
      'approve',
      `Admin menerapkan Update All (${result.totalApproved} Disetujui, ${result.totalRejected} Ditolak, Saldo +Rp ${result.totalSaldoAdded.toLocaleString('id-ID')}) [Mode: ${mode.toUpperCase()}]`
    );

    addToast(
      'Update All Berhasil Diterapkan!',
      `${result.totalApproved} Akun Disetujui (+Rp ${result.totalSaldoAdded.toLocaleString('id-ID')}), ${result.totalRejected} Ditolak. Saldo resmi masuk ke akun user!`,
      result.totalApproved > 0 ? 'success' : 'info'
    );

    return result;
  };

  const adminApproveSingleAccount = (accountId: string) => {
    const acc = allGmailAccounts.find((a) => a.id === accountId);
    if (!acc) return;

    setAllGmailAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, status: 'accepted', verifikasiDate: new Date().toLocaleString('id-ID') } : a))
    );

    if (acc.userId) {
      setAllUsers((prev) =>
        prev.map((u) => (u.id === acc.userId ? { ...u, saldo: u.saldo + acc.price, acceptedCount: (u.acceptedCount || 0) + 1 } : u))
      );
    }
    addToast('Akun Diterima', `Akun ${acc.email} berhasil disetujui!`, 'success');
  };

  const adminRejectSingleAccount = (accountId: string, reason: string) => {
    const acc = allGmailAccounts.find((a) => a.id === accountId);
    if (!acc) return;

    setAllGmailAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, status: 'rejected', rejectReason: reason, verifikasiDate: new Date().toLocaleString('id-ID') } : a))
    );
    addToast('Akun Ditolak', `Akun ${acc.email} ditolak (${reason}).`, 'error');
  };

  const adminBlockUser = (userId: string, reason: string) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'blocked', blockedReason: reason, qualityScore: 0, trustBadge: '0% • BANNED' } : u))
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, status: 'blocked', blockedReason: reason, qualityScore: 0, trustBadge: '0% • BANNED' });
    }
    logActivity('manual_block', `Admin memblokir user ${userId}. Alasan: ${reason}`, userId);
    addToast('User Diblokir', `User ID ${userId} berhasil diblokir.`, 'warning');
  };

  const adminUnblockUser = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'active', qualityScore: 80, trustBadge: '80% • Trusted Seller' } : u))
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, status: 'active', qualityScore: 80, trustBadge: '80% • Trusted Seller' });
    }
    addToast('User Diaktifkan', `User ID ${userId} telah diaktifkan kembali.`, 'success');
  };

  const adminProcessWithdrawal = (withdrawalId: string, status: 'success' | 'rejected', reason?: string) => {
    const wd = withdrawals.find((w) => w.id === withdrawalId);
    if (!wd) return;

    const completedAt = new Date().toLocaleString('id-ID');

    if (status === 'success') {
      const refNum = 'DANA-TRF-' + Math.floor(10000000 + Math.random() * 90000000);
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === withdrawalId ? { ...w, status: 'success', completedAt, providerInfo: `Sukses kirim ke ${w.accountNumber} (Ref: ${refNum})` } : w))
      );

      createNotification(
        wd.userId,
        'Penarikan DANA Sukses! (Rp ' + wd.amount.toLocaleString('id-ID') + ')',
        `Dana Rp ${wd.amount.toLocaleString('id-ID')} telah sukses dikirimkan ke nomor DANA ${wd.accountNumber} (a/n ${wd.accountName}).`,
        'success'
      );

      addToast('Penarikan Berhasil Disetujui', `Dana Rp ${wd.amount.toLocaleString('id-ID')} sukses terkirim ke ${wd.accountNumber}`, 'success');
    } else {
      // Refund user balance
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === withdrawalId ? { ...w, status: 'rejected', rejectReason: reason || 'Ditolak oleh admin', completedAt } : w))
      );

      setAllUsers((prev) =>
        prev.map((u) => (u.id === wd.userId ? { ...u, saldo: u.saldo + wd.amount } : u))
      );

      if (currentUser && currentUser.id === wd.userId) {
        setCurrentUser({ ...currentUser, saldo: currentUser.saldo + wd.amount });
      }

      createNotification(
        wd.userId,
        'Penarikan DANA Ditolak (Saldo Dikembalikan)',
        `Penarikan Rp ${wd.amount.toLocaleString('id-ID')} ke ${wd.accountNumber} ditolak. Alasan: ${reason || 'Data tidak sesuai'}. Saldo telah dikembalikan.`,
        'error'
      );

      addToast('Penarikan Ditolak', `Penarikan DANA ditolak. Saldo Rp ${wd.amount.toLocaleString('id-ID')} dikembalikan ke akun user.`, 'error');
    }
  };

  const adminUpdateSettings = (newSettings: Partial<PlatformSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    logActivity('settings_update', 'Admin memperbarui pengaturan dashboard & rate');
    addToast('Pengaturan Disimpan', 'Pengaturan berhasil diperbarui secara real-time!', 'success');
  };

  const adminDeleteUser = (userId: string) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    addToast('User Dihapus', `User ${userId} berhasil dihapus dari database.`, 'info');
  };

  const adminResetAllDatabase = () => {
    // Reset all data to 0
    const resetUsers = allUsers.map((u) => ({
      ...u,
      saldo: 0,
      totalSubmissions: 0,
      acceptedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
      qualityScore: u.role === 'admin' ? 100 : 90,
      trustBadge: u.role === 'admin' ? 'Super Administrator' : '90% • Trusted Seller',
    }));

    setAllUsers(resetUsers);
    if (currentUser) {
      const resetCurrent = resetUsers.find((u) => u.id === currentUser.id) || resetUsers[0];
      setCurrentUser(resetCurrent);
    }
    setSubmissions([]);
    setAllGmailAccounts([]);
    setWithdrawals([]);
    setTransactions([]);
    setGeneratedGmails([]);
    setActivityLogs([]);

    localStorage.removeItem(STORAGE_KEY_SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEY_ACCOUNTS);
    localStorage.removeItem(STORAGE_KEY_WITHDRAWALS);
    localStorage.removeItem(STORAGE_KEY_LOGS);
    localStorage.removeItem(STORAGE_KEY_GENERATED);

    addToast('Database Direset', 'Seluruh setoran, penarikan, dan saldo berhasil direset ke 0!', 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        submissions,
        allGmailAccounts,
        withdrawals,
        transactions,
        settings,
        activityLogs,
        generatedGmails,
        notifications,
        announcements,
        adminEmailStocks,
        activeTab,
        setActiveTab,
        isAdminMode,
        setIsAdminMode,
        toasts,
        removeToast,
        liveEvent,

        login,
        loginWithGoogle,
        register,
        logout,
        switchUser,
        updateUserProfile,
        saveDanaNumber,
        changePassword,

        submitBulkGmail,
        requestWithdrawal,
        generateNewGmails,
        deleteGeneratedGmail,
        clearMyGeneratedGmails,

        adminAddEmailStock,
        adminDeleteEmailStock,
        adminClearUnusedStock,
        adminApproveBatch,
        adminRejectBatch,
        adminApproveSingleAccount,
        adminRejectSingleAccount,
        adminApproveAllPending,
        adminUpdateAllSetoran,
        adminAddAllPendingSaldo,
        adminCommitStagedSetoran,
        adminBlockUser,
        adminUnblockUser,
        adminProcessWithdrawal,
        adminUpdateSettings,
        adminDeleteUser,
        adminResetAllDatabase,

        addToast,
        markNotificationAsRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
