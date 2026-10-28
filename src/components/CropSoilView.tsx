import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Plus,
  Droplets,
  Calendar,
  CheckCircle2,
  Trash2,
  X,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { SoilRecord, Crop } from '../types';
import { api } from '../services/api';
import { VoiceReaderButton } from './VoiceReaderButton';

interface CropSoilViewProps {
  initialOpenSoilModal?: boolean;
}

export const CropSoilView: React.FC<CropSoilViewProps> = ({ initialOpenSoilModal = false }) => {
  const { activeFarm, crops, soilLogs, refreshCrops, refreshSoil, t } = useFarm();

  const [showSoilModal, setShowSoilModal] = useState(initialOpenSoilModal);
  const [showCropModal, setShowCropModal] = useState(false);

  // Soil Form state
  const [nitrogen, setNitrogen] = useState('320');
  const [phosphorus, setPhosphorus] = useState('18');
  const [potassium, setPotassium] = useState('220');
  const [ph, setPh] = useState('7.0');
  const [moisture, setMoisture] = useState('36');
  const [organicCarbon, setOrganicCarbon] = useState('0.65');
  const [isSubmittingSoil, setIsSubmittingSoil] = useState(false);

  // Crop Form state
  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [stage, setStage] = useState<Crop['stage']>('Vegetative');
  const [acreage, setAcreage] = useState('4.0');
  const [waterRequirement, setWaterRequirement] = useState<Crop['waterRequirement']>('Moderate');
  const [targetYieldTons, setTargetYieldTons] = useState('8.0');
  const [notes, setNotes] = useState('');
  const [isSubmittingCrop, setIsSubmittingCrop] = useState(false);

  // AI Soil Recommendation state
  const [aiPrescription, setAiPrescription] = useState<any | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const latestSoil: SoilRecord | undefined = soilLogs[0];

  const handleLogSoil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm) return;

    setIsSubmittingSoil(true);
    try {
      await api.createSoilLog({
        farmId: activeFarm.id,
        nitrogen: parseFloat(nitrogen) || 300,
        phosphorus: parseFloat(phosphorus) || 18,
        potassium: parseFloat(potassium) || 220,
        ph: parseFloat(ph) || 7.0,
        moisturePercentage: parseFloat(moisture) || 35,
        organicCarbonPercentage: parseFloat(organicCarbon) || 0.6,
      });
      await refreshSoil();
      setShowSoilModal(false);
    } catch (err) {
      console.error('Error logging soil test:', err);
    } finally {
      setIsSubmittingSoil(false);
    }
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm || !cropName) return;

    setIsSubmittingCrop(true);
    try {
      await api.createCrop({
        farmId: activeFarm.id,
        name: cropName,
        variety: variety || 'Standard High Yield',
        sowingDate,
        expectedHarvestDate: expectedHarvestDate || '2027-04-15',
        stage,
        acreage: parseFloat(acreage) || 2.0,
        waterRequirement,
        targetYieldTons: parseFloat(targetYieldTons) || 5.0,
        notes,
      });
      await refreshCrops();
      setShowCropModal(false);
      setCropName('');
      setVariety('');
    } catch (err) {
      console.error('Error registering crop:', err);
    } finally {
      setIsSubmittingCrop(false);
    }
  };

  const handleUpdateStage = async (cropId: string, newStage: Crop['stage']) => {
    try {
      await api.updateCrop(cropId, { stage: newStage });
      await refreshCrops();
    } catch (err) {
      console.error('Error updating crop stage:', err);
    }
  };

  const handleDeleteCrop = async (cropId: string) => {
    if (confirm('Delete this crop monitoring record?')) {
      try {
        await api.deleteCrop(cropId);
        await refreshCrops();
      } catch (err) {
        console.error('Error deleting crop:', err);
      }
    }
  };

  const handleTriggerAiSoilAnalysis = async () => {
    if (!latestSoil) return;
    setIsGeneratingAi(true);
    try {
      const res = await api.getSoilRecommendationAI({
        nitrogen: latestSoil.nitrogen,
        phosphorus: latestSoil.phosphorus,
        potassium: latestSoil.potassium,
        ph: latestSoil.ph,
        cropTarget: crops[0]?.name || 'Wheat / Mustard',
        soilType: activeFarm?.soilType || 'Alluvial',
      });
      setAiPrescription(res);
    } catch (err) {
      console.error('AI Soil recommendation failed:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const getMetricBadge = (current: number, min: number, max: number) => {
    if (current < min) {
      return <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">Low</span>;
    }
    if (current > max) {
      return <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium">High</span>;
    }
    return <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">Optimal</span>;
  };

  return (
    <div className="space-y-6">
      {/* Soil Health Card Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{t('soil_health_card')}</h2>
              {latestSoil && (
                <span className="text-xs font-mono text-slate-500">
                  Tested: {latestSoil.testDate}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Laboratory soil fertility benchmark for {activeFarm?.name || 'Active Farm'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSoilModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('log_soil_test')}</span>
            </button>

            <button
              onClick={handleTriggerAiSoilAnalysis}
              disabled={isGeneratingAi || !latestSoil}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>{isGeneratingAi ? 'Analyzing Soil...' : 'AI Soil Advisor'}</span>
            </button>
          </div>
        </div>

        {latestSoil ? (
          <div className="mt-6 space-y-6">
            {/* NPK + pH + Moisture Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-slate-500">{t('nitrogen_level')}</span>
                  {getMetricBadge(latestSoil.nitrogen, 280, 560)}
                </div>
                <div className="text-2xl font-bold text-slate-900 font-mono">{latestSoil.nitrogen}</div>
                <div className="text-[11px] text-slate-400 mt-1">Ideal: 280-560 kg/ha</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-slate-500">{t('phosphorus_level')}</span>
                  {getMetricBadge(latestSoil.phosphorus, 10, 25)}
                </div>
                <div className="text-2xl font-bold text-slate-900 font-mono">{latestSoil.phosphorus}</div>
                <div className="text-[11px] text-slate-400 mt-1">Ideal: 10-25 kg/ha</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-slate-500">{t('potassium_level')}</span>
                  {getMetricBadge(latestSoil.potassium, 110, 280)}
                </div>
                <div className="text-2xl font-bold text-slate-900 font-mono">{latestSoil.potassium}</div>
                <div className="text-[11px] text-slate-400 mt-1">Ideal: 110-280 kg/ha</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-slate-500">{t('soil_ph')}</span>
                  {getMetricBadge(latestSoil.ph, 6.5, 7.5)}
                </div>
                <div className="text-2xl font-bold text-slate-900 font-mono">{latestSoil.ph}</div>
                <div className="text-[11px] text-slate-400 mt-1">Ideal: 6.5 - 7.5</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-slate-500">{t('moisture')}</span>
                  {getMetricBadge(latestSoil.moisturePercentage, 30, 45)}
                </div>
                <div className="text-2xl font-bold text-slate-900 font-mono">{latestSoil.moisturePercentage}%</div>
                <div className="text-[11px] text-slate-400 mt-1">Ideal: 30 - 45%</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-slate-500">{t('organic_matter')}</span>
                  {getMetricBadge(latestSoil.organicCarbonPercentage, 0.5, 0.75)}
                </div>
                <div className="text-2xl font-bold text-slate-900 font-mono">{latestSoil.organicCarbonPercentage}%</div>
                <div className="text-[11px] text-slate-400 mt-1">Ideal: &gt; 0.5%</div>
              </div>
            </div>

            {/* Standard Recommendations List */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Field Agronomist Soil Correction Guidelines
                </h4>
                <VoiceReaderButton textToRead={latestSoil.recommendations.join('. ')} />
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {latestSoil.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Generated Soil Prescription Box */}
            {aiPrescription && (
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <h4 className="text-sm font-bold text-emerald-950">
                      Gemini AI Precision Fertilizer & Crop Suitability
                    </h4>
                  </div>
                  <VoiceReaderButton
                    textToRead={`${aiPrescription.soilCondition}. Recommendations: ${aiPrescription.dosagePrescription.join('. ')}. Suitable crops: ${aiPrescription.suitableCrops.join(', ')}.`}
                  />
                </div>

                <p className="text-xs text-slate-800 font-medium">{aiPrescription.soilCondition}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">Tailored Nutrient Dosage:</span>
                    <ul className="space-y-1 text-slate-700">
                      {aiPrescription.dosagePrescription.map((dose: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{dose}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 block mb-1">High-Yield Suitable Crops:</span>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {aiPrescription.suitableCrops.map((c: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-white border border-emerald-300 text-emerald-900 rounded font-medium text-[11px]">
                          {c}
                        </span>
                      ))}
                    </div>
                    <span className="font-semibold text-slate-900 block mb-0.5">Organic Amendment:</span>
                    <p className="text-slate-600 text-[11px]">{aiPrescription.organicCorrection}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            No soil health test logged yet for this parcel. Click above to log your first report.
          </div>
        )}
      </div>

      {/* Crop Monitoring & Stages Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('crop_timeline')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track growth phases, water requirements, and estimated harvest dates.
            </p>
          </div>

          <button
            onClick={() => setShowCropModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shadow-xs self-start sm:self-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('add_crop')}</span>
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {crops.map((crop) => {
            const stages: Crop['stage'][] = ['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Maturity', 'Harvest Ready'];
            const currentStageIndex = stages.indexOf(crop.stage);

            return (
              <div key={crop.id} className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50/80 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{crop.name}</h3>
                      <span className="text-xs text-slate-500">({crop.variety})</span>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {crop.healthScore}% Vigor
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Area: <strong className="text-slate-800 font-mono">{crop.acreage} Acres</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Sown: <strong className="text-slate-800 font-mono">{crop.sowingDate}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Harvest: <strong className="text-slate-800 font-mono">{crop.expectedHarvestDate}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Water Need: <strong className="text-slate-800">{crop.waterRequirement}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <select
                      value={crop.stage}
                      onChange={(e) => handleUpdateStage(crop.id, e.target.value as any)}
                      className="text-xs font-semibold text-emerald-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      {stages.map((s) => (
                        <option key={s} value={s}>
                          Stage: {s}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleDeleteCrop(crop.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Remove Crop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Visual Stage Stepper */}
                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <div className="grid grid-cols-6 gap-1 text-center">
                    {stages.map((s, idx) => {
                      const isPassed = idx <= currentStageIndex;
                      const isCurrent = idx === currentStageIndex;

                      return (
                        <div key={s} className="space-y-1">
                          <div
                            className={`h-1.5 rounded-full transition-colors ${
                              isCurrent
                                ? 'bg-emerald-600'
                                : isPassed
                                ? 'bg-emerald-400'
                                : 'bg-slate-200'
                            }`}
                          />
                          <span
                            className={`text-[10px] block truncate ${
                              isCurrent ? 'font-bold text-emerald-800' : 'text-slate-400'
                            }`}
                          >
                            {s}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {crop.notes && (
                  <p className="text-xs text-slate-600 mt-3 bg-white p-2.5 rounded-lg border border-slate-200/60">
                    <strong>Field Notes:</strong> {crop.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Soil Test Modal */}
      {showSoilModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{t('log_soil_test')}</h3>
              <button onClick={() => setShowSoilModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSoil} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('nitrogen_level')} (kg/ha)</label>
                  <input
                    type="number"
                    required
                    value={nitrogen}
                    onChange={(e) => setNitrogen(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('phosphorus_level')} (kg/ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('potassium_level')} (kg/ha)</label>
                  <input
                    type="number"
                    required
                    value={potassium}
                    onChange={(e) => setPotassium(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('soil_ph')} (0-14)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={ph}
                    onChange={(e) => setPh(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('moisture')} (%)</label>
                  <input
                    type="number"
                    required
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('organic_matter')} (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={organicCarbon}
                    onChange={(e) => setOrganicCarbon(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSoilModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSoil}
                  className="px-4 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  {isSubmittingSoil ? 'Saving...' : 'Save Soil Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{t('add_crop')}</h3>
              <button onClick={() => setShowCropModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCrop} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Crop Name</label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Wheat, Mustard, Soybean"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Variety / Cultivar</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Sharbati HD-2967"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Acreage (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={acreage}
                    onChange={(e) => setAcreage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Yield (Tons)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetYieldTons}
                    onChange={(e) => setTargetYieldTons(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('sown_on')}</label>
                  <input
                    type="date"
                    required
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('expected_harvest')}</label>
                  <input
                    type="date"
                    value={expectedHarvestDate}
                    onChange={(e) => setExpectedHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Sowing">Sowing</option>
                    <option value="Germination">Germination</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Maturity">Maturity</option>
                    <option value="Harvest Ready">Harvest Ready</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('water_req')}</label>
                  <select
                    value={waterRequirement}
                    onChange={(e) => setWaterRequirement(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observation Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sown after green manure incorporation..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCropModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCrop}
                  className="px-4 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  {isSubmittingCrop ? 'Saving...' : 'Add Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
