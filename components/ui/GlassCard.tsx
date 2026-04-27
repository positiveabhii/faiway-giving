"use client";

import React from "react";
import { cn } from "./Button";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
}

export function GlassCard({ children, className, animate = false, delay = 0 }: GlassCardProps) {
  const baseContent = (
    <div className={cn("glass-card p-6", className)}>
      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
      >
        {baseContent}
      </motion.div>
    );
  }

  return baseContent;
}
