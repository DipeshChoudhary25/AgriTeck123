import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FarmProvider, useFarm } from './context/FarmContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FarmProfileView } from './components/FarmProfileView';
import { CropSoilView } from './components/CropSoilView';
import { WeatherPestView } from './components/WeatherPestView';
import { MarketplaceView } from './components/MarketplaceView';
import { ExpertForumView } from './components/ExpertForumView';
import { AdminView } from './components/AdminView';
import { AuthModal } from './components/AuthModal';
import { Phone, Shield, Leaf, HeartHandshake } from 'lucide-react';

function MainContent() {
  const { user } = useAuth();
  const { t } = useFarm();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [openSoilModalTrigger, setOpenSoilModalTrigger] = useState(false);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSoilFromDashboard = () => {
    setCurrentView('soil_crops');
    setOpenSoilModalTrigger(true);
    setTimeout(() => setOpenSoilModalTrigger(false), 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navigation Bar */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {currentView === 'dashboard' && (
          <DashboardView
            onNavigate={handleNavigate}
            onOpenSoilModal={handleOpenSoilFromDashboard}
          />
        )}

        {currentView === 'farm_profile' && <FarmProfileView />}

        {currentView === 'soil_crops' && (
          <CropSoilView initialOpenSoilModal={openSoilModalTrigger} />
        )}

        {currentView === 'weather_pests' && <WeatherPestView />}

        {currentView === 'marketplace' && <MarketplaceView />}

        {currentView === 'experts' && <ExpertForumView />}

        {currentView === 'admin' && <AdminView />}
      </main>

      {/* Grounded Farmer Helpline & Accessibility Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              Ag
            </span>
            <span className="font-bold text-slate-900 text-sm">AgriTech</span>
            <span aria-hidden="true">·</span>
            <span>Empowering sustainable, data-driven farming communities.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-600">
            <div className="flex items-center gap-1.5 font-medium text-emerald-800">
              <Phone className="w-3.5 h-3.5" />
              <span>Kisan Advisory Line: <strong>1800-180-1551 (Toll-Free)</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Certified Agricultural Intelligence</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} AgriTech Smart Farming Ecosystem. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => handleNavigate('farm_profile')} className="hover:text-slate-700">Farm GIS</button>
            <button onClick={() => handleNavigate('soil_crops')} className="hover:text-slate-700">NPK Diagnostics</button>
            <button onClick={() => handleNavigate('weather_pests')} className="hover:text-slate-700">Pest Radar</button>
            <button onClick={() => handleNavigate('marketplace')} className="hover:text-slate-700">Marketplace</button>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FarmProvider>
        <CartProvider>
          <MainContent />
        </CartProvider>
      </FarmProvider>
    </AuthProvider>
  );
}
