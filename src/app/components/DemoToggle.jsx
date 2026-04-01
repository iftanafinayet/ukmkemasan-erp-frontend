import React from 'react';
import { Database, HardDrive, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DemoToggle({ useMockData, onToggle }) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 w-64 transition-all hover:shadow-primary/10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sumber Data</span>
            <div className={`w-2 h-2 rounded-full animate-pulse ${useMockData ? 'bg-orange-500' : 'bg-green-500'}`} />
          </div>
          
          <button
            onClick={onToggle}
            className={`flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
              useMockData
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'bg-primary text-white shadow-lg shadow-primary/20' 
            }`}
          >
            {useMockData ? (
              <>
                <HardDrive className="w-4 h-4" />
                <span>Mode Demo</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Real API (v1.0)</span>
              </>
            )}
          </button>
        </div>
        
        <div className="flex items-start gap-2 mt-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
          <Info size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            {useMockData
              ? 'Data simulasi aktif. Cocok untuk presentasi desain tanpa perlu koneksi database.'
              : 'Sinkronisasi aktif ke MongoDB. Menggunakan token autentikasi real.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}