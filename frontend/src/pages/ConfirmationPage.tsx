import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { api } from "../services/api";
import { Booking } from "../types";

export default function ConfirmationPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      api
        .get<Booking>(`/bookings/${bookingId}`)
        .then(setBooking)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500">Booking not found.</p>
        <Link to="/" className="text-orange-500 hover:underline mt-4 inline-block">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-stone-800 mb-2">
        Booking Confirmed!
      </h1>
      <p className="text-stone-500 mb-8">
        Your sauna session has been successfully booked.
      </p>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 text-left space-y-3">
        <div className="text-center mb-4">
          <span className="text-sm text-stone-400">Booking ID</span>
          <p className="font-mono text-lg font-bold text-stone-800">
            {booking.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <hr className="border-stone-100" />
        <div className="flex justify-between">
          <span className="text-stone-500">Sauna</span>
          <span className="font-medium">{booking.sauna_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Date</span>
          <span className="font-medium">{booking.booking_date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Time</span>
          <span className="font-medium">
            {booking.start_time} - {booking.end_time}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Guests</span>
          <span className="font-medium">{booking.guest_count}</span>
        </div>
        <hr className="border-stone-100" />
        <div className="flex justify-between text-lg">
          <span className="font-semibold">Total Paid</span>
          <span className="font-bold text-orange-600">
            {booking.total_price.toLocaleString()} KRW
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <Link
          to="/"
          className="block bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition"
        >
          Back to Home
        </Link>
        <Link
          to="/booking"
          className="block border border-stone-300 hover:bg-stone-50 py-3 rounded-xl font-medium transition"
        >
          Book Another Session
        </Link>
      </div>
    </div>
  );
}
