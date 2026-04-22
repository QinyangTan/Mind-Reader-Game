"use client";

import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils/cn";

interface SceneCaptionProps {
  sceneId: string;
  eyebrow: string;
  title: string;
  detail: string;
  className?: string;
}

export function SceneCaption({
  sceneId,
  eyebrow,
  title,
  detail,
  className,
}: SceneCaptionProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-[1.2rem] border border-[rgba(240,217,162,0.1)] bg-[rgba(12,8,18,0.36)] px-5 py-4 shadow-[0_16px_30px_rgba(8,5,12,0.18)] backdrop-blur-[2px]", className)}>
      <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(240,217,162,0.38),transparent)]" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={sceneId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="relative space-y-2"
        >
          <p className="text-[0.68rem] tracking-[0.24em] text-[#d6a653]">{eyebrow}</p>
          <div className="grid gap-2 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] lg:items-end">
            <h1 className="font-display text-[2rem] leading-[0.94] text-[#f7efd9] sm:text-[2.4rem]">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[#cbbda5] lg:justify-self-end">
              {detail}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
