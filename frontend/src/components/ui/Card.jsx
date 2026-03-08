import React from "react";
import { motion as Motion } from "framer-motion";

const Card = ({ children, className = "", asMotion = true, glow = "" }) => {
  const glowClass = glow ? `glow-${glow}` : "";
  const classes = `glass-card p-5 ${glowClass} ${className}`.trim();

  if (!asMotion) {
    return <div className={classes}>{children}</div>;
  }

  return (
    <Motion.div
      className={classes}
      whileHover={{ y: -4, scale: 1.008 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      {children}
    </Motion.div>
  );
};

export default Card;
