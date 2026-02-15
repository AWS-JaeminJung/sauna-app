import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, isToday, isSameDay, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function BookingCalendar({ selectedDate, onSelect }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // getDay returns 0=Sunday, we want Monday=0
  const startDayIndex = (getDay(monthStart) + 6) % 7;
  const today = startOfDay(new Date());

  return (
    <div>
      <h3 className="font-semibold text-stone-800 mb-3">Select Date</h3>
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 hover:bg-stone-100 rounded-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold text-stone-800">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 hover:bg-stone-100 rounded-lg"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-stone-400 py-2"
            >
              {day}
            </div>
          ))}

          {/* Empty cells for days before month start */}
          {Array.from({ length: startDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map((day) => {
            const isPast = isBefore(day, today);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const todayMark = isToday(day);

            return (
              <button
                key={day.toISOString()}
                disabled={isPast}
                onClick={() => !isPast && onSelect(day)}
                className={`py-2 rounded-lg text-sm transition ${
                  isSelected
                    ? "bg-orange-500 text-white font-bold"
                    : isPast
                    ? "text-stone-300 cursor-not-allowed"
                    : todayMark
                    ? "bg-orange-50 text-orange-600 font-medium hover:bg-orange-100"
                    : "hover:bg-stone-100 text-stone-700"
                }`}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
