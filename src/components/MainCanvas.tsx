import React from 'react';
import Image from 'next/image';
import MomentumFlash from './MomentumFlash';

interface MainCanvasProps {
  flashHex?: string;
  momentum?: number;
  showFlash?: boolean;
  watermarkLogo?: string;
  children?: React.ReactNode;
}

export default function MainCanvas({ 
  flashHex = '#ffffff', 
  momentum = 0,
  showFlash = false,
  watermarkLogo = '/MomentumoddsLogo.png',
  children 
}: MainCanvasProps) {
  return (
    <div className="relative grow flex items-center justify-center bg-gray-800 overflow-hidden">
      {/* Momentum Flash Overlay */}
      {showFlash && <MomentumFlash hex={flashHex} momentum={momentum} />}
      
      {/* Watermark Logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src={watermarkLogo}
          alt="Momentum Odds"
          width={400}
          height={240}
          className="opacity-10 pointer-events-none"
          priority
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center text-white">
        {children || (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Feel the Game</h2>
            <p className="text-gray-300 max-w-md">
              Watch the pulse of momentum flow through every play, 
              every shot, every momentum shift.
            </p>
          </div>
        )}
      </div>

      {/* Subtle grid pattern overlay for texture */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
    </div>
  );
} 