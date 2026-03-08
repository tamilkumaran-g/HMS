import React from "react";
import { motion as Motion } from "framer-motion";

const container = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const child = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export const AnimatedChild = ({ children, className = "" }) => (
  <Motion.div variants={child} className={className}>
    {children}
  </Motion.div>
);

const AnimatedContainer = ({ children, className = "" }) => (
  <Motion.div
    className={className}
    variants={container}
    initial="hidden"
    animate="show"
  >
    {children}
  </Motion.div>
);

export default AnimatedContainer;
