import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Database,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';
import { UserDocument } from '../types/gym';
import { exportAppData, importAppData } from '../utils/storage';
import { PWAInstallButton } from './PWAInstallButton';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDocument;
  onSaveUser: (user: UserDocument) => void;
  onDataImported: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveUser,
  onDataImported
}) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [email, setEmail] = useState(user.email);
  const [weightKg, setWeightKg] = useState(user.weightKg || 75);
  const [heightCm, setHeightCm] = useState(user.heightCm || 175);
  const [experienceLevel, setExperienceLevel] = useState(user.experienceLevel || 'Menengah');
  const [restTimerDefault, setRestTimerDefault] = useState(user.preferences.restTimerDefault);
  const [soundEnabled, setSoundEnabled] = useState(user.preferences.soundEnabled);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showSqlCopied, setShowSqlCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: UserDocument = {
      ...user,
      displayName: displayName.trim() || 'Atlet IronLog',
      email: email.trim(),
      weightKg: Number(weightKg) || 75,
      heightCm: Number(heightCm) || 175,
      experienceLevel,
      preferences: {
        ...user.preferences,
        restTimerDefault,
        soundEnabled
      }
    };
    onSaveUser(updated);
    onClose();
  };

  const handleExport = () => {
    const jsonStr = exportAppData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ironlog-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importAppData(content);
      if (success) {
        setImportStatus('Data berhasil diimpor!');
        setTimeout(() => {
          setImportStatus(null);
          onDataImported();
          onClose();
        }, 1200);
      } else {
        setImportStatus('Gagal membaca file backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  const copySupabaseInfo = () => {
    navigator.clipboard?.writeText(
      'Skema Supabase telah disiapkan di file /supabase/schema.sql dengan tabel profiles, exercises, routines, dan sessions serta RLS.'
    );
    setShowSqlCopied(true);
    setTimeout(() => setShowSqlCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col max-h-[90vh] text-left">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Profil & Pengaturan</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* User Basic Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Data Diri</h4>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-lime-400 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Berat Badan (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={e => setWeightKg(Number(e.target.value))}
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 font-mono text-sm text-white focus:outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tinggi Badan (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={e => setHeightCm(Number(e.target.value))}
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 font-mono text-sm text-white focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Tingkat Pengalaman</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Pemula', 'Menengah', 'Lanjutan'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-2 text-xs font-medium rounded-xl border transition ${
                      experienceLevel === lvl
                        ? 'border-lime-400 bg-lime-400/10 text-lime-400 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rest Timer Preferences */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pengaturan Timer Istirahat</h4>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2.5">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-lime-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-500" />
                )}
                <div>
                  <span className="text-xs font-semibold text-white block">Suara Timer Istirahat</span>
                  <span className="text-[11px] text-slate-500">Hitung mundur 3, 2, 1 dan bel selesai</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  soundEnabled ? 'bg-lime-400' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${
                    soundEnabled ? 'translate-x-6.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Durasi Default Istirahat</label>
              <div className="grid grid-cols-4 gap-2">
                {[60, 90, 120, 180].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRestTimerDefault(s)}
                    className={`py-2 rounded-xl text-xs font-mono font-semibold border transition ${
                      restTimerDefault === s
                        ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Database & Supabase Blueprint info */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Arsitektur Database Supabase</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold">Siap Pakai</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Skema DDL lengkap untuk Supabase telah dibuat di <code className="text-emerald-400 font-mono">/supabase/schema.sql</code> (tabel profiles, exercises, routines, sessions + RLS). Sesuai instruksi, database live belum dijalankan.
            </p>
            <button
              onClick={copySupabaseInfo}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white pt-1"
            >
              {showSqlCopied ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{showSqlCopied ? 'Info Tersalin!' : 'Salin Catatan Skema Supabase'}</span>
            </button>
          </div>

          {/* Backup & Portability */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cadangkan & Pulihkan Data</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Download className="w-4 h-4 text-lime-400" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Import JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
            {importStatus && (
              <p className="text-xs text-center text-lime-400 font-semibold">{importStatus}</p>
            )}
          </div>

          {/* PWA & Offline Status */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-lime-400" />
                <span className="text-xs font-semibold text-white">Mode Offline & PWA</span>
              </div>
              <span className="text-[11px] text-lime-400 font-bold">Aktif</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              IronLog menyimpan seluruh rutinitas dan riwayat secara lokal di perangkat Anda. Berolahraga di gym tanpa sinyal internet tetap lancar.
            </p>
            <div className="pt-1">
              <PWAInstallButton />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-700"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-lime-400 text-slate-950 font-bold text-xs hover:bg-lime-300"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
