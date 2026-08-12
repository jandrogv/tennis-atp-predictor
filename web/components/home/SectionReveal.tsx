"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type SectionRevealProps = {
  children: ReactNode;
  className?: string;
  index?: number;
};

type ScrollRevealCardProps = {
  children: ReactNode;
  className?: string;
  index: number;
};

const revealEase = [0.22, 1, 0.36, 1] as const;

export function SectionReveal({ children, className = "", index = 0 }: SectionRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: 0.88,
        ease: revealEase,
        delay: Math.min(index * 0.08, 0.24)
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealCard({ children, className = "", index }: ScrollRevealCardProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        y: -6,
        transition: { duration: 0.18, ease: revealEase, delay: 0 }
      }}
      viewport={{ once: true, amount: 0.24, margin: "0px 0px -10% 0px" }}
      transition={{
        duration: 0.78,
        ease: revealEase,
        delay: Math.min(index * 0.1, 0.7)
      }}
    >
      {children}
    </motion.div>
  );
}
