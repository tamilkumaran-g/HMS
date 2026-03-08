import React from "react";
import { motion as Motion } from "framer-motion";
import { BedDouble, User, SprayCan } from "lucide-react";
import Badge from "./ui/Badge";

const BedGrid = ({
  beds,
  wardType,
  selectedBedId,
  onSelectBed,
  hospitalName,
}) => {
  if (!beds || beds.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No {wardType} beds available in {hospitalName}
      </div>
    );
  }

  const getBedIcon = (status) => {
    switch (status) {
      case "available":
        return <BedDouble className="w-5 h-5 text-green-600" />;
      case "occupied":
        return <User className="w-5 h-5 text-red-500" />;
      case "cleaning":
        return <SprayCan className="w-5 h-5 text-amber-500" />;
      default:
        return <BedDouble className="w-5 h-5 text-slate-400" />;
    }
  };

  const getBedColor = (status, isSelected) => {
    if (isSelected) {
      return "border-indigo-400 bg-indigo-50 shadow-[0_0_0_1px_rgba(79,70,229,0.25)]";
    }

    switch (status) {
      case "available":
        return "border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer";
      case "occupied":
        return "border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer";
      case "cleaning":
        return "border-amber-200 bg-amber-50 hover:bg-amber-100 cursor-pointer";
      default:
        return "border-slate-200 bg-slate-50";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{wardType} Ward Seat Map</h3>
        <p className="text-xs text-slate-400">
          {beds.filter((b) => b.status === "available").length} of {beds.length}{" "}
          available
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10">
        {beds.map((bed, idx) => (
          <Motion.button
            key={bed.id}
            onClick={() => onSelectBed(bed.id, bed)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.01, duration: 0.2 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className={`group relative aspect-square rounded-xl border p-2 transition-all ${getBedColor(
              bed.status,
              selectedBedId === bed.id,
            )}`}
            title={`${bed.id} (${bed.status})${bed.occupant ? ` - ${bed.occupant}` : ""}`}
          >
            <div className="mb-1">{getBedIcon(bed.status)}</div>
            <span className="w-full truncate text-center text-[10px] font-semibold sm:text-[11px]">
              {bed.id}
            </span>

            <div className="pointer-events-none absolute -top-3 left-1/2 z-20 hidden w-44 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left text-[10px] text-slate-600 shadow-lg group-hover:block">
              <p className="font-semibold">{bed.id}</p>
              <p>Status: {bed.status}</p>
              {bed.occupant ? <p>Occupant: {bed.occupant}</p> : null}
              {bed.eta_clean ? <p>ETA clean: {bed.eta_clean} min</p> : null}
            </div>
          </Motion.button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 text-xs">
        <Badge tone="success" className="gap-1 px-2.5 py-1">
          <BedDouble className="h-3.5 w-3.5" /> Available
        </Badge>
        <Badge tone="danger" className="gap-1 px-2.5 py-1">
          <User className="h-3.5 w-3.5" /> Occupied
        </Badge>
        <Badge tone="warning" className="gap-1 px-2.5 py-1">
          <SprayCan className="h-3.5 w-3.5" /> Cleaning
        </Badge>
      </div>
    </div>
  );
};

export default BedGrid;
