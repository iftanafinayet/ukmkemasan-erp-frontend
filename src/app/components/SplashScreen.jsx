import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/LogoUKM.svg';

const SplashScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="flex flex-col items-center"
      >
        <img 
          src={logo} 
          alt="UKM Kemasan Logo" 
          className="w-48 h-auto" 
        />
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
