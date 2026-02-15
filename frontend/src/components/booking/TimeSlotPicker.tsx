import { TimeSlot } from "../../types";

interface Props {
  slots: TimeSlot[];
  selectedStart: string | null;
  selectedEnd: string | null;
  onSelect: (start: string, end: string) => void;
}

export default function TimeSlotPicker({
  slots,
  selectedStart,
  selectedEnd,
  onSelect,
}: Props) {
  const handleClick = (time: string) => {
    if (!selectedStart || selectedEnd) {
      // First click or reset: set start time
      const idx = slots.findIndex((s) => s.time === time);
      if (idx < slots.length - 1) {
        onSelect(time, slots[idx + 1].time);
      }
    } else {
      // Second click: extend end time
      const startIdx = slots.findIndex((s) => s.time === selectedStart);
      const clickIdx = slots.findIndex((s) => s.time === time);
      if (clickIdx > startIdx) {
        const endIdx = Math.min(clickIdx + 1, slots.length);
        onSelect(selectedStart, slots[endIdx - 1]?.time || time);
      } else {
        // Clicked before start, reset
        const idx = slots.findIndex((s) => s.time === time);
        if (idx < slots.length - 1) {
          onSelect(time, slots[idx + 1].time);
        }
      }
    }
  };

  const isInRange = (time: string) => {
    if (!selectedStart || !selectedEnd) return false;
    return time >= selectedStart && time < selectedEnd;
  };

  return (
    <div>
      <h3 className="font-semibold text-stone-800 mb-3">Select Time</h3>
      <p className="text-sm text-stone-500 mb-3">
        Click to select start time, click again to extend duration.
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => slot.available && handleClick(slot.time)}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
              isInRange(slot.time)
                ? "bg-orange-500 text-white"
                : slot.available
                ? "bg-white border border-stone-200 hover:border-orange-400 text-stone-700"
                : "bg-stone-100 text-stone-300 cursor-not-allowed"
            }`}
          >
            {slot.time}
          </button>
        ))}
      </div>
      {selectedStart && selectedEnd && (
        <p className="mt-3 text-sm text-orange-600 font-medium">
          Selected: {selectedStart} - {selectedEnd}
        </p>
      )}
    </div>
  );
}
