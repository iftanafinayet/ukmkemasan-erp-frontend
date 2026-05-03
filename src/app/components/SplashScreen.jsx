import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/LogoUKM.svg';

const LOADING_MESSAGES = [
  'Menyiapkan workspace Anda...',
  'Sinkronisasi data inventaris...',
  'Mengoptimalkan tampilan portal...',
  'Hampir siap!',
];

const SplashScreen = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
      }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#4dbace] text-white overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 1 }}
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" 
        />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="relative mb-8"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="bg-white p-6 rounded-3xl shadow-2xl"
          >
            <img 
              src={logo} 
              alt="UKM Kemasan Logo" 
              className="w-40 h-auto" 
            />
          </motion.div>
          
          {/* Logo Pulse Ring */}
          <motion.div 
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-3xl border-4 border-white/30 -m-4 pointer-events-none"
          />
        </motion.div>

        {/* Loading Text */}
        <div className="h-6 mb-12">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-white/80 font-medium text-sm tracking-wide"
            >
              {LOADING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="h-full bg-white rounded-full"
          />
        </div>
      </div>

      {/* Bottom Version Text */}
      <div className="absolute bottom-8 text-white/40 text-[10px] font-bold uppercase tracking-widest">
        Powered by ERP UKM Kemasan v1.0
      </div>
    </motion.div>
  );
};

export default SplashScreen;
