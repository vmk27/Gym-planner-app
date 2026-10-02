import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside aria-label="Status Koneksi" className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 flex items-center justify-between gap-3 rounded-xl bg-amber-500/90 text-slate-950 backdrop-blur-md px-4 py-2.5 text-xs font-semibold shadow-xl border border-amber-400">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span>Mode Offline Aktif — Data tersimpan aman di perangkat lokal.</span>
      </div>
      <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping shrink-0" />
    </aside>
  );
};
