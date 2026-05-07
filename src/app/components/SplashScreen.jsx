import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/LogoUKM.svg';

const LOADING_MESSAGES = [
  'Menyiapkan workspace...',
  'Sinkronisasi data...',
  'Mengoptimalkan portal...',
  'Hampir siap!',
];

const SplashScreen = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <Motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        transition: { duration: 0.6, ease: "easeInOut" } 
      }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#4dbace] text-white overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <Motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] border border-white/5 rounded-full"
        />
        <Motion.div 
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-48 -right-48 w-[600px] h-[600px] border border-white/5 rounded-full"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-[280px] text-center">
        {/* Logo Animation */}
        <Motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-12"
        >
          <div className="bg-white p-7 rounded-[2rem] shadow-2xl flex items-center justify-center">
            <img 
              src={logo} 
              alt="Logo" 
              className="w-24 h-auto" 
            />
          </div>
          
          <Motion.div 
            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-[2rem] border-2 border-white/40 pointer-events-none"
          />
        </Motion.div>

        {/* Brand Name */}
        <Motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="mb-14"
        >
          <h1 className="text-2xl font-black tracking-[0.2em] uppercase mb-1">UKM Kemasan</h1>
          <div className="h-0.5 w-10 bg-white/40 mx-auto rounded-full"></div>
        </Motion.div>

        {/* Loading Text */}
        <div className="h-5 mb-8">
          <AnimatePresence mode="wait">
            <Motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-white font-bold text-[12px] tracking-widest uppercase"
            >
              {LOADING_MESSAGES[messageIndex]}
            </Motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <Motion.div 
            animate={{ x: ["-100%", "100%"] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="h-full bg-white w-1/3 rounded-full"
          />
        </div>
      </div>

      {/* Bottom Version Text */}
      <Motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 flex flex-col items-center gap-2"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Official Mobile App</p>
        <p className="text-[8px] opacity-70">v2.4.1 Build 2026</p>
      </Motion.div>
    </Motion.div>
  );
};

export default SplashScreen;
