import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Bell, Volume2, VolumeX, X, ExternalLink, ShieldCheck, ChevronRight, Info } from 'lucide-react';
import { api } from '../services/api';

// Synthesize pleasant emergency chime using standard Web Audio API
const playAlertChime = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch {
    // Audio context may require user gesture on first turn
  }
};

export default function LiveAlertBanner({ selectedDistrictId }) {
  const [alerts, setAlerts] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.alerts.getActive(selectedDistrictId || '')
      .then(data => {
        if (isMounted && data && data.length > 0) {
          setAlerts(data);
          setActiveAlert(data[0]);
        }
      })
      .catch(() => {
        // Fallback silently if offline
      });

    return () => { isMounted = false; };
  }, [selectedDistrictId]);

  // Rotate ticker every 9 seconds if multiple alerts exist
  useEffect(() => {
    if (alerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % alerts.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  if (alerts.length === 0 || isDismissed) {
    return null;
  }

  const alert = alerts[currentIdx] || alerts[0];
  const isRed = alert.severity === 'Red';
  const isOrange = alert.severity === 'Orange';

  const handleToggleSound = () => {
    if (!soundEnabled) {
      playAlertChime();
      setSoundEnabled(true);
    } else {
      setSoundEnabled(false);
    }
  };

  return (
    <>
      {/* Top Banner Strip */}
      <div className={`w-full text-xs font-sans transition-colors duration-300 border-b relative z-40 ${
        isRed 
          ? 'bg-gradient-to-r from-red-900 via-red-800 to-rose-950 text-white border-red-700/80 shadow-md' 
          : isOrange 
          ? 'bg-gradient-to-r from-amber-900 via-orange-850 to-amber-950 text-white border-orange-700/80 shadow-md' 
          : 'bg-[#071B33] text-slate-200 border-slate-700'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          
          {/* Severity Badge & Icon */}
          <div className="flex items-center gap-2.5 flex-grow min-w-0">
            <span className={`px-2 py-0.5 rounded font-black uppercase text-[10px] tracking-wider flex items-center gap-1 shadow-sm flex-shrink-0 animate-pulse ${
              isRed ? 'bg-red-500 text-white' : isOrange ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
            }`}>
              <AlertTriangle className="h-3 w-3" />
              <span>{alert.severity} ALERT</span>
            </span>

            <span className="text-[10px] font-mono text-slate-300 font-bold hidden sm:inline flex-shrink-0 border-r border-white/20 pr-2">
              {alert.source_agency}
            </span>

            <p className="truncate font-bold tracking-wide text-[11px] text-white">
              {alert.headline}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setActiveAlert(alert);
                setIsModalOpen(true);
              }}
              className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-md font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all border border-white/20 shadow-sm"
            >
              <span>Bulletin</span>
              <ChevronRight className="h-3 w-3" />
            </button>

            <button
              type="button"
              onClick={handleToggleSound}
              className={`p-1.5 rounded-md transition-colors ${soundEnabled ? 'bg-white/30 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              title={soundEnabled ? 'Mute Alert Sound' : 'Enable Alert Siren'}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-amber-300" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Dismiss Banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Official CAP Alert Details Modal */}
      {isModalOpen && activeAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 page-fade-in text-left font-sans">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className={`p-5 text-white flex justify-between items-start ${
              activeAlert.severity === 'Red' ? 'bg-red-700' : activeAlert.severity === 'Orange' ? 'bg-amber-600' : 'bg-[#071B33]'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
                    CAP VERIFIED BULLETIN
                  </span>
                  <span className="text-white/80 font-mono text-[10px]">{activeAlert.cap_identifier}</span>
                </div>
                <h3 className="text-base font-extrabold leading-tight">
                  {activeAlert.headline}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs leading-relaxed">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 font-semibold text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Severity</span>
                  <span className="font-extrabold text-red-600">{activeAlert.severity} Warning</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Agency</span>
                  <span className="text-navy-950 font-bold">{activeAlert.source_agency}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Target Area</span>
                  <span className="text-navy-950 font-bold">{activeAlert.district_name || 'Statewide'}, {activeAlert.state}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Verification</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" /> Verified
                  </span>
                </div>
              </div>

              {/* Area description */}
              {activeAlert.area_description && (
                <div className="space-y-1">
                  <span className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider block">
                    Affected Zones / Blocks
                  </span>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-slate-700 font-medium">
                    {activeAlert.area_description}
                  </div>
                </div>
              )}

              {/* Public Instructions */}
              <div className="space-y-1">
                <span className="font-extrabold text-[10px] text-red-600 uppercase tracking-wider block flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Mandatory Advisory & Instructions
                </span>
                <div className="bg-red-50/60 p-3.5 rounded-xl border border-red-200 text-red-950 font-medium leading-relaxed">
                  {activeAlert.instruction}
                </div>
              </div>

              {/* Bulletin Link */}
              {activeAlert.bulletin_url && (
                <div className="border-t border-slate-150 pt-3 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-medium">Official Government Source:</span>
                  <a
                    href={activeAlert.bulletin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>View Official Portal</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-navy-950 text-white rounded-xl text-xs font-bold hover:bg-navy-900 transition-colors shadow-sm"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

