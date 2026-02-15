import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Check, ChevronRight } from "lucide-react";
import { api } from "../services/api";
import { Sauna, TimeSlot, BookingCreate, Booking } from "../types";
import BookingCalendar from "../components/booking/BookingCalendar";
import TimeSlotPicker from "../components/booking/TimeSlotPicker";

type Step = "sauna" | "datetime" | "info" | "confirm";

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("sauna");
  const [saunas, setSaunas] = useState<Sauna[]>([]);
  const [selectedSauna, setSelectedSauna] = useState<Sauna | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load saunas
  useEffect(() => {
    api.get<Sauna[]>("/saunas").then((data) => {
      setSaunas(data);
      const preselected = searchParams.get("sauna");
      if (preselected) {
        const found = data.find((s) => s.id === preselected);
        if (found) {
          setSelectedSauna(found);
          setStep("datetime");
        }
      }
    });
  }, [searchParams]);

  // Load availability when date changes
  useEffect(() => {
    if (selectedSauna && selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      api
        .get<TimeSlot[]>(
          `/bookings/availability?sauna_id=${selectedSauna.id}&date=${dateStr}`
        )
        .then(setSlots);
    }
  }, [selectedSauna, selectedDate]);

  const totalHours =
    startTime && endTime
      ? (parseInt(endTime.split(":")[0]) * 60 +
          parseInt(endTime.split(":")[1]) -
          (parseInt(startTime.split(":")[0]) * 60 +
            parseInt(startTime.split(":")[1]))) /
        60
      : 0;
  const totalPrice = selectedSauna ? totalHours * selectedSauna.hourly_rate : 0;

  const handleSubmit = async () => {
    if (!selectedSauna || !selectedDate || !startTime || !endTime) return;
    setSubmitting(true);
    setError("");
    try {
      const data: BookingCreate = {
        sauna_id: selectedSauna.id,
        booking_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: startTime,
        end_time: endTime,
        guest_count: guestCount,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        notes: notes || undefined,
      };
      const booking = await api.post<Booking>("/bookings", data);
      navigate(`/booking/confirmation/${booking.id}`);
    } catch (err: any) {
      setError(err.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const steps: { key: Step; label: string }[] = [
    { key: "sauna", label: "Sauna" },
    { key: "datetime", label: "Date & Time" },
    { key: "info", label: "Your Info" },
    { key: "confirm", label: "Confirm" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">
        Book Your Sauna
      </h1>

      {/* Step Indicator */}
      <div className="flex items-center mb-10">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div
              className={`flex items-center gap-2 ${
                i <= stepIndex ? "text-orange-500" : "text-stone-300"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i < stepIndex
                    ? "bg-orange-500 text-white"
                    : i === stepIndex
                    ? "bg-orange-100 text-orange-600 border-2 border-orange-500"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                {i < stepIndex ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 mx-2 text-stone-300" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Sauna */}
      {step === "sauna" && (
        <div>
          <h2 className="text-xl font-semibold text-stone-800 mb-4">
            Choose Your Sauna
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saunas.map((sauna) => (
              <button
                key={sauna.id}
                onClick={() => {
                  setSelectedSauna(sauna);
                  setStep("datetime");
                }}
                className={`p-5 rounded-xl border-2 text-left transition ${
                  selectedSauna?.id === sauna.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-stone-200 hover:border-orange-300"
                }`}
              >
                <h3 className="font-bold text-stone-800">{sauna.name}</h3>
                <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                  {sauna.description}
                </p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-stone-400">
                    Max {sauna.capacity} guests
                  </span>
                  <span className="font-bold text-orange-600">
                    {sauna.hourly_rate.toLocaleString()} KRW/hr
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === "datetime" && selectedSauna && (
        <div className="space-y-6">
          <div className="bg-orange-50 rounded-xl p-4 flex justify-between items-center">
            <div>
              <span className="text-sm text-stone-500">Selected:</span>
              <span className="ml-2 font-semibold text-stone-800">
                {selectedSauna.name}
              </span>
            </div>
            <button
              onClick={() => setStep("sauna")}
              className="text-sm text-orange-500 hover:underline"
            >
              Change
            </button>
          </div>

          <BookingCalendar
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />

          {selectedDate && slots.length > 0 && (
            <TimeSlotPicker
              slots={slots}
              selectedStart={startTime}
              selectedEnd={endTime}
              onSelect={(start, end) => {
                setStartTime(start);
                setEndTime(end);
              }}
            />
          )}

          {startTime && endTime && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Number of Guests (Max {selectedSauna.capacity})
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="w-10 h-10 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50"
                >
                  -
                </button>
                <span className="text-lg font-semibold w-8 text-center">
                  {guestCount}
                </span>
                <button
                  onClick={() =>
                    setGuestCount(
                      Math.min(selectedSauna.capacity, guestCount + 1)
                    )
                  }
                  className="w-10 h-10 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {startTime && endTime && (
            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <span className="text-stone-500">Total:</span>
                <span className="ml-2 text-2xl font-bold text-stone-800">
                  {totalPrice.toLocaleString()} KRW
                </span>
                <span className="text-stone-400 text-sm ml-1">
                  ({totalHours}h)
                </span>
              </div>
              <button
                onClick={() => setStep("info")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Customer Info */}
      {step === "info" && (
        <div className="space-y-5 max-w-lg">
          <h2 className="text-xl font-semibold text-stone-800">
            Your Information
          </h2>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="010-0000-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Special Requests
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Any special requests or notes..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep("datetime")}
              className="px-6 py-2.5 border border-stone-300 rounded-xl hover:bg-stone-50 transition"
            >
              Back
            </button>
            <button
              onClick={() => setStep("confirm")}
              disabled={!customerName || !customerPhone || !customerEmail}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-stone-300 text-white px-6 py-2.5 rounded-xl font-medium transition"
            >
              Review Booking
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === "confirm" && selectedSauna && selectedDate && (
        <div className="max-w-lg">
          <h2 className="text-xl font-semibold text-stone-800 mb-6">
            Booking Summary
          </h2>
          <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-stone-500">Sauna</span>
              <span className="font-medium">{selectedSauna.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Date</span>
              <span className="font-medium">
                {format(selectedDate, "yyyy-MM-dd (EEE)")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Time</span>
              <span className="font-medium">
                {startTime} - {endTime} ({totalHours}h)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Guests</span>
              <span className="font-medium">{guestCount}</span>
            </div>
            <hr className="border-stone-100" />
            <div className="flex justify-between">
              <span className="text-stone-500">Name</span>
              <span className="font-medium">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Phone</span>
              <span className="font-medium">{customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Email</span>
              <span className="font-medium">{customerEmail}</span>
            </div>
            {notes && (
              <div className="flex justify-between">
                <span className="text-stone-500">Notes</span>
                <span className="font-medium text-right max-w-[200px]">
                  {notes}
                </span>
              </div>
            )}
            <hr className="border-stone-100" />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-orange-600">
                {totalPrice.toLocaleString()} KRW
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep("info")}
              className="px-6 py-2.5 border border-stone-300 rounded-xl hover:bg-stone-50 transition"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-stone-300 text-white py-2.5 rounded-xl font-semibold transition"
            >
              {submitting ? "Processing..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
