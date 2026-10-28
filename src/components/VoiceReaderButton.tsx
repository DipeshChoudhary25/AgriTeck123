import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

interface VoiceReaderButtonProps {
  textToRead: string;
  className?: string;
  label?: string;
}

export const VoiceReaderButton: React.FC<VoiceReaderButtonProps> = ({
  textToRead,
  className = '',
  label,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { language, t } = useFarm();

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(textToRead);

    // Map language code to BCP 47 language tag
    const langMap: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      pa: 'pa-IN',
      mr: 'mr-IN',
      te: 'te-IN',
      es: 'es-ES',
    };

    utterance.lang = langMap[language] || 'en-US';
    utterance.rate = 0.95; // Slightly slower for clarity

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
        isSpeaking
          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
      } ${className}`}
      title={isSpeaking ? t('stop_audio') : t('read_aloud')}
      aria-label={isSpeaking ? t('stop_audio') : t('read_aloud')}
    >
      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
      <span className="whitespace-nowrap">{isSpeaking ? t('stop_audio') : label || t('read_aloud')}</span>
    </button>
  );
};
