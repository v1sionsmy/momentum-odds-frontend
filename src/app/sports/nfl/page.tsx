"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import MomentumOddsHeader from '@/components/MomentumOddsHeader';

export default function NFLPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900">
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
            className="inline-block bg-yellow-400 text-blue-900 font-bold px-6 py-2 rounded-full text-lg mb-6"
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
            NFL Analytics
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-xl text-blue-100 mb-8 leading-relaxed"
          >
            Revolutionary momentum analytics are coming to the NFL. Experience game-changing insights 
            with drive momentum, red zone efficiency tracking, and advanced predictive models 
            for professional football.
          </motion.p>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-blue-800/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-2">Drive Momentum</h3>
              <p className="text-blue-200 text-sm">Track momentum shifts during offensive drives</p>
            </div>
            <div className="bg-blue-800/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-2">Red Zone Analytics</h3>
              <p className="text-blue-200 text-sm">Advanced red zone efficiency insights</p>
            </div>
            <div className="bg-blue-800/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-2">Quarter Dynamics</h3>
              <p className="text-blue-200 text-sm">Momentum analysis by game periods</p>
            </div>
            <div className="bg-blue-800/50 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-2">Game Flow Prediction</h3>
              <p className="text-blue-200 text-sm">AI models for game outcome prediction</p>
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
              className="bg-white text-blue-800 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Try NBA Analytics Now
            </Link>
            <Link
              href="/sports"
              className="border border-blue-300 text-blue-100 font-semibold px-8 py-3 rounded-lg hover:bg-blue-800/50 transition-colors"
            >
              Back to Sports
            </Link>
          </motion.div>

          {/* Notification Signup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 p-4 bg-blue-800/30 rounded-lg backdrop-blur-sm"
          >
            <p className="text-blue-200 text-sm">
              Get ready for the next generation of football analytics. Stay tuned for updates!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 