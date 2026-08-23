import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LiveToastTicker } from './components/LiveToastTicker';
import { DashboardView } from './components/DashboardView';
import { StorView } from './components/StorView';
import { SaldoView } from './components/SaldoView';
import { ProfilView } from './components/ProfilView';
import { RiwayatView } from './components/RiwayatView';
import { BeliAkunView } from './components/BeliAkunView';
import { AkunSayaView } from './components/AkunSayaView';
import { AdminView } from './components/AdminView';
import { AuthModal } from './components/AuthModal';
import { PublicPagesModal } from './components/PublicPagesModal';
import { RulesModal } from './components/RulesModal';
import { SupportKomunitasModal } from './components/SupportKomunitasModal';

const AppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    isAdminMode, 
    settings 
  } = useApp();

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  
  const [publicPage, setPublicPage] = useState<'harga' | 'carabeli' | 'kontak' | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [supportModalType, setSupportModalType] = useState<'support' | 'komunitas' | null>(null);

  const handleOpenSaluranWA = () => {
    window.open(settings.linkSaluran || 'https://chat.whatsapp.com/channel/example', '_blank');
  };

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthInitialTab(tab);
    setIsAuthOpen(true);
  };

  // If in Admin Panel View
  if (isAdminMode && activeTab === 'admin') {
    return (
      <div className="min-h-screen bg-[#0B1120] font-sans antialiased text-slate-100">
        <LiveToastTicker />
        <AdminView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Real-Time Toast Ticker */}
      <LiveToastTicker />

      {/* Top Navigation Bar with Brand, Nav Links (Beranda, Harga, Cara Beli, Kontak), and Login/Daftar/Avatar */}
      <Header
        onOpenSaluranWA={handleOpenSaluranWA}
        onOpenAuth={handleOpenAuth}
        onOpenPublicPage={(page) => setPublicPage(page)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 w-full max-w-lg mx-auto">
        {activeTab === 'beranda' && (
          <DashboardView
            onOpenTarikSaldo={() => setActiveTab('saldo')}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenSupport={() => setSupportModalType('support')}
            onOpenKomunitas={() => setSupportModalType('komunitas')}
          />
        )}

        {activeTab === 'stor' && (
          <StorView
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenSaluranWA={handleOpenSaluranWA}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'saldo' && <SaldoView />}

        {activeTab === 'riwayat' && <RiwayatView />}

        {activeTab === 'profil' && <ProfilView />}

        {activeTab === 'beli-akun' && <BeliAkunView />}

        {activeTab === 'akun-saya' && <AkunSayaView />}
      </main>

      {/* Bottom Floating Navigation */}
      <BottomNav />

      {/* Auth Modal (Login / Register / Google OAuth / Demo Credentials) */}
      <AuthModal
        isOpen={isAuthOpen}
        initialTab={authInitialTab}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Public Pages Modal (Harga, Cara Beli, Kontak) */}
      <PublicPagesModal
        page={publicPage}
        onClose={() => setPublicPage(null)}
        onOpenAuth={handleOpenAuth}
        onOpenSaluranWA={handleOpenSaluranWA}
      />

      {/* Rules & Syarat Ketentuan Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        onOpenSaluranWA={handleOpenSaluranWA}
      />

      {/* Support & Komunitas Modal */}
      <SupportKomunitasModal
        type={supportModalType}
        onClose={() => setSupportModalType(null)}
        onOpenSaluranWA={handleOpenSaluranWA}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
