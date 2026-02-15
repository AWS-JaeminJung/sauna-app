import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  CalendarCheck,
  Star,
  DollarSign,
  Users,
  Building2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { Booking, Sauna } from "../types";
import {
  fetchDashboardStats,
  fetchRevenueByDate,
  fetchBookingsBySauna,
  fetchRecentBookings,
} from "../services/api";

type TabType = "dashboard" | "bookings";

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // 예약 관리 탭 관련 상태
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

  // 대시보드 데이터 쿼리
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    enabled: isAdmin && activeTab === "dashboard",
  });

  const { data: revenueData, refetch: refetchRevenue } = useQuery({
    queryKey: ["revenueByDate"],
    queryFn: () => fetchRevenueByDate(7),
    enabled: isAdmin && activeTab === "dashboard",
  });

  const { data: saunaStats, refetch: refetchSaunaStats } = useQuery({
    queryKey: ["bookingsBySauna"],
    queryFn: fetchBookingsBySauna,
    enabled: isAdmin && activeTab === "dashboard",
  });

  const { data: recentBookings, refetch: refetchRecentBookings } = useQuery({
    queryKey: ["recentBookings"],
    queryFn: () => fetchRecentBookings(5),
    enabled: isAdmin && activeTab === "dashboard",
  });

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

  const statusLabels: Record<string, string> = {
    confirmed: "예약확정",
    completed: "완료",
    cancelled: "취소",
    no_show: "노쇼",
  };

  const handleRefreshAll = () => {
    if (activeTab === "dashboard") {
      refetchStats();
      refetchRevenue();
      refetchSaunaStats();
      refetchRecentBookings();
    } else {
      loadBookings();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">관리자 대시보드</h1>
          <p className="text-stone-500 mt-1">
            사우나 예약 및 매출 관리 시스템
          </p>
        </div>
        <button
          onClick={handleRefreshAll}
          className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-xl transition"
        >
          <RefreshCw className="h-4 w-4" /> 새로고침
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-stone-200">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-6 py-3 font-medium transition relative ${
            activeTab === "dashboard"
              ? "text-orange-600"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          대시보드
          {activeTab === "dashboard" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-6 py-3 font-medium transition relative ${
            activeTab === "bookings"
              ? "text-orange-600"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          예약 관리
          {activeTab === "bookings" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
          )}
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 총 매출 */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-400 to-green-500 rounded-xl">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-stone-500 mb-1">총 매출</div>
              <div className="text-2xl font-bold text-stone-800 mb-2">
                {stats?.total_revenue.toLocaleString("ko-KR")}원
              </div>
              <div className="text-xs text-stone-400">
                전체 기간 누적 매출
              </div>
            </div>

            {/* 총 예약 */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-stone-500 mb-1">총 예약</div>
              <div className="text-2xl font-bold text-stone-800 mb-2">
                {stats?.total_bookings.toLocaleString("ko-KR")}건
              </div>
              <div className="text-xs text-stone-400">
                확정: {stats?.confirmed_bookings}건 / 취소:{" "}
                {stats?.cancelled_bookings}건
              </div>
            </div>

            {/* 오늘 예약 */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl">
                  <CalendarCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-stone-500 mb-1">오늘 예약</div>
              <div className="text-2xl font-bold text-stone-800 mb-2">
                {stats?.today_bookings.toLocaleString("ko-KR")}건
              </div>
              <div className="text-xs text-stone-400">
                오늘 매출: {stats?.today_revenue.toLocaleString("ko-KR")}원
              </div>
            </div>

            {/* 평균 평점 */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-stone-500 mb-1">평균 평점</div>
              <div className="text-2xl font-bold text-stone-800 mb-2">
                {stats?.average_rating.toFixed(1)} ★
              </div>
              <div className="text-xs text-stone-400">
                고객 {stats?.total_customers.toLocaleString("ko-KR")}명 / 사우나{" "}
                {stats?.total_saunas}개
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-stone-800">
                  최근 7일 매출 추이
                </h3>
                <p className="text-sm text-stone-500 mt-1">
                  일별 매출 및 예약 건수
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>

            {revenueData && revenueData.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-2 h-64">
                  {revenueData.map((item, idx) => {
                    const maxRevenue = Math.max(
                      ...revenueData.map((d) => d.revenue)
                    );
                    const height =
                      maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div className="w-full flex flex-col items-center justify-end h-full">
                          <div className="text-xs font-medium text-stone-600 mb-1">
                            {item.revenue.toLocaleString("ko-KR", {
                              notation: "compact",
                            })}
                          </div>
                          <div
                            className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg hover:from-orange-600 hover:to-orange-500 transition cursor-pointer relative group"
                            style={{ height: `${height}%`, minHeight: "20px" }}
                          >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                              <div className="bg-stone-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                                <div className="font-medium">
                                  {item.revenue.toLocaleString("ko-KR")}원
                                </div>
                                <div className="text-stone-300">
                                  {item.booking_count}건 예약
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-stone-500 mt-2 text-center">
                          {new Date(item.date).toLocaleDateString("ko-KR", {
                            month: "numeric",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-stone-400">
                          {item.booking_count}건
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-stone-400">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>매출 데이터가 없습니다</p>
              </div>
            )}
          </div>

          {/* Bottom Grid: Sauna Stats + Recent Bookings */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sauna Stats */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-stone-800">
                    사우나별 매출 순위
                  </h3>
                  <p className="text-sm text-stone-500 mt-1">
                    예약 건수 및 매출 현황
                  </p>
                </div>
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>

              {saunaStats && saunaStats.length > 0 ? (
                <div className="space-y-4">
                  {saunaStats.map((item, idx) => {
                    const maxRevenue = Math.max(
                      ...saunaStats.map((s) => s.revenue)
                    );
                    const percentage =
                      maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                    return (
                      <div key={item.sauna_id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
                              {idx + 1}
                            </div>
                            <span className="font-medium text-stone-800">
                              {item.sauna_name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-stone-800">
                              {item.revenue.toLocaleString("ko-KR")}원
                            </div>
                            <div className="text-xs text-stone-500">
                              {item.booking_count}건
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-stone-400">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>데이터가 없습니다</p>
                </div>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-stone-800">
                    최근 예약 내역
                  </h3>
                  <p className="text-sm text-stone-500 mt-1">
                    최근 5건의 예약
                  </p>
                </div>
                <Users className="h-5 w-5 text-purple-500" />
              </div>

              {recentBookings && recentBookings.length > 0 ? (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-stone-800">
                            {booking.customer_name}
                          </div>
                          <div className="text-sm text-stone-500">
                            {booking.sauna_name || "사우나 정보 없음"}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[booking.status] || "bg-stone-100"
                          }`}
                        >
                          {statusLabels[booking.status] || booking.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-stone-600">
                          {booking.booking_date} {booking.start_time}-
                          {booking.end_time}
                        </div>
                        <div className="font-bold text-orange-600">
                          {booking.total_price.toLocaleString("ko-KR")}원
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-stone-400">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>최근 예약이 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bookings Management Tab */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-stone-400" />
              <span className="text-sm font-medium text-stone-600">
                필터
              </span>
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
                <option value="">모든 사우나</option>
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
                <option value="">모든 상태</option>
                <option value="confirmed">예약확정</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
                <option value="no_show">노쇼</option>
              </select>
              <button
                onClick={loadBookings}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                적용
              </button>
              <button
                onClick={() => {
                  setFilterDate("");
                  setFilterSauna("");
                  setFilterStatus("");
                }}
                className="text-stone-500 hover:text-stone-700 px-3 py-2 text-sm"
              >
                초기화
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
                <p>예약 내역이 없습니다</p>
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
                        고객
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                        사우나
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                        날짜
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                        시간
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                        인원
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                        금액
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                        상태
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">
                        관리
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
                        <td className="px-4 py-3 text-sm">{b.guest_count}명</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {b.total_price.toLocaleString("ko-KR")}원
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              statusColors[b.status] || "bg-stone-100"
                            }`}
                          >
                            {statusLabels[b.status] || b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={b.status}
                            onChange={(e) => updateStatus(b.id, e.target.value)}
                            className="text-xs border border-stone-200 rounded-lg px-2 py-1"
                          >
                            <option value="confirmed">예약확정</option>
                            <option value="completed">완료</option>
                            <option value="cancelled">취소</option>
                            <option value="no_show">노쇼</option>
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
      )}
    </div>
  );
}
