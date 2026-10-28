import React from 'react';
import {
  Sun,
  CloudRain,
  Wind,
  Droplets,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Calendar,
  Layers,
  ShoppingBag,
  Stethoscope,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { useAuth } from '../context/AuthContext';
import { VoiceReaderButton } from './VoiceReaderButton';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onOpenSoilModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenSoilModal }) => {
  const { user } = useAuth();
  const { activeFarm, farms, setActiveFarmId, weather, crops, soilLogs, pestAlerts, t } = useFarm();

  const latestSoil = soilLogs[0];
  const urgentAlerts = pestAlerts.filter((a) => a.active && a.severity === 'High');

  // Text summary for audio read-aloud
  const weatherSpokenSummary = weather
    ? `Today's farm weather in ${weather.city}: ${weather.currentTemp} degrees Celsius, ${weather.condition}. Humidity is ${weather.humidity} percent, wind speed ${weather.windSpeed} kilometers per hour. Spray advisory: ${weather.sprayAdvisory.status}. ${weather.sprayAdvisory.reason}. Optimal spray window: ${weather.sprayAdvisory.bestWindow}.`
    : 'Weather data is currently loading.';

  const soilSpokenSummary = latestSoil
    ? `Soil status for ${activeFarm?.name}: Overall status is ${latestSoil.status}. Available Nitrogen is ${latestSoil.nitrogen} kilograms per hectare, Phosphorus ${latestSoil.phosphorus}, Potassium ${latestSoil.potassium}, and pH is ${latestSoil.ph}. Key advisory: ${latestSoil.recommendations[0]}`
    : 'Soil records ready for testing.';

  return (
    <div className="space-y-6">
      {/* Hero Banner Section */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-sm">
        <img
          src="/src/assets/images/hero_smart_agriculture_1793208169872.jpg"
          alt="Smart Agricultural Fields"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity filter saturate-150"
        />
        <div className="relative z-10 p-6 md:p-8 max-w-3xl text-white">
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium mb-2">
            <span>{t('tagline')}</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Telemetry & Advisory</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 text-balance">
            {t('welcome')}, {user?.name || 'Farmer'}
          </h1>
          <p className="text-sm sm:text-base text-slate-200 mb-6 leading-relaxed">
            Data-driven intelligence connecting soil health, localized weather alerts, and crop science to maximize farm yield.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('experts')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-950" />
              <span>{t('diagnose_crop')}</span>
            </button>

            <button
              onClick={() => onNavigate('soil_crops')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg backdrop-blur-sm transition-colors whitespace-nowrap"
            >
              <span>{t('soil_health_card')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <VoiceReaderButton
              textToRead={`${weatherSpokenSummary} ${soilSpokenSummary}`}
              className="bg-black/40 text-white border-white/30 hover:bg-black/60"
              label="Audio Summary"
            />
          </div>
        </div>

        {/* Farm Selector Strip in Hero Footer */}
        <div className="relative z-10 border-t border-white/15 bg-black/40 backdrop-blur-md px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400">{t('active_farm')}:</span>
            <select
              value={activeFarm?.id || ''}
              onChange={(e) => setActiveFarmId(e.target.value)}
              className="bg-slate-800/80 text-white font-medium border border-slate-700 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name} ({farm.sizeAcres} Acres · {farm.location.district})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span>Soil: <strong className="text-white font-medium">{activeFarm?.soilType || 'Alluvial'}</strong></span>
            <span>Irrigation: <strong className="text-white font-medium">{activeFarm?.irrigationType || 'Drip'}</strong></span>
            <span>Parcel Health: <strong className="text-emerald-400 font-mono font-medium">{activeFarm?.healthIndex || 85}%</strong></span>
          </div>
        </div>
      </div>

      {/* Urgent Pest Outbreak Alert Banner (if any) */}
      {urgentAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  High Risk Outbreak Alert
                </span>
                <span className="text-xs text-amber-700">· Detected {urgentAlerts[0].detectedDate}</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                {urgentAlerts[0].title}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Remedy: {urgentAlerts[0].organicRemedy}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <VoiceReaderButton textToRead={`Warning: ${urgentAlerts[0].title}. Remedy: ${urgentAlerts[0].organicRemedy}`} />
            <button
              onClick={() => onNavigate('weather_pests')}
              className="px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-200/90 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
            >
              Action Plan
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Grid: Weather & Spray Advisory + Soil Health Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Microclimate Telemetry</span>
                <h3 className="text-lg font-bold text-slate-900">{t('weather_overview')}</h3>
              </div>
              <VoiceReaderButton textToRead={weatherSpokenSummary} />
            </div>

            {weather ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                      <Sun className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                        {weather.currentTemp}°C
                      </div>
                      <div className="text-xs text-slate-500">{weather.condition} · {weather.city}</div>
                    </div>
                  </div>

                  <div className="text-right space-y-1 text-xs">
                    <div className="flex items-center justify-end gap-1.5 text-slate-600">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      <span>Humidity: <strong className="font-mono text-slate-900">{weather.humidity}%</strong></span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 text-slate-600">
                      <Wind className="w-3.5 h-3.5 text-teal-500" />
                      <span>Wind: <strong className="font-mono text-slate-900">{weather.windSpeed} km/h</strong></span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 text-slate-600">
                      <CloudRain className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Rain Risk: <strong className="font-mono text-slate-900">{weather.rainfallChance}%</strong></span>
                    </div>
                  </div>
                </div>

                {/* Spray Window Banner */}
                <div
                  className={`p-3.5 rounded-lg border text-xs ${
                    weather.sprayAdvisory.status === 'Safe'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : weather.sprayAdvisory.status === 'Caution'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {weather.sprayAdvisory.status === 'Safe'
                        ? t('spray_safe')
                        : weather.sprayAdvisory.status === 'Caution'
                        ? t('spray_caution')
                        : t('spray_unfavorable')}
                    </span>
                    <span className="font-mono text-[11px] bg-white/70 px-2 py-0.5 rounded border border-current">
                      Optimal Window
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1">{weather.sprayAdvisory.reason}</p>
                  <p className="text-emerald-950 font-medium mt-1">Recommended: {weather.sprayAdvisory.bestWindow}</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">Loading precision meteorological feed...</div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">7-Day Forecast & Radar available</span>
            <button
              onClick={() => onNavigate('weather_pests')}
              className="font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>{t('view_details')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Soil Health Card Preview */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nutrient Profile</span>
                <h3 className="text-lg font-bold text-slate-900">{t('soil_health_card')}</h3>
              </div>
              <VoiceReaderButton textToRead={soilSpokenSummary} />
            </div>

            {latestSoil ? (
              <div className="space-y-4">
                {/* Score & NPK Grid */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[11px] text-slate-500 font-medium">Nitrogen</div>
                    <div className="text-base font-bold text-slate-900 font-mono mt-0.5">{latestSoil.nitrogen}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">kg/ha</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[11px] text-slate-500 font-medium">Phosphorus</div>
                    <div className="text-base font-bold text-slate-900 font-mono mt-0.5">{latestSoil.phosphorus}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">kg/ha</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[11px] text-slate-500 font-medium">Potassium</div>
                    <div className="text-base font-bold text-slate-900 font-mono mt-0.5">{latestSoil.potassium}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">kg/ha</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[11px] text-slate-500 font-medium">pH Level</div>
                    <div className="text-base font-bold text-slate-900 font-mono mt-0.5">{latestSoil.ph}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Neutral</div>
                  </div>
                </div>

                {/* Primary Recommendation */}
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-900 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Agronomic Soil Prescription</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {latestSoil.recommendations[0] || 'Soil fertility is in balanced condition for seasonal crops.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">No soil test logs recorded yet.</div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={onOpenSoilModal}
              className="font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2"
            >
              + {t('log_soil_test')}
            </button>
            <button
              onClick={() => onNavigate('soil_crops')}
              className="font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>{t('view_details')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Monitored Crops & Growth Stages */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Field Lifecycle</span>
            <h3 className="text-lg font-bold text-slate-900">{t('crops_monitored')}</h3>
          </div>
          <button
            onClick={() => onNavigate('soil_crops')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Manage Crops</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {crops.slice(0, 3).map((crop) => (
            <div key={crop.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{crop.name}</h4>
                  <p className="text-xs text-slate-500 truncate max-w-[200px]">{crop.variety}</p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  {crop.healthScore}% Health
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Current Stage:</span>
                  <strong className="text-slate-900 font-semibold">{crop.stage}</strong>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full"
                    style={{
                      width:
                        crop.stage === 'Sowing'
                          ? '15%'
                          : crop.stage === 'Germination'
                          ? '35%'
                          : crop.stage === 'Vegetative'
                          ? '55%'
                          : crop.stage === 'Flowering'
                          ? '75%'
                          : crop.stage === 'Maturity'
                          ? '90%'
                          : '100%',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Area: {crop.acreage} Acres</span>
                  <span>Est. Harvest: {crop.expectedHarvestDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={onOpenSoilModal}
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors shadow-xs flex flex-col justify-between"
        >
          <Layers className="w-5 h-5 text-emerald-600 mb-2" />
          <div>
            <div className="text-xs font-semibold text-slate-900">{t('log_soil_test')}</div>
            <div className="text-[11px] text-slate-500">Record NPK & pH data</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('experts')}
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors shadow-xs flex flex-col justify-between"
        >
          <Stethoscope className="w-5 h-5 text-emerald-600 mb-2" />
          <div>
            <div className="text-xs font-semibold text-slate-900">{t('diagnose_crop')}</div>
            <div className="text-[11px] text-slate-500">Instant AI leaf scan</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('marketplace')}
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors shadow-xs flex flex-col justify-between"
        >
          <ShoppingBag className="w-5 h-5 text-emerald-600 mb-2" />
          <div>
            <div className="text-xs font-semibold text-slate-900">{t('buy_supplies')}</div>
            <div className="text-[11px] text-slate-500">Certified seeds & inputs</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('experts')}
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors shadow-xs flex flex-col justify-between"
        >
          <Calendar className="w-5 h-5 text-emerald-600 mb-2" />
          <div>
            <div className="text-xs font-semibold text-slate-900">{t('consult_expert')}</div>
            <div className="text-[11px] text-slate-500">Schedule agronomist</div>
          </div>
        </button>
      </div>
    </div>
  );
};
