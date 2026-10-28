import React, { createContext, useContext, useState, useEffect } from 'react';
import { Farm, Crop, SoilRecord, WeatherData, PestAlert } from '../types';
import { LanguageCode, translations } from '../i18n/translations';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface FarmContextType {
  farms: Farm[];
  activeFarm: Farm | null;
  crops: Crop[];
  soilLogs: SoilRecord[];
  weather: WeatherData | null;
  pestAlerts: PestAlert[];
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  setActiveFarmId: (id: string) => void;
  refreshFarms: () => Promise<void>;
  refreshCrops: () => Promise<void>;
  refreshSoil: () => Promise<void>;
  refreshWeather: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
  loading: boolean;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarmId, setActiveFarmId] = useState<string>('');
  const [crops, setCrops] = useState<Crop[]>([]);
  const [soilLogs, setSoilLogs] = useState<SoilRecord[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [pestAlerts, setPestAlerts] = useState<PestAlert[]>([]);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [loading, setLoading] = useState<boolean>(true);

  // Translation helper
  const t = (key: string): string => {
    const langDict = translations[language] || translations['en'];
    return langDict[key] || translations['en'][key] || key;
  };

  const refreshFarms = async () => {
    try {
      const data = await api.getFarms();
      setFarms(data);
      if (data.length > 0 && !activeFarmId) {
        setActiveFarmId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load farms:', err);
    }
  };

  const refreshCrops = async () => {
    try {
      const data = await api.getCrops(activeFarmId || undefined);
      setCrops(data);
    } catch (err) {
      console.error('Failed to load crops:', err);
    }
  };

  const refreshSoil = async () => {
    try {
      const data = await api.getSoilLogs(activeFarmId || undefined);
      setSoilLogs(data);
    } catch (err) {
      console.error('Failed to load soil records:', err);
    }
  };

  const refreshWeather = async () => {
    const active = farms.find((f) => f.id === activeFarmId) || farms[0];
    const lat = active ? active.location.latitude : 22.5645;
    const lon = active ? active.location.longitude : 72.9289;
    const city = active ? `${active.location.district}, ${active.location.state}` : 'Anand, Gujarat';

    try {
      const data = await api.getWeather(lat, lon, city);
      setWeather(data);
    } catch (err) {
      console.error('Failed to load weather:', err);
    }
  };

  const refreshAlerts = async () => {
    try {
      const data = await api.getPestAlerts();
      setPestAlerts(data);
    } catch (err) {
      console.error('Failed to load pest alerts:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.allSettled([
        refreshFarms(),
        refreshAlerts(),
      ]);
      setLoading(false);
    };
    loadAll();
  }, [user]);

  useEffect(() => {
    if (activeFarmId) {
      refreshCrops();
      refreshSoil();
      refreshWeather();
    }
  }, [activeFarmId]);

  const activeFarm = farms.find((f) => f.id === activeFarmId) || farms[0] || null;

  return (
    <FarmContext.Provider
      value={{
        farms,
        activeFarm,
        crops,
        soilLogs,
        weather,
        pestAlerts,
        language,
        setLanguage,
        t,
        setActiveFarmId,
        refreshFarms,
        refreshCrops,
        refreshSoil,
        refreshWeather,
        refreshAlerts,
        loading,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
