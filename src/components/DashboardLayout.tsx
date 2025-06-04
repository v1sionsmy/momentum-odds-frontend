import React from 'react';
import Image from 'next/image';
import { Card } from './ui/card';

interface DashboardLayoutProps {
  topBar?: React.ReactNode;
  leftSidebar?: React.ReactNode;
  oddsMiniTicker?: React.ReactNode;
  liveOddsPanel?: React.ReactNode;
  momentumMatchPanel?: React.ReactNode;
  playerPropEdgesPanel?: React.ReactNode;
  momentumBox?: React.ReactNode;
}

export function DashboardLayout({
  topBar,
  leftSidebar,
  oddsMiniTicker,
  liveOddsPanel,
  momentumMatchPanel,
  playerPropEdgesPanel,
  momentumBox,
}: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0B0E11] to-[#0F1318] flex flex-col">
      {/* Top Bar with Mini Ticker */}
      <div className="z-20 w-full sticky top-0 bg-[#0B0E11]/95 backdrop-blur-sm border-b border-[#1A1F26] shadow-lg">
        {topBar}
        {oddsMiniTicker && (
          <div className="px-4 py-2 bg-[#0F1318] border-t border-[#1A1F26]">
            {oddsMiniTicker}
          </div>
        )}
      </div>

      <div className="flex flex-1 w-full">
        {/* Left Sidebar with improved styling */}
        {leftSidebar && (
          <aside className="z-10 w-72 bg-[#0F1318]/95 backdrop-blur-sm border-r border-[#1A1F26] hidden md:block shadow-lg">
            <div className="h-full flex flex-col">
              {leftSidebar}
            </div>
          </aside>
        )}

        {/* Main Content Area with Momentum Box */}
        <main className="relative flex-1 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0B0E11] via-[#0F1318] to-[#0B0E11] p-8">
          {momentumBox ? (
            <div className="relative z-20 w-full max-w-4xl h-full flex items-center justify-center">
              {momentumBox}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-80">
              <Image
                src="/momentum-odds-logo.png"
                alt="Momentum Odds Logo"
                width={400}
                height={400}
                className="opacity-100"
                priority
              />
            </div>
          )}
        </main>

        {/* Right Sidebar with improved panel styling */}
        <aside className="z-10 w-96 bg-[#0F1318]/95 backdrop-blur-sm border-l border-[#1A1F26] flex flex-col h-full hidden lg:flex shadow-lg">
          <div className="flex-1 flex flex-col gap-4 p-4">
            {/* Live Odds Panel */}
            {liveOddsPanel && (
              <Card className="bg-[#0F1318] border-[#1A1F26] shadow-lg">
                <div className="p-4">{liveOddsPanel}</div>
              </Card>
            )}

            {/* Momentum Match Panel */}
            {momentumMatchPanel && (
              <Card className="bg-[#0F1318] border-[#1A1F26] shadow-lg flex-1">
                <div className="p-4 h-full flex items-center justify-center">
                  {momentumMatchPanel}
                </div>
              </Card>
            )}

            {/* Player Prop Edges Panel */}
            {playerPropEdgesPanel && (
              <Card className="bg-[#0F1318] border-[#1A1F26] shadow-lg">
                <div className="p-4">{playerPropEdgesPanel}</div>
              </Card>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
} 