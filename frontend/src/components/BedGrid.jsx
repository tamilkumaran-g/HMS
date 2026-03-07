import React from "react";
import { CircleCheck, CircleX, CircleDashed, Circle } from "lucide-react";

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
        return <CircleCheck className="w-5 h-5 text-emerald-500" />;
      case "occupied":
        return <CircleX className="w-5 h-5 text-rose-500" />;
      case "cleaning":
        return <CircleDashed className="w-5 h-5 text-amber-500" />;
      default:
        return <Circle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBedColor = (status, isSelected) => {
    if (isSelected) return "ring-2 ring-amber-400 bg-amber-500/20";
    switch (status) {
      case "available":
        return "bg-emerald-500/20 hover:bg-emerald-500/30 cursor-pointer";
      case "occupied":
        return "bg-rose-500/10 opacity-60 cursor-not-allowed";
      case "cleaning":
        return "bg-amber-500/10 opacity-60 cursor-not-allowed";
      default:
        return "bg-slate-500/10";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{wardType} Ward</h3>
        <p className="text-xs text-slate-400">
          {beds.filter((b) => b.status === "available").length} of {beds.length}{" "}
          available
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {beds.map((bed) => (
          <button
            key={bed.id}
            onClick={() =>
              bed.status === "available" && onSelectBed(bed.id, bed)
            }
            disabled={bed.status !== "available"}
            className={`rounded-xl p-3 border border-white/10 transition-all aspect-square flex flex-col items-center justify-center gap-1 ${getBedColor(
              bed.status,
              selectedBedId === bed.id,
            )}`}
            title={`${bed.id} (${bed.status})`}
          >
            {getBedIcon(bed.status)}
            <span className="text-xs font-medium truncate w-full text-center">
              {bed.id}
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 text-xs pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <CircleCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <CircleX className="w-4 h-4 text-rose-500" />
          <span className="text-slate-300">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <CircleDashed className="w-4 h-4 text-amber-500" />
          <span className="text-slate-300">Cleaning</span>
        </div>
      </div>
    </div>
  );
};

export default BedGrid;
