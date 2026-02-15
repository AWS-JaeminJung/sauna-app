import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  DollarSign,
  XCircle,
  Star,
  LogIn,
} from "lucide-react";
import { fetchMyBookings, cancelBooking } from "../services/api";
import { Booking } from "../types";
import { useAuth } from "../hooks/useAuth";
import ReviewModal from "../components/review/ReviewModal";

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [reviewModalState, setReviewModalState] = useState<{
    isOpen: boolean;
    bookingId: string;
    saunaId: string;
    saunaName: string;
  }>({
    isOpen: false,
    bookingId: "",
    saunaId: "",
    saunaName: "",
  });
  const queryClient = useQueryClient();

  const { data: bookings, isLoading, error } = useQuery<Booking[]>({
    queryKey: ["myBookings"],
    queryFn: () => fetchMyBookings(),
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      alert("예약이 취소되었습니다.");
    },
    onError: (error: Error) => {
      alert(`예약 취소 실패: ${error.message}`);
    },
  });

  const handleCancelBooking = (bookingId: string, saunaName: string) => {
    if (
      window.confirm(
        `${saunaName} 예약을 취소하시겠습니까?\n\n취소 후에는 되돌릴 수 없습니다.`
      )
    ) {
      cancelMutation.mutate(bookingId);
    }
  };

  const openReviewModal = (booking: Booking) => {
    setReviewModalState({
      isOpen: true,
      bookingId: booking.id,
      saunaId: booking.sauna_id,
      saunaName: booking.sauna_name || "사우나",
    });
  };

  const closeReviewModal = () => {
    setReviewModalState({
      isOpen: false,
      bookingId: "",
      saunaId: "",
      saunaName: "",
    });
  };

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <LogIn className="h-16 w-16 text-stone-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-stone-600 mb-6">
            예약 내역을 확인하려면 로그인해주세요.
          </p>
          <Link
            to="/login"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">예약 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            예약 내역을 불러올 수 없습니다
          </h2>
          <p className="text-stone-500 mb-4">
            {error instanceof Error ? error.message : "오류가 발생했습니다"}
          </p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["myBookings"] })}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 예약 상태별 필터링
  const upcomingBookings =
    bookings?.filter((b) => b.status === "confirmed") || [];
  const completedBookings =
    bookings?.filter((b) => b.status === "completed") || [];
  const cancelledBookings =
    bookings?.filter((b) => b.status === "cancelled") || [];

  const currentBookings =
    activeTab === "upcoming"
      ? upcomingBookings
      : activeTab === "completed"
      ? completedBookings
      : cancelledBookings;

  // 상태 배지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-stone-100 text-stone-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "예약 확정";
      case "completed":
        return "이용 완료";
      case "cancelled":
        return "예약 취소";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800 mb-2">내 예약</h1>
          <p className="text-stone-600">예약 내역을 확인하고 관리하세요</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-1 mb-6 flex gap-1">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === "upcoming"
                ? "bg-orange-500 text-white"
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            예정된 예약
            {upcomingBookings.length > 0 && (
              <span className="ml-2 text-sm">({upcomingBookings.length})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === "completed"
                ? "bg-orange-500 text-white"
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            완료된 예약
            {completedBookings.length > 0 && (
              <span className="ml-2 text-sm">({completedBookings.length})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === "cancelled"
                ? "bg-orange-500 text-white"
                : "text-stone-600 hover:bg-stone-50"
            }`}
          >
            취소된 예약
            {cancelledBookings.length > 0 && (
              <span className="ml-2 text-sm">({cancelledBookings.length})</span>
            )}
          </button>
        </div>

        {/* Bookings List */}
        {currentBookings.length > 0 ? (
          <div className="space-y-4">
            {currentBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left: Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link
                          to={`/sauna/${booking.sauna_id}`}
                          className="text-xl font-bold text-stone-800 hover:text-orange-600 transition"
                        >
                          {booking.sauna_name || "사우나"}
                        </Link>
                        <span
                          className={`ml-3 px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                            booking.status
                          )}`}
                        >
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-stone-400" />
                        <span>{booking.booking_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-stone-400" />
                        <span>
                          {booking.start_time} - {booking.end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-stone-400" />
                        <span>{booking.guest_count}명</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-stone-400" />
                        <span className="font-semibold text-stone-800">
                          ₩{booking.total_price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-3 text-sm text-stone-500 bg-stone-50 p-3 rounded-lg">
                        <strong>메모:</strong> {booking.notes}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex lg:flex-col gap-2">
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() =>
                          handleCancelBooking(
                            booking.id,
                            booking.sauna_name || "사우나"
                          )
                        }
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        disabled={cancelMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                        취소하기
                      </button>
                    )}
                    {booking.status === "completed" && !booking.has_review && (
                      <button
                        onClick={() => openReviewModal(booking)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
                      >
                        <Star className="h-4 w-4" />
                        리뷰 작성
                      </button>
                    )}
                    {booking.status === "completed" && booking.has_review && (
                      <div className="px-4 py-2 bg-stone-100 text-stone-500 rounded-lg font-medium text-center">
                        리뷰 작성 완료
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-stone-700 mb-2">
              {activeTab === "upcoming" && "예정된 예약이 없습니다"}
              {activeTab === "completed" && "완료된 예약이 없습니다"}
              {activeTab === "cancelled" && "취소된 예약이 없습니다"}
            </h3>
            <p className="text-stone-500 mb-6">
              지금 바로 사우나를 예약하고 힐링 타임을 즐겨보세요!
            </p>
            <Link
              to="/booking"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              사우나 예약하기
            </Link>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalState.isOpen}
        onClose={closeReviewModal}
        bookingId={reviewModalState.bookingId}
        saunaId={reviewModalState.saunaId}
        saunaName={reviewModalState.saunaName}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["myBookings"] });
        }}
      />
    </div>
  );
}
