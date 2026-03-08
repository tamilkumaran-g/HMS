import React from "react";
import { Hospital, Cpu, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-3 text-xs text-slate-400 sm:flex-row">
        <div className="flex items-center gap-2">
          <Hospital className="h-3.5 w-3.5 text-indigo-400" />
          <span>&copy; {new Date().getFullYear()} Hospital Digital Twin &mdash; AI Bed Allocation System</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <Cpu className="h-3 w-3" /> Multi-Agent Coordination
          </span>
          <span>&middot;</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Chennai Network
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
