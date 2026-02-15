import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Filter, RefreshCw } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { Booking, Sauna } from "../types";

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [saunas, setSaunas] = useState<Sauna[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterSauna, setFilterSauna] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }
    api.get<Sauna[]>("/saunas").then(setSaunas);
    loadBookings();
  }, [isAdmin, navigate]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterDate) params.set("date", filterDate);
      if (filterSauna) params.set("sauna_id", filterSauna);
      if (filterStatus) params.set("status", filterStatus);
      const query = params.toString();
      const data = await api.get<Booking[]>(
        `/bookings${query ? `?${query}` : ""}`
      );
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: string, status: string) => {
    await api.patch(`/bookings/${bookingId}`, { status });
    loadBookings();
  };

  const statusColors: Record<string, string> = {
    confirmed: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    no_show: "bg-stone-100 text-stone-700",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Admin Dashboard</h1>
          <p className="text-stone-500 mt-1">Manage bookings and saunas</p>
        </div>
        <button
          onClick={loadBookings}
          className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-xl transition"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-stone-400" />
          <span className="text-sm font-medium text-stone-600">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-lg text-sm"
          />
          <select
            value={filterSauna}
            onChange={(e) => setFilterSauna(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-lg text-sm"
          >
            <option value="">All Saunas</option>
            {saunas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
          <button
            onClick={loadBookings}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setFilterDate("");
              setFilterSauna("");
              setFilterStatus("");
            }}
            className="text-stone-500 hover:text-stone-700 px-3 py-2 text-sm"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                    Sauna
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                    Time
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                    Guests
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 text-sm font-mono text-stone-500">
                      {b.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-stone-800">
                        {b.customer_name}
                      </div>
                      <div className="text-xs text-stone-400">
                        {b.customer_phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{b.sauna_name}</td>
                    <td className="px-4 py-3 text-sm">{b.booking_date}</td>
                    <td className="px-4 py-3 text-sm">
                      {b.start_time}-{b.end_time}
                    </td>
                    <td className="px-4 py-3 text-sm">{b.guest_count}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {b.total_price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[b.status] || "bg-stone-100"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        className="text-xs border border-stone-200 rounded-lg px-2 py-1"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No Show</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
