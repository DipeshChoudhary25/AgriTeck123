import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, switchDemoRole } = useAuth();
  const { t } = useFarm();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'farmer' | 'expert' | 'admin'>('farmer');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, role, phone, location });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoRole: 'farmer' | 'expert' | 'admin') => {
    setIsSubmitting(true);
    try {
      await switchDemoRole(demoRole);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'login' ? 'Sign In to AgriTech' : 'Create Farmer / Expert Account'}
            </h3>
            <p className="text-xs text-slate-500">
              {mode === 'login'
                ? 'Access your farm parcels, soil records, and pest radar'
                : 'Join the smart farming agricultural network'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Quick Logins Strip */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Instant Demo Sign-In (1 Click)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('farmer')}
              className="py-1.5 px-2 bg-white hover:bg-emerald-50 border border-slate-200 rounded text-[11px] font-medium text-slate-800 text-center transition-colors truncate"
            >
              🌾 Farmer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('expert')}
              className="py-1.5 px-2 bg-white hover:bg-blue-50 border border-slate-200 rounded text-[11px] font-medium text-slate-800 text-center transition-colors truncate"
            >
              🔬 Agronomist
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 bg-white hover:bg-amber-50 border border-slate-200 rounded text-[11px] font-medium text-slate-800 text-center transition-colors truncate"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role in Agricultural Chain</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="farmer">Farmer (Land Cultivator)</option>
                  <option value="expert">Agronomist / Scientist / Expert</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">District / State</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Anand, Gujarat"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold rounded-lg text-sm transition-colors shadow-xs mt-2"
          >
            {isSubmitting
              ? 'Authenticating...'
              : mode === 'login'
              ? 'Sign In to Dashboard'
              : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
          {mode === 'login' ? (
            <p>
              New to AgriTech?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className="font-bold text-emerald-700 hover:underline"
              >
                Register as a Farmer
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className="font-bold text-emerald-700 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
