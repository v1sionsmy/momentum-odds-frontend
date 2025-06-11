"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MomentumOddsHeader from '@/components/MomentumOddsHeader';

export default function SportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <MomentumOddsHeader />
      
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Sports Analytics
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time momentum analytics and insights across major sports leagues
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* NBA - Available */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 shadow-xl"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">NBA</h2>
              <p className="text-green-100 mb-6">
                Live momentum tracking, player analytics, and real-time insights
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-white text-green-800 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Access NBA Dashboard
              </Link>
            </div>
          </motion.div>

          {/* WNBA - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-xl relative overflow-hidden"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">WNBA</h2>
              <p className="text-purple-100 mb-6">
                Advanced analytics for women's professional basketball
              </p>
              <Link
                href="/sports/wnba"
                className="inline-block bg-purple-300 text-purple-800 font-semibold px-6 py-3 rounded-lg hover:bg-purple-200 transition-colors"
              >
                Coming Soon
              </Link>
            </div>
            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
              SOON
            </div>
          </motion.div>

          {/* NFL - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-xl relative overflow-hidden"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">NFL</h2>
              <p className="text-blue-100 mb-6">
                Game-changing momentum insights for professional football
              </p>
              <Link
                href="/sports/nfl"
                className="inline-block bg-blue-300 text-blue-800 font-semibold px-6 py-3 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Coming Soon
              </Link>
            </div>
            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
              SOON
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-400 mb-3">Real-Time Analytics</h3>
              <p className="text-gray-300">Live momentum tracking with millisecond precision</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-400 mb-3">Predictive Insights</h3>
              <p className="text-gray-300">AI-powered predictions based on momentum patterns</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-400 mb-3">Professional Grade</h3>
              <p className="text-gray-300">Enterprise-level data accuracy and reliability</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 