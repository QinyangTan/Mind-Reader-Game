"use client";

import { motion } from "framer-motion";

const glows = [
  { className: "left-[12%] top-[16%] h-56 w-56 bg-[#f0d9a2]/8", duration: 20 },
  { className: "right-[10%] top-[18%] h-72 w-72 bg-[#6c86b5]/10", duration: 24 },
  { className: "left-[26%] bottom-[12%] h-96 w-96 bg-[#5f4268]/10", duration: 28 },
];

const particles = Array.from({ length: 8 }).map((_, index) => ({
  id: index,
  left: `${8 + ((index * 13) % 84)}%`,
  top: `${10 + ((index * 19) % 78)}%`,
  size: 3 + (index % 2) * 2,
  duration: 6 + (index % 4) * 2,
}));

const smokeBands = [
  { className: "left-[18%] top-[24%] h-40 w-[28rem]", duration: 20, delay: 0 },
  { className: "left-[32%] top-[52%] h-36 w-[24rem]", duration: 24, delay: 2 },
  { className: "right-[16%] top-[34%] h-44 w-[26rem]", duration: 22, delay: 1 },
];

export function AmbientBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(241,226,191,0.16)_0%,transparent_18%),linear-gradient(180deg,rgba(45,23,38,0.28),transparent_28%,transparent_72%,rgba(0,0,0,0.18)_100%)]" />
      <div className="absolute left-1/2 top-0 h-[40vh] w-[44rem] max-w-[92vw] -translate-x-1/2 rounded-b-[42%] bg-[radial-gradient(circle_at_center_top,rgba(176,197,240,0.18),rgba(176,197,240,0.05)_32%,transparent_62%)]" />
      <div className="absolute left-1/2 top-[7vh] h-[28vh] w-[28rem] max-w-[72vw] -translate-x-1/2 rounded-[48%] border border-[rgba(240,217,162,0.14)] bg-[radial-gradient(circle,rgba(240,217,162,0.06),transparent_60%)]" />

      <div className="absolute bottom-0 left-0 top-0 w-[20vw] min-w-[7rem] bg-[linear-gradient(90deg,rgba(56,18,32,0.72),rgba(56,18,32,0.28),transparent)]" />
      <div className="absolute bottom-0 right-0 top-0 w-[20vw] min-w-[7rem] bg-[linear-gradient(270deg,rgba(56,18,32,0.72),rgba(56,18,32,0.28),transparent)]" />
      <div className="absolute bottom-0 left-[5%] top-0 w-[14vw] min-w-[5rem] rounded-r-[40%] bg-[linear-gradient(180deg,rgba(84,24,44,0.36),rgba(35,14,26,0.68))]" />
      <div className="absolute bottom-0 right-[5%] top-0 w-[14vw] min-w-[5rem] rounded-l-[40%] bg-[linear-gradient(180deg,rgba(84,24,44,0.36),rgba(35,14,26,0.68))]" />

      {glows.map((glow) => (
        <motion.div
          key={glow.className}
          className={`absolute rounded-full blur-3xl ${glow.className}`}
          animate={{ y: [0, -14, 0], opacity: [0.45, 0.62, 0.45], scale: [1, 1.03, 1] }}
          transition={{ duration: glow.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {smokeBands.map((band) => (
        <motion.div
          key={band.className}
          className={`absolute rounded-[50%] bg-[radial-gradient(circle,rgba(211,219,240,0.08),rgba(211,219,240,0.03)_44%,transparent_72%)] blur-2xl ${band.className}`}
          animate={{ x: [0, 18, -12, 0], y: [0, -8, 6, 0], opacity: [0.18, 0.28, 0.14, 0.18] }}
          transition={{
            duration: band.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: band.delay,
          }}
        />
      ))}

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-[#f7efd9]/60"
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

      <div className="absolute left-1/2 bottom-[17vh] h-24 w-[32rem] max-w-[90vw] -translate-x-1/2 rounded-[50%] border border-[rgba(214,166,83,0.16)] bg-[radial-gradient(circle,rgba(214,166,83,0.06),transparent_72%)]" />
      <div className="absolute left-1/2 bottom-[11vh] h-20 w-[24rem] max-w-[70vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(circle,rgba(12,8,18,0.92),transparent_72%)]" />
      <div className="absolute left-1/2 bottom-[8vh] h-[10vh] w-[34rem] max-w-[92vw] -translate-x-1/2 rounded-t-[48%] bg-[linear-gradient(180deg,rgba(33,21,43,0.16),rgba(10,7,15,0.84))]" />

      {[18, 82].map((left, index) => (
        <motion.div
          key={left}
          className="absolute bottom-[17vh] h-24 w-10 -translate-x-1/2"
          style={{ left: `${left}%` }}
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3.6 + index, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute bottom-0 left-1/2 h-16 w-1 -translate-x-1/2 rounded-full bg-[rgba(37,24,18,0.9)]" />
          <motion.div
            className="absolute bottom-14 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-[#f0d9a2]/70 blur-[2px]"
            animate={{ scale: [0.92, 1.08, 0.94], opacity: [0.7, 1, 0.76] }}
            transition={{ duration: 1.8 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-13 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-[#f0d9a2]/16 blur-xl"
            animate={{ scale: [0.9, 1.18, 0.92], opacity: [0.2, 0.34, 0.22] }}
            transition={{ duration: 2.2 + index * 0.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-[34vh] bg-[linear-gradient(180deg,transparent,rgba(8,4,10,0.78)_48%,rgba(5,3,7,0.97))]" />
    </div>
  );
}
