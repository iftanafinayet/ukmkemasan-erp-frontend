import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export const Reveal = ({ children, delay = 0, duration = 0.6 }) => {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (inView) setIsVisible(true);
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: [0.16, 1, 0.3, 1] 
      }}
    >
      {children}
    </motion.div>
  );
};
