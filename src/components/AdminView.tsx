import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Layers,
  ShoppingBag,
  Radio,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Search,
  Plus,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';

export const AdminView: React.FC = () => {
  const { t } = useFarm();
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');

  // Pending resource approval mockup
  const [pendingItems, setPendingItems] = useState([
    {
      id: 'appr_1',
      seller: 'Kisan Bio-Tech Organics',
      productName: 'Trichoderma Viride Bio-Fungicide (1kg)',
      category: 'Pesticides',
      status: 'Pending Lab Report Verification',
    },
    {
      id: 'appr_2',
      seller: 'Punjab Agritech Innovations',
      productName: 'Solar Precision Smart Soil Moisture Sensor Node',
      category: 'Tools & Sensors',
      status: 'Pending Sensor Calibration Check',
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleApprove = (id: string) => {
    setPendingItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredUsers = (stats?.users || []).filter((u: any) =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.role.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Operations & Compliance Control</span>
          </span>
          <h2 className="text-2xl font-bold text-slate-900">{t('admin_overview')}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time multi-tenant agricultural ecosystem telemetry, user accounts, and resource vetting.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('total_farmers')}</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {stats ? stats.totalFarmers.toLocaleString() : '1,423'}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Active across 14 districts</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('total_acreage')}</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {stats ? stats.totalAcreage.toLocaleString() : '4,872'}
          </div>
          <span className="text-[11px] text-slate-500">Under telemetry observation</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Marketplace GMV</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ₹{stats ? stats.marketplaceGMV.toLocaleString() : '421,580'}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Subsidy processed</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Active Pest Radars</span>
            <Radio className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {stats ? stats.activePestAlerts : '3'}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">2 High severity</span>
        </div>
      </div>

      {/* Resource Approval Queue */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Resource Vetting & Approvals</h3>
            <p className="text-xs text-slate-500">
              Certify seeds, bio-pesticides and smart sensors before farmer marketplace availability.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded border border-amber-200">
            {pendingItems.length} Pending
          </span>
        </div>

        {pendingItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">All supplier resource listings verified and approved.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {pendingItems.map((item) => (
              <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.productName}</span>
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Supplier: <strong className="text-slate-800">{item.seller}</strong> · {item.status}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs"
                  >
                    Approve Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Directory */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('manage_users')}</h3>
            <p className="text-xs text-slate-500">System credentials and access control</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter users..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Name & Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Designation / Farm</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{u.name}</span>
                    <span className="text-slate-500 text-[11px] font-mono">{u.email}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-amber-100 text-amber-800'
                          : u.role === 'expert'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{u.title || 'General Account'}</td>
                  <td className="py-3 px-3 text-slate-600">{u.location || 'India'}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-semibold text-emerald-700">✓ Verified</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
