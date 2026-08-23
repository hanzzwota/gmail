import React, { useState } from 'react';
import { Mail, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
}) => {
  const { login, register, loginWithGoogle } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Form Fields
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  if (!isOpen) return null;

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Mohon isi email dan kata sandi.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.message);
      }
    }, 400);
  };

  const handleSubmitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Mohon masukkan nama lengkap.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Mohon masukkan alamat email yang valid.');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = register(name, email, password, referralCode);
      setIsLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.message);
      }
    }, 400);
  };

  const handleGoogleClick = () => {
    loginWithGoogle();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#E0F2FE]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {/* Background container styling matching Screenshot 2 & 3 */}
      <div className="w-full max-w-md my-auto flex flex-col items-center">
        {/* Brand Header: Blue Mail Icon + S3L GMAIL Carlos69 */}
        <div className="flex items-center justify-center gap-2 mb-6 select-none">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Mail className="w-5 h-5 fill-white/20 stroke-[2.5]" />
          </div>
          <div className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
            <span>S3L GMAIL</span>
            <span className="text-blue-600">Carlos69</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white w-full rounded-[28px] shadow-xl shadow-blue-950/5 border border-slate-100 p-6 sm:p-8 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Segmented Switcher: Masuk | Daftar */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs mb-5"
          >
            {/* Google SVG Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <span>Lanjutkan dengan Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 font-medium absolute">
              atau
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Masuk */}
          {tab === 'login' ? (
            <form onSubmit={handleSubmitLogin} className="space-y-4">
              {/* Input Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 block">Email</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anda@email.com"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>

              {/* Input Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800 block">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-3 pr-11 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Masuk */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Masuk</span>
                )}
              </button>
            </form>
          ) : (
            /* Form Daftar */
            <form onSubmit={handleSubmitRegister} className="space-y-4">
              {/* Input Nama */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 block">Nama</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>

              {/* Input Kode Referral */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 block">
                  Kode Referral <span className="text-slate-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="KODE DARI TEMAN"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-mono uppercase text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Input Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anda@email.com"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>

              {/* Input Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-3 pr-11 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Daftar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Daftar Sekarang</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Lupa Kata Sandi?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Untuk reset kata sandi, silakan hubungi admin atau customer support resmi Carlos69 melalui Saluran WhatsApp dengan menyertakan alamat email Anda.
            </p>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
