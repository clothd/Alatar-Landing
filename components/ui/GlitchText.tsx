'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import styles from './GlitchText.module.css';

interface GlitchTextProps {
  children: ReactNode;
  className?: string;
  minDelay?: number; // Minimum delay in ms before next glitch
  maxDelay?: number; // Maximum delay in ms before next glitch
}

const GlitchText: React.FC<GlitchTextProps> = ({
  children,
  className = '',
  minDelay = 1000, // Default min delay 1 second
  maxDelay = 5000, // Default max delay 5 seconds
}) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const triggerGlitch = () => {
      setIsGlitching(true);
      // Duration of the glitch effect itself (short)
      setTimeout(() => {
        setIsGlitching(false);
      }, 200); // Glitch lasts for 200ms

      // Schedule the next glitch
      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      timeoutId = setTimeout(triggerGlitch, randomDelay);
    };

    // Start the first glitch after a random delay
    const initialDelay = Math.random() * (maxDelay - minDelay) + minDelay;
    timeoutId = setTimeout(triggerGlitch, initialDelay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [minDelay, maxDelay]);

  return (
    <span className={`${styles.glitchText} ${isGlitching ? styles.glitching : ''} ${className}`}>
      {children}
      {isGlitching && (
        <>
          <span className={styles.glitchLayer1} aria-hidden="true">{children}</span>
          <span className={styles.glitchLayer2} aria-hidden="true">{children}</span>
        </>
      )}
    </span>
  );
};

export default GlitchText;