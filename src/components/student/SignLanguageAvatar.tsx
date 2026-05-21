"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, MessageSquareQuote, Zap } from "lucide-react";

interface SignLanguageAvatarProps {
  currentGloss?: string;
  isVisible: boolean;
}

export const SignLanguageAvatar: React.FC<SignLanguageAvatarProps> = ({ 
  currentGloss, 
  isVisible 
}) => {
  const [isSigning, setIsSigning] = useState(false);

  // Trigger expressive signing animation when gloss changes
  useEffect(() => {
    if (currentGloss) {
      setIsSigning(true);
      const timer = setTimeout(() => setIsSigning(false), 3500); // Increased duration for better visibility
      return () => clearTimeout(timer);
    }
  }, [currentGloss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.95 }}
          className="absolute bottom-8 left-8 z-[9999] flex flex-col items-start gap-4 pointer-events-none"
        >
          {/* Avatar Container - Redesigned to Rectangular/Premium */}
          <div className="relative w-48 h-64 md:w-56 md:h-72 rounded-3xl border-2 border-white/50 shadow-2xl overflow-hidden bg-slate-900 group pointer-events-auto ring-4 ring-blue-500/20">
            {/* Background dynamic gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent z-10" />
            
            <Image
              src="/assets/ai-avatar.png"
              alt="AI Sign Language Avatar"
              fill
              className={`object-cover transition-all duration-700 ${
                isSigning ? 'scale-110 brightness-110' : 'scale-100 brightness-100'
              }`}
            />
            
            {/* Expressive Signing Overlay */}
            <AnimatePresence>
              {isSigning && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20"
                  >
                    {/* Pulsing light effect */}
                    <motion.div 
                      animate={{ 
                        opacity: [0.3, 0.6, 0.3],
                        boxShadow: [
                          "inset 0 0 50px rgba(59,130,246,0.3)",
                          "inset 0 0 100px rgba(59,130,246,0.5)",
                          "inset 0 0 50px rgba(59,130,246,0.3)"
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0"
                    />
                  </motion.div>

                  {/* Animated "Signs" - Visual representations of hand movement */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 0.9, 1]
                      }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-20 h-20 bg-blue-500/20 rounded-full blur-2xl border border-blue-400/30"
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Status Indicators */}
            <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
              <div className="flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                <div className={`w-2 h-2 rounded-full ${isSigning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  {isSigning ? 'Signing...' : 'Active'}
                </span>
              </div>
            </div>

            {/* Hand Icon Badge - Rectangular Polish */}
            <div className="absolute bottom-4 right-4 z-40">
              <div className={`p-2 rounded-xl border border-white/20 backdrop-blur-md transition-all duration-300 ${isSigning ? 'bg-blue-600 scale-110 shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'bg-black/40 scale-100'}`}>
                <Hand className={`w-5 h-5 text-white ${isSigning ? 'animate-bounce' : ''}`} />
              </div>
            </div>
          </div>

          {/* Gloss Bubble - Redesigned to be more prominent */}
          <AnimatePresence>
            {currentGloss && (
              <motion.div
                initial={{ opacity: 0, y: 20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: 20, x: 20 }}
                className="relative bg-white border-2 border-blue-100 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] max-w-[280px] pointer-events-auto"
              >
                {/* Speech arrow */}
                <div className="absolute -bottom-3 left-6 w-6 h-6 bg-white border-b-2 border-r-2 border-blue-100 rotate-45" />
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1 px-2 bg-blue-50 rounded text-blue-600">
                    <Zap className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Imo-ishora talqini</span>
                </div>
                <p className="text-lg font-black text-slate-800 leading-tight tracking-tight">
                  {currentGloss}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
