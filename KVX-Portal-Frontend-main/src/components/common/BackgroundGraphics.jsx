import React from 'react';

const BackgroundGraphics = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-slate-50 dark:bg-[#070a13] transition-colors duration-1000">
      {/* Dynamic Glowing Orbs */}
      <div 
        className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 dark:from-indigo-600/20 dark:to-purple-900/20 blur-[120px] animate-[spinSlow_25s_linear_infinite] mix-blend-normal dark:mix-blend-screen opacity-80"
        style={{ transformOrigin: 'center center' }}
      ></div>
      
      <div 
        className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-teal-200/40 to-emerald-200/40 dark:from-teal-800/20 dark:to-emerald-900/20 blur-[140px] animate-[spinSlow_30s_reverse_infinite] mix-blend-normal dark:mix-blend-screen opacity-70"
        style={{ transformOrigin: 'center center' }}
      ></div>

      <div 
        className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-bl from-rose-200/30 to-orange-200/30 dark:from-rose-800/10 dark:to-orange-900/10 blur-[100px] animate-[float_10s_ease-in-out_infinite] mix-blend-normal dark:mix-blend-screen opacity-60"
      ></div>
      
      <div 
        className="absolute bottom-[20%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 dark:from-blue-800/10 dark:to-cyan-900/10 blur-[110px] animate-[float_12s_ease-in-out_infinite_reverse] mix-blend-normal dark:mix-blend-screen opacity-60"
      ></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h40v40H0z%22 fill=%22none%22/%3E%3Cpath d=%22M0 40V0h40%22 fill=%22none%22 stroke=%22%23000%22 stroke-opacity=%220.03%22 stroke-width=%221%22/%3E%3C/svg%3E')] dark:bg-[url('data:image/svg+xml;utf8,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 0h40v40H0z%22 fill=%22none%22/%3E%3Cpath d=%22M0 40V0h40%22 fill=%22none%22 stroke=%22%23fff%22 stroke-opacity=%220.03%22 stroke-width=%221%22/%3E%3C/svg%3E')] opacity-100"></div>
      
      {/* Animated noise overlay for premium texture */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>
    </div>
  );
};

export default BackgroundGraphics;
