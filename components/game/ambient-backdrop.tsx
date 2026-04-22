"use client";

import { motion } from "framer-motion";

const glows = [
  { className: "left-[8%] top-[8%] h-60 w-60 bg-[#f0d9a2]/10", duration: 18 },
  { className: "right-[10%] top-[16%] h-72 w-72 bg-[#9a5471]/12", duration: 22 },
  { className: "left-[28%] bottom-[10%] h-80 w-80 bg-[#5e4a8f]/10", duration: 24 },
];

const particles = Array.from({ length: 8 }).map((_, index) => ({
  id: index,
  left: `${8 + ((index * 13) % 84)}%`,
  top: `${10 + ((index * 19) % 78)}%`,
  size: 3 + (index % 2) * 2,
  duration: 6 + (index % 4) * 2,
}));

export function AmbientBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(241,226,191,0.16)_0%,transparent_22%),linear-gradient(180deg,rgba(95,35,62,0.2),transparent_35%,transparent_68%,rgba(0,0,0,0.18)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[28vh] bg-[radial-gradient(circle_at_center_top,rgba(241,226,191,0.18),transparent_52%)]" />

      {glows.map((glow) => (
        <motion.div
          key={glow.className}
          className={`absolute rounded-full blur-3xl ${glow.className}`}
          animate={{ y: [0, -14, 0], opacity: [0.45, 0.62, 0.45], scale: [1, 1.03, 1] }}
          transition={{ duration: glow.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-[#f7efd9]/70"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{ y: [0, -10, 0], opacity: [0.12, 0.36, 0.12] }}
          transition={{ duration: particle.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="absolute inset-x-[8%] top-[6%] h-[44vh] rounded-b-[42%] border border-[#d6a653]/10 opacity-60" />
      <div className="absolute inset-x-[10%] top-[8%] h-[40vh] rounded-b-[44%] border border-[#f0d9a2]/8 opacity-50" />
      <div className="absolute inset-x-0 bottom-0 h-[30vh] bg-[linear-gradient(180deg,transparent,rgba(8,4,10,0.72)_60%,rgba(5,3,7,0.95))]" />
    </div>
  );
}
