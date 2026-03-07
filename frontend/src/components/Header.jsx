import React from "react";

const Header = () => {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-8 py-10 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)]">
      <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,184,77,0.45),rgba(255,184,77,0))] blur-2xl" />
      <div className="absolute -left-24 -bottom-20 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(72,149,239,0.45),rgba(72,149,239,0))] blur-2xl" />
      <div className="relative z-10 flex flex-col gap-4">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-300">
          Multi-Hospital Operations
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white">
          Digital Twin Coordinator
        </h1>
        <p className="max-w-2xl text-base sm:text-lg text-slate-200">
          AI-powered real-time bed allocation across Chennai, with live
          occupancy, admissions, and negotiation visibility.
        </p>
      </div>
    </header>
  );
};

export default Header;
