import React, { useState } from 'react';
import {
  Sun,
  CloudRain,
  Wind,
  Droplets,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Send,
  X,
  Radio,
  Thermometer,
  Calendar,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { useAuth } from '../context/AuthContext';
import { PestAlert } from '../types';
import { api } from '../services/api';
import { VoiceReaderButton } from './VoiceReaderButton';

export const WeatherPestView: React.FC = () => {
  const { user } = useAuth();
  const { weather, pestAlerts, refreshAlerts, activeFarm, t } = useFarm();
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Broadcast Alert Form
  const [alertTitle, setAlertTitle] = useState('');
  const [alertCrop, setAlertCrop] = useState('');
  const [severity, setSeverity] = useState<PestAlert['severity']>('High');
  const [region, setRegion] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [organicRemedy, setOrganicRemedy] = useState('');
  const [chemicalRemedy, setChemicalRemedy] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle || !alertCrop) return;

    setIsBroadcasting(true);
    try {
      await api.createPestAlert({
        title: alertTitle,
        crop: alertCrop,
        severity,
        region: region || `${activeFarm?.location.district || 'Regional'} Farming Belt`,
        symptoms: symptoms.split(',').map((s) => s.trim()).filter(Boolean),
        organicRemedy,
        chemicalRemedy,
      });
      await refreshAlerts();
      setShowBroadcastModal(false);
      setAlertTitle('');
      setAlertCrop('');
      setSymptoms('');
      setOrganicRemedy('');
      setChemicalRemedy('');
    } catch (err) {
      console.error('Error broadcasting alert:', err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const weatherSpoken = weather
    ? `Weather forecast for ${weather.city}: Current temperature ${weather.currentTemp} degrees Celsius. 7-day outlook shows rainfall risk between ${weather.forecast[0]?.rainChance || 10} percent and ${weather.forecast[2]?.rainChance || 20} percent. Pesticide spray status: ${weather.sprayAdvisory.status}. ${weather.sprayAdvisory.reason}`
    : 'Weather forecast loading.';

  return (
    <div className="space-y-6">
      {/* 7-Day Precision Forecast */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{t('weather_forecast')}</h2>
              <span className="text-xs text-slate-500 font-mono">
                {activeFarm?.location.district}, {activeFarm?.location.state}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Microclimate telemetry tailored to your farm coordinates
            </p>
          </div>
          <VoiceReaderButton textToRead={weatherSpoken} />
        </div>

        {weather ? (
          <div className="mt-6 space-y-6">
            {/* Today's Deep Dive Strip */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-700">
                  <Sun className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Current Ambient</div>
                  <div className="text-2xl font-bold font-mono text-slate-900">{weather.currentTemp}°C</div>
                  <div className="text-[11px] text-slate-500">{weather.condition}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100/80 flex items-center justify-center text-blue-700">
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">{t('humidity_level')}</div>
                  <div className="text-2xl font-bold font-mono text-slate-900">{weather.humidity}%</div>
                  <div className="text-[11px] text-slate-500">Relative Humidity</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-100/80 flex items-center justify-center text-teal-700">
                  <Wind className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">{t('wind_velocity')}</div>
                  <div className="text-2xl font-bold font-mono text-slate-900">{weather.windSpeed} km/h</div>
                  <div className="text-[11px] text-slate-500">Gentle Surface Breeze</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100/80 flex items-center justify-center text-indigo-700">
                  <CloudRain className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">{t('rainfall_chance')}</div>
                  <div className="text-2xl font-bold font-mono text-slate-900">{weather.rainfallChance}%</div>
                  <div className="text-[11px] text-slate-500">Next 24 Hours</div>
                </div>
              </div>
            </div>

            {/* Spraying Window Card */}
            <div
              className={`p-4 rounded-xl border ${
                weather.sprayAdvisory.status === 'Safe'
                  ? 'bg-emerald-50/80 border-emerald-200'
                  : weather.sprayAdvisory.status === 'Caution'
                  ? 'bg-amber-50/80 border-amber-200'
                  : 'bg-rose-50/80 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-sm mb-1">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>
                    {weather.sprayAdvisory.status === 'Safe'
                      ? t('spray_safe')
                      : weather.sprayAdvisory.status === 'Caution'
                      ? t('spray_caution')
                      : t('spray_unfavorable')}
                  </span>
                </span>
                <span className="text-xs font-mono font-medium text-emerald-900 bg-white/80 px-2.5 py-0.5 rounded border border-current">
                  Window: {weather.sprayAdvisory.bestWindow}
                </span>
              </div>
              <p className="text-xs text-slate-700">{weather.sprayAdvisory.reason}</p>
            </div>

            {/* 7-Day Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weather.forecast.map((day, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-2">
                  <span className="text-xs font-semibold text-slate-700 block">{day.date}</span>
                  <div className="w-8 h-8 mx-auto rounded-full bg-white flex items-center justify-center shadow-2xs text-amber-600">
                    {day.rainChance > 40 ? <CloudRain className="w-4 h-4 text-blue-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold font-mono text-slate-900">
                      {day.tempMax}° / <span className="text-slate-400">{day.tempMin}°</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{day.condition}</div>
                  </div>
                  <div className="text-[10px] text-blue-600 font-mono font-medium">
                    💧 {day.rainChance}% Rain
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">Loading precision weather telemetry...</div>
        )}
      </div>

      {/* Emergency Pest Outbreak Alerts */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{t('pest_outbreak_risk')}</h2>
              <span className="text-xs font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Early Warning Radar
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated pest vulnerability models and community outbreak broadcasts.
            </p>
          </div>

          <button
            onClick={() => setShowBroadcastModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors whitespace-nowrap shadow-xs self-start sm:self-center"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{t('broadcast_alert')}</span>
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {pestAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-xl border transition-colors ${
                alert.severity === 'High'
                  ? 'bg-rose-50/40 border-rose-200/80 hover:bg-rose-50/70'
                  : alert.severity === 'Moderate'
                  ? 'bg-amber-50/40 border-amber-200/80 hover:bg-amber-50/70'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        alert.severity === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : alert.severity === 'Moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {alert.severity} Risk
                    </span>
                    <span className="text-xs font-semibold text-slate-900">Crop: {alert.crop}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">{alert.region}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs font-mono text-slate-500">{alert.detectedDate}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1">{alert.title}</h3>
                </div>

                <VoiceReaderButton
                  textToRead={`Warning: ${alert.title} in ${alert.region}. Symptoms: ${alert.symptoms.join(', ')}. Organic remedy: ${alert.organicRemedy}. Chemical treatment: ${alert.chemicalRemedy}`}
                />
              </div>

              {/* Symptoms */}
              <div className="mt-3">
                <span className="text-xs font-semibold text-slate-700 block mb-1">{t('symptoms')}:</span>
                <div className="flex flex-wrap gap-1.5">
                  {alert.symptoms.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Remedies Grid */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                  <span className="font-semibold text-emerald-800 block mb-1">🌿 {t('organic_treatment')}</span>
                  <p className="text-slate-700 leading-relaxed">{alert.organicRemedy}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                  <span className="font-semibold text-indigo-800 block mb-1">🧪 {t('chemical_treatment')}</span>
                  <p className="text-slate-700 leading-relaxed">{alert.chemicalRemedy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Broadcast Alert Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{t('broadcast_alert')}</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastAlert} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alert Headline</label>
                <input
                  type="text"
                  required
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  placeholder="e.g. Yellow Rust Spore Influx Alert"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Affected Crop</label>
                  <input
                    type="text"
                    required
                    value={alertCrop}
                    onChange={(e) => setAlertCrop(e.target.value)}
                    placeholder="e.g. Wheat / Mustard"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="High">High Outbreak</option>
                    <option value="Moderate">Moderate Vulnerability</option>
                    <option value="Low">Low / Preventive Watch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Affected Region / Agricultural Zone</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Central Alluvial Basin"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Symptoms (comma separated)</label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Yellow pustules, powdered leaves, wilting tips"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('organic_treatment')}</label>
                <textarea
                  value={organicRemedy}
                  onChange={(e) => setOrganicRemedy(e.target.value)}
                  placeholder="e.g. Spray 5% Neem Seed Kernel Extract (NSKE)..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('chemical_treatment')}</label>
                <textarea
                  value={chemicalRemedy}
                  onChange={(e) => setChemicalRemedy(e.target.value)}
                  placeholder="e.g. Propiconazole 25 EC @ 1ml/L..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  className="px-4 py-2 font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast to Farmers'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
