import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Compass,
  Droplets,
  Layers,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { Farm } from '../types';
import { api } from '../services/api';

export const FarmProfileView: React.FC = () => {
  const { farms, activeFarm, setActiveFarmId, refreshFarms, t } = useFarm();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [sizeAcres, setSizeAcres] = useState('');
  const [soilType, setSoilType] = useState<Farm['soilType']>('Alluvial');
  const [irrigationType, setIrrigationType] = useState<Farm['irrigationType']>('Drip Irrigation');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [latitude, setLatitude] = useState('22.5645');
  const [longitude, setLongitude] = useState('72.9289');
  const [primaryCrops, setPrimaryCrops] = useState('Wheat, Mustard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setSizeAcres('');
    setSoilType('Alluvial');
    setIrrigationType('Drip Irrigation');
    setVillage('');
    setDistrict('');
    setState('');
    setLatitude('22.5645');
    setLongitude('72.9289');
    setPrimaryCrops('Wheat, Mustard');
    setEditingFarm(null);
  };

  const handleOpenEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setName(farm.name);
    setSizeAcres(farm.sizeAcres.toString());
    setSoilType(farm.soilType);
    setIrrigationType(farm.irrigationType);
    setVillage(farm.location.village);
    setDistrict(farm.location.district);
    setState(farm.location.state);
    setLatitude(farm.location.latitude.toString());
    setLongitude(farm.location.longitude.toString());
    setPrimaryCrops(farm.primaryCrops.join(', '));
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sizeAcres) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<Farm> = {
        name,
        sizeAcres: parseFloat(sizeAcres) || 5,
        soilType,
        irrigationType,
        location: {
          village: village || 'Local Village',
          district: district || 'Central District',
          state: state || 'Gujarat',
          latitude: parseFloat(latitude) || 22.5645,
          longitude: parseFloat(longitude) || 72.9289,
        },
        primaryCrops: primaryCrops.split(',').map((c) => c.trim()).filter(Boolean),
      };

      if (editingFarm) {
        await api.updateFarm(editingFarm.id, payload);
      } else {
        await api.createFarm(payload);
      }

      await refreshFarms();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving farm parcel:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this farm parcel record?')) {
      try {
        await api.deleteFarm(id);
        await refreshFarms();
      } catch (err) {
        console.error('Error deleting farm:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Land Management</span>
          <h2 className="text-2xl font-bold text-slate-900">{t('farm_parcels')}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure land acreage, soil classifications, and GPS coordinates for precision microclimate tracking.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shadow-xs self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>{t('add_new_parcel')}</span>
        </button>
      </div>

      {/* Parcels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {farms.map((farm) => {
          const isActive = activeFarm?.id === farm.id;
          return (
            <div
              key={farm.id}
              className={`bg-white rounded-xl border transition-all p-6 ${
                isActive
                  ? 'border-emerald-600 shadow-sm ring-1 ring-emerald-600/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{farm.name}</h3>
                    {isActive && (
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {farm.location.village}, {farm.location.district}, {farm.location.state}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(farm)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                    title="Edit Parcel"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {farms.length > 1 && (
                    <button
                      onClick={() => handleDelete(farm.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Parcel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Data specifications */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 text-[11px] block">{t('total_area')}</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{farm.sizeAcres} Acres</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 text-[11px] block">{t('soil_category')}</span>
                  <span className="font-semibold text-slate-900">{farm.soilType}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 text-[11px] block">{t('irrigation_source')}</span>
                  <span className="font-semibold text-slate-900">{farm.irrigationType}</span>
                </div>
              </div>

              {/* GPS Coordinates & Map link */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {farm.location.latitude.toFixed(4)}° N, {farm.location.longitude.toFixed(4)}° E
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!isActive && (
                    <button
                      onClick={() => setActiveFarmId(farm.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                    >
                      Switch Active
                    </button>
                  )}
                </div>
              </div>

              {/* Primary Crops tags */}
              <div className="mt-3 flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-slate-400 text-[11px]">Crops:</span>
                {farm.primaryCrops.map((crop, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                    {crop}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated GIS & Satellite Field Boundary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GIS Cadastral Map</span>
            <h3 className="text-base font-bold text-slate-900">Field Boundary & Elevation Model</h3>
          </div>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Precision GPS Sync
          </span>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-21/9 flex items-center justify-center border border-slate-800">
          <img
            src="/src/assets/images/hero_smart_agriculture_1793208169872.jpg"
            alt="Field GIS overview"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60"
          />

          {/* Map Overlay Polygon */}
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-950/40">
            <div className="p-4 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 text-slate-900 max-w-md shadow-lg text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-sm">
                <span>{activeFarm?.name}</span>
                <span className="font-mono text-emerald-700">{activeFarm?.sizeAcres} Acres</span>
              </div>
              <div className="text-slate-600">
                Lat: <span className="font-mono">{activeFarm?.location.latitude}</span> · Long: <span className="font-mono">{activeFarm?.location.longitude}</span>
              </div>
              <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                Cadastral parcel verified with local irrigation channel access and multi-spectral vegetation index (NDVI: 0.74).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Parcel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingFarm ? t('edit_parcel') : t('add_new_parcel')}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Farm Parcel Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Green Valley Agro Field 3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('total_area')}</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={sizeAcres}
                    onChange={(e) => setSizeAcres(e.target.value)}
                    placeholder="e.g. 12.5"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('soil_category')}</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Alluvial">Alluvial Soil</option>
                    <option value="Black Soil">Black Soil (Regur)</option>
                    <option value="Red & Yellow">Red & Yellow</option>
                    <option value="Clayey Loam">Clayey Loam</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('irrigation_source')}</label>
                <select
                  value={irrigationType}
                  onChange={(e) => setIrrigationType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="Drip Irrigation">Drip Irrigation (Micro-irrigation)</option>
                  <option value="Canal Water">Canal Water Grid</option>
                  <option value="Sprinkler">Sprinkler System</option>
                  <option value="Borewell / Tube Well">Borewell / Tube Well</option>
                  <option value="Rainfed">Rainfed / Dryland</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Village</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Boriavi"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Anand"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Gujarat"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GPS Latitude</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="22.5645"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GPS Longitude</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="72.9289"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('primary_crops_grown')}</label>
                <input
                  type="text"
                  value={primaryCrops}
                  onChange={(e) => setPrimaryCrops(e.target.value)}
                  placeholder="Wheat, Mustard, Chickpeas"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : editingFarm ? 'Save Changes' : 'Create Parcel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
