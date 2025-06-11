"use client";
import React, { useState } from "react";
import { Menu, X, ChevronDown, Clock, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Sports", path: "/sports" },
  { name: "NBA", path: "/dashboard" },
  { name: "WNBA", path: "/sports/wnba" },
  { name: "NFL", path: "/sports/nfl" }
];

interface Game {
  id: number;
  away_team: string;
  home_team: string;
  away_score?: number;
  home_score?: number;
  timeUntilGame?: string;
  formattedDate?: string;
  status?: string;
}

interface MomentumOddsHeaderProps {
  liveGames?: Game[];
  upcomingGames?: Game[];
  onGameSelect?: (gameId: number) => void;
  selectedGameId?: number | null;
}

export default function MomentumOddsHeader({ 
  liveGames = [], 
  upcomingGames = [], 
  onGameSelect,
  selectedGameId 
}: MomentumOddsHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [gamesDropdownOpen, setGamesDropdownOpen] = useState(false);
  const pathname = usePathname();
  
  const toggleMobile = () => setMobileOpen(!mobileOpen);
  const toggleGamesDropdown = () => setGamesDropdownOpen(!gamesDropdownOpen);

  const selectedGame = [...liveGames, ...upcomingGames].find(game => game.id === selectedGameId);
  const totalGames = liveGames.length + upcomingGames.length;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-gray-900/80 border-b border-gray-700">
      {/* Main Nav Bar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8"
      >
        {/* Left: Games Dropdown (only show on dashboard) */}
        <div className="flex items-center">
          {pathname === '/dashboard' && (
            <div className="relative">
              <button
                onClick={toggleGamesDropdown}
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <span className="text-white font-medium">
                  {selectedGame ? `${selectedGame.away_team} @ ${selectedGame.home_team}` : 'Select Game'}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-300 transition-transform ${gamesDropdownOpen ? 'rotate-180' : ''}`} />
                {totalGames > 0 && (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    {totalGames}
                  </span>
                )}
              </button>

              {/* Games Dropdown */}
              <AnimatePresence>
                {gamesDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
                  >
                    <div className="max-h-96 overflow-y-auto">
                      {/* Live Games */}
                      {liveGames.length > 0 && (
                        <div>
                          <div className="bg-red-900/30 px-4 py-2 border-b border-gray-700">
                            <div className="flex items-center space-x-2">
                              <Circle className="h-2 w-2 text-red-500 fill-current animate-pulse" />
                              <span className="text-red-400 font-semibold text-sm">LIVE GAMES ({liveGames.length})</span>
                            </div>
                          </div>
                          {liveGames.map(game => (
                            <button
                              key={`live-${game.id}`}
                              onClick={() => {
                                onGameSelect?.(game.id);
                                setGamesDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700/50 ${
                                selectedGameId === game.id ? 'bg-red-900/20' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-white font-medium">
                                    {game.away_team} @ {game.home_team}
                                  </div>
                                  <div className="text-sm text-gray-300">
                                    {game.away_score} - {game.home_score}
                                  </div>
                                </div>
                                <Circle className="h-2 w-2 text-red-500 fill-current animate-pulse" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Upcoming Games */}
                      {upcomingGames.length > 0 && (
                        <div>
                          <div className="bg-blue-900/30 px-4 py-2 border-b border-gray-700">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-blue-400" />
                              <span className="text-blue-400 font-semibold text-sm">UPCOMING GAMES ({upcomingGames.length})</span>
                            </div>
                          </div>
                          {upcomingGames.map(game => (
                            <button
                              key={`upcoming-${game.id}`}
                              onClick={() => {
                                onGameSelect?.(game.id);
                                setGamesDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-b-0 ${
                                selectedGameId === game.id ? 'bg-blue-900/20' : ''
                              }`}
                            >
                              <div>
                                <div className="text-white font-medium">
                                  {game.away_team} @ {game.home_team}
                                </div>
                                <div className="text-sm text-blue-300">
                                  {game.formattedDate} • {game.timeUntilGame}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {totalGames === 0 && (
                        <div className="px-4 py-6 text-center text-gray-400">
                          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No games available</p>
                          <p className="text-xs text-gray-500">Check back later</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/MomentumoddsLogo.png"
              alt="Momentum Odds Logo"
              width={160}
              height={80}
              className="h-20 w-auto select-none"
            />
          </Link>
        </div>

        {/* Right: Navigation */}
        <div className="flex items-center">
          {/* Desktop Navigation */}
          <ul className="hidden gap-8 lg:flex">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`text-sm font-semibold tracking-wide transition-colors ${
                    pathname === item.path
                      ? "text-green-400"
                      : "text-gray-100 hover:text-green-300"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobile}
            className="rounded-md p-2 text-gray-100 hover:bg-gray-800 lg:hidden ml-4"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 px-6 py-4 lg:hidden border-t border-gray-700"
          >
            <ul className="flex flex-col gap-4">
              {navItems.map((item) => (
                <li key={item.name} onClick={toggleMobile}>
                  <Link
                    href={item.path}
                    className={`block rounded py-2 text-sm font-semibold tracking-wide transition-colors ${
                      pathname === item.path
                        ? "text-green-400"
                        : "text-gray-100 hover:text-green-300"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdowns */}
      {(gamesDropdownOpen || mobileOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setGamesDropdownOpen(false);
            setMobileOpen(false);
          }}
        />
      )}
    </header>
  );
} 