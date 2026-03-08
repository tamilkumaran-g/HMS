import React from "react";

const Header = () => {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
      <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.12),rgba(79,70,229,0))] blur-2xl" />
      <div className="absolute -left-24 -bottom-20 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12),rgba(99,102,241,0))] blur-2xl" />
      <div className="relative z-10 flex flex-col gap-4">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
          Multi-Hospital Operations
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-slate-800">
          Digital Twin Coordinator
        </h1>
        <p className="max-w-2xl text-base sm:text-lg text-slate-500">
          AI-powered bed allocation across Chennai with occupancy,
          admissions, and negotiation visibility.
        </p>
      </div>
    </header>
  );
};

export default Header;
