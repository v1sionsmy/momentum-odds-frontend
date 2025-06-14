import { useEffect } from 'react';

interface MomentumFlashProps {
  hex: string;          // team or player colour
  momentum: number;     // 0-1
  className?: string;
}

// Fixed cadence calculation: clamp between 0.25s (blazing) and 2s (slow)
// Ensures momentum values > 1.14 don't create negative durations
const cadence = (m: number) => {
  // Clamp momentum between 0 and 1 to prevent negative durations
  const clampedMomentum = Math.min(Math.max(m, 0), 1);
  return 2 - (clampedMomentum * 1.75);
};

// Determine animation intensity based on momentum level
const getIntensityClass = (momentum: number) => {
  if (momentum >= 0.7) return 'intense';
  if (momentum >= 0.3) return 'moderate';
  return 'low';
};

export default function MomentumFlash({ hex, momentum, className = '' }: MomentumFlashProps) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--flash-colour', hex);
    root.style.setProperty('--flash-duration', `${cadence(momentum)}s`);
    
    // Debug logging for momentum flash
    console.log('🔥 Momentum Flash Update:', {
      hex,
      momentum: momentum.toFixed(3),
      duration: `${cadence(momentum)}s`,
      intensity: getIntensityClass(momentum),
      isFlashing: momentum > 0.1
    });
  }, [hex, momentum]);

  const intensityClass = getIntensityClass(momentum);

  return (
    <div 
      className={`momentum-overlay pointer-events-none ${intensityClass} ${className}`}
      data-momentum-level={intensityClass}
    />
  );
} 