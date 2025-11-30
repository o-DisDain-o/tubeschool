import React from 'react';
import { motion } from 'framer-motion';
import Logo from '../common/Logo';

export const Hero = ({ children }) => {
  return (
    <div className="min-h-screen bg-tubes-bg text-white flex flex-col relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-40 w-96 h-96 bg-tubes-accent/5 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 px-6 py-6 flex items-center">
        <Logo size="md" showIcon={true} />
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 max-w-4xl w-full"
        >
          {/* Main Logo in Center */}
          <div className="flex justify-center mb-4">
            <Logo size="xl" showIcon={false} />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-medium text-slate-200">
              Turn any YouTube video into a classroom..
            </h2>
            <p className="text-lg text-tubes-muted max-w-2xl mx-auto leading-relaxed">
              Paste a link, ask doubts in real-time, and get a personalized test at the end.
            </p>
          </div>

          <div className="pt-4">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;