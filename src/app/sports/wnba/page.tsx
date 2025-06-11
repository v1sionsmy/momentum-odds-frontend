"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import MomentumOddsHeader from '@/components/MomentumOddsHeader';

export default function WNBAPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-gray-900">
      <MomentumOddsHeader />
      
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Image
              src="/MomentumoddsLogo.png"
              alt="Momentum Odds Logo"
              width={192}
              height={96}
              className="h-24 w-auto mx-auto"
            />
          </motion.div>

          {/* Coming Soon Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-block bg-yellow-400 text-purple-900 font-bold px-6 py-2 rounded-full text-lg mb-6"
          >
            COMING SOON
          </motion.div>

          {/* Main Content */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            WNBA Analytics
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-xl text-purple-100 mb-8 leading-relaxed"
          >
            We&apos;re bringing our cutting-edge momentum analytics to women&apos;s professional basketball. 
            Get ready for real-time insights, player momentum tracking, and predictive analytics 
            for the WNBA season.
          </motion.p>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-purple-800/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-2">Live Game Analytics</h3>
              <p className="text-purple-200 text-sm">Real-time momentum tracking during games</p>
            </div>
            <div className="bg-purple-800/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-2">Player Insights</h3>
              <p className="text-purple-200 text-sm">Individual performance momentum analysis</p>
            </div>
            <div className="bg-purple-800/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-2">Team Dynamics</h3>
              <p className="text-purple-200 text-sm">Advanced team momentum correlations</p>
            </div>
            <div className="bg-purple-800/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-2">Predictive Models</h3>
              <p className="text-purple-200 text-sm">AI-powered game outcome predictions</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/dashboard"
              className="bg-white text-purple-800 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Try NBA Analytics Now
            </Link>
            <Link
              href="/sports"
              className="border border-purple-300 text-purple-100 font-semibold px-8 py-3 rounded-lg hover:bg-purple-800/50 transition-colors"
            >
              Back to Sports
            </Link>
          </motion.div>

          {/* Notification Signup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 p-4 bg-purple-800/30 rounded-lg backdrop-blur-sm"
          >
            <p className="text-purple-200 text-sm">
              Want to be notified when WNBA analytics go live? Follow us for updates!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 