import { useEffect } from 'react';

interface MomentumFlashProps {
  hex: string;          // team or player colour
  momentum: number;     // 0-1
  className?: string;
}

// clamp between 0.25 s (blazing) and 2 s (slow)
const cadence = (m: number) => 2 - (m * 1.75);

export default function MomentumFlash({ hex, momentum, className = '' }: MomentumFlashProps) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--flash-colour', hex);
    root.style.setProperty('--flash-duration', `${cadence(momentum)}s`);
  }, [hex, momentum]);

  return <div className={`momentum-overlay pointer-events-none ${className}`} />;
} 