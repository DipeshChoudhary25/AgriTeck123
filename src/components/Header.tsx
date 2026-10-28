import React, { useState } from 'react';
import { ShoppingBag, Globe, UserCheck, ShieldAlert, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { useCart } from '../context/CartContext';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../i18n/translations';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const { language, setLanguage, t } = useFarm();
  const { totalItems, setIsCartOpen } = useCart();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: t('nav_dashboard') },
    { id: 'farm_profile', label: t('nav_farm_profile') },
    { id: 'soil_crops', label: t('nav_soil_crops') },
    { id: 'weather_pests', label: t('nav_weather_pests') },
    { id: 'marketplace', label: t('nav_marketplace') },
    { id: 'experts', label: t('nav_experts') },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ id: 'admin', label: t('nav_admin') });
  }

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-left focus:outline-none"
        >
          <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-1.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
              Ag
            </span>
            <span>AgriTech</span>
          </span>
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navLinks.map((link) => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 text-sm ${
                  isActive
                    ? 'border-emerald-600 text-emerald-800 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action & controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 whitespace-nowrap shrink-0 transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentLangObj.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      language === lang.code ? 'text-emerald-700 font-semibold bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[11px] text-slate-400">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center p-2 text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
            title="Cart"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 text-slate-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* User Account / Role switcher */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                  {user.name.charAt(0)}
                </span>
                <span className="max-w-[100px] truncate hidden sm:inline">{user.name.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-tight">({user.role})</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <p className="text-[10px] text-emerald-700 font-medium capitalize mt-0.5">{user.title || user.role}</p>
                  </div>

                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Role Switch (Demo)
                  </div>

                  <button
                    onClick={() => {
                      switchDemoRole('farmer');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50 ${
                      user.role === 'farmer' ? 'font-semibold text-emerald-700' : 'text-slate-700'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Farmer (Ramesh Patel)</span>
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('expert');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50 ${
                      user.role === 'expert' ? 'font-semibold text-emerald-700' : 'text-slate-700'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Agronomist (Dr. Sharma)</span>
                  </button>

                  <button
                    onClick={() => {
                      switchDemoRole('admin');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-slate-50 ${
                      user.role === 'admin' ? 'font-semibold text-emerald-700' : 'text-slate-700'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Admin (Suresh Mehta)</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      logout();
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('sign_out')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              {t('sign_in')}
            </button>
          )}
        </div>
      </div>

      {/* Mobile secondary navigation strip */}
      <div className="lg:hidden border-t border-slate-100 overflow-x-auto py-2 px-4 flex items-center gap-2 scrollbar-none">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap shrink-0 transition-colors ${
              currentView === link.id
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>
    </header>
  );
};
