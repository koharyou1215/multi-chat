"use client";

import { memo } from "react";

// Glass morphism effect components for the glass variant
export const GlassEffects = memo(() => (
  <>
    {/* Enhanced Gradient Border Effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-blue-500/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
    <div className="absolute inset-[1px] bg-gray-900/60 backdrop-blur-xl rounded-2xl -z-10" />

    {/* Decorative gradient orbs */}
    <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-10" />
    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10" />
  </>
));

GlassEffects.displayName = 'GlassEffects';

export default GlassEffects;