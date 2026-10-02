import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        aria-label="Install App"
        className={`flex items-center gap-2 rounded-xl bg-lime-400 text-slate-950 font-bold transition hover:bg-lime-300 active:scale-95 shadow-md shadow-lime-400/20 ${
          compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'
        }`}
      >
        <Download className="w-4 h-4 shrink-0" />
        <span className="whitespace-nowrap">Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label="Install on iPhone / iPad"
          className={`flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-medium transition hover:bg-slate-700 active:scale-95 ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs'
          }`}
        >
          <Smartphone className="w-4 h-4 text-lime-400 shrink-0" />
          <span className="whitespace-nowrap">Install di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-left">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center mb-3">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Pasang di iPhone / iPad</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Untuk performa offline maksimal dan tampilan aplikasi penuh tanpa browser bar:
              </p>
              <ol className="mt-3 space-y-2 text-xs text-slate-300 list-decimal list-inside bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <li>Buka di browser <strong>Safari</strong>.</li>
                <li>Ketuk ikon <strong>Share</strong> (kotak panah ke atas di bawah).</li>
                <li>Pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-lime-400 py-2.5 text-xs font-bold text-slate-950 hover:bg-lime-300 transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
