'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  duration?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.55,
  once = true,
}: ScrollRevealProps) {
  // Normalize ms to seconds if passed as ms (e.g. 100 -> 0.1)
  const normalizedDelay = delay > 10 ? delay / 1000 : delay;
  const normalizedDuration = duration > 10 ? duration / 1000 : duration;

  const getInitial = () => {
    switch (direction) {
      case 'up': return { opacity: 0, y: 24 };
      case 'down': return { opacity: 0, y: -24 };
      case 'left': return { opacity: 0, x: -30 };
      case 'right': return { opacity: 0, x: 30 };
      case 'scale': return { opacity: 0, scale: 0.95 };
      default: return { opacity: 0, y: 24 };
    }
  };

  const getAnimate = () => {
    switch (direction) {
      case 'scale': return { opacity: 1, scale: 1 };
      case 'left':
      case 'right': return { opacity: 1, x: 0 };
      default: return { opacity: 1, y: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={getAnimate()}
      viewport={{ once, amount: 0.05 }}
      transition={{
        duration: normalizedDuration,
        delay: normalizedDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

