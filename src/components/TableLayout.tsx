import { Table } from '../types';
import { Armchair, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TableLayoutProps {
  tables: Table[];
  selectedTableId: string | null;
  onSelectTable: (table: Table) => void;
  bookedTableIds: string[];
  guestsCount: number;
}

export default function TableLayout({
  tables,
  selectedTableId,
  onSelectTable,
  bookedTableIds,
  guestsCount,
}: TableLayoutProps) {
  // Sort tables by table number
  const sortedTables = [...tables].sort((a, b) => a.number - b.number);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300"></div>
          <span className="text-slate-600 font-medium">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-200"></div>
          <span className="text-slate-600 font-medium">Already Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-amber-50 border border-amber-200"></div>
          <span className="text-slate-600 font-medium">Capacity Too Small</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300"></div>
          <span className="text-slate-600 font-medium">Inactive</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {sortedTables.map((table) => {
          const isBooked = bookedTableIds.includes(table.id);
          const hasEnoughCapacity = table.capacity >= guestsCount;
          const isActive = table.isActive;
          const isSelected = selectedTableId === table.id;

          let cardStyles = 'border bg-white';
          let statusLabel = 'Available';

          if (!isActive) {
            cardStyles = 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed';
            statusLabel = 'Out of Service';
          } else if (isBooked) {
            cardStyles = 'bg-rose-50 border-rose-200 cursor-not-allowed';
            statusLabel = 'Booked';
          } else if (!hasEnoughCapacity) {
            cardStyles = 'bg-amber-50/50 border-amber-200/80 hover:bg-amber-50 cursor-pointer';
            statusLabel = `Capacity: ${table.capacity} (Need ${guestsCount})`;
          } else {
            cardStyles = 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer';
            statusLabel = `Capacity: ${table.capacity} guests`;
          }

          if (isSelected) {
            cardStyles = 'ring-2 ring-indigo-600 border-indigo-600 bg-indigo-50/30';
          }

          const handleSelect = () => {
            if (isActive && !isBooked) {
              onSelectTable(table);
            }
          };

          return (
            <div
              key={table.id}
              onClick={handleSelect}
              className={`p-4 rounded-2xl transition-all duration-200 relative ${cardStyles} flex flex-col items-center text-center justify-between min-h-[140px]`}
            >
              {/* Table seats visualization */}
              <div className="flex gap-1 mb-2">
                {Array.from({ length: Math.min(table.capacity, 10) }).map((_, index) => (
                  <span
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${
                      isBooked
                        ? 'bg-rose-400'
                        : isSelected
                        ? 'bg-indigo-500'
                        : !hasEnoughCapacity
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  ></span>
                ))}
                {table.capacity > 10 && <span className="text-[10px] text-slate-400">+</span>}
              </div>

              <div>
                <span className="text-xs text-slate-400 font-mono font-medium block">
                  TABLE
                </span>
                <span className="font-display font-bold text-2xl text-slate-800">
                  {table.number}
                </span>
              </div>

              <div className="mt-2 w-full">
                <span
                  className={`text-[11px] font-medium block rounded px-1.5 py-0.5 ${
                    !isActive
                      ? 'bg-slate-200 text-slate-600'
                      : isBooked
                      ? 'bg-rose-100 text-rose-700'
                      : !hasEnoughCapacity
                      ? 'bg-amber-100 text-amber-800'
                      : isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {statusLabel}
                </span>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 text-indigo-600">
                  <CheckCircle2 className="w-4 h-4 fill-indigo-600 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
