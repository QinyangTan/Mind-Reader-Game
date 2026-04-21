"use client";

import { motion } from "framer-motion";

const glows = [
  { className: "left-[8%] top-[12%] h-64 w-64 bg-cyan-400/16", duration: 13 },
  { className: "right-[12%] top-[20%] h-72 w-72 bg-fuchsia-500/14", duration: 16 },
  { className: "left-[28%] bottom-[8%] h-80 w-80 bg-sky-500/12", duration: 18 },
  { className: "right-[24%] bottom-[16%] h-60 w-60 bg-emerald-400/10", duration: 15 },
];

const particles = Array.from({ length: 18 }).map((_, index) => ({
  id: index,
  left: `${8 + ((index * 13) % 84)}%`,
  top: `${10 + ((index * 19) % 78)}%`,
  size: 4 + (index % 3) * 3,
  duration: 4 + (index % 5),
}));

export function AmbientBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#11305f_0%,rgba(7,13,30,0.98)_44%,#02030a_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(90,154,255,0.08),transparent_32%,transparent_68%,rgba(255,255,255,0.03)_100%)]" />

      {glows.map((glow) => (
        <motion.div
          key={glow.className}
          className={`absolute rounded-full blur-3xl ${glow.className}`}
          animate={{ y: [0, -24, 0], opacity: [0.65, 0.85, 0.65], scale: [1, 1.05, 1] }}
          transition={{ duration: glow.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] opacity-40 mix-blend-screen" />

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-white/70 shadow-[0_0_18px_rgba(125,211,252,0.6)]"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{ y: [0, -16, 0], opacity: [0.25, 0.85, 0.25] }}
          transition={{ duration: particle.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(166,198,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(166,198,255,0.12)_1px,transparent_1px)] [background-size:140px_140px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_46%,rgba(2,6,23,0.42)_100%)]" />
    </div>
  );
}
