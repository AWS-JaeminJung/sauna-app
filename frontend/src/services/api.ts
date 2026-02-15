const API_BASE = import.meta.env.VITE_API_BASE || "/api/v1";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// Specific API functions
import {
  Sauna,
  SaunaDetail,
  Booking,
  Review,
  ReviewCreate,
  ReviewSummary,
  DashboardStats,
  RevenueByDate,
  BookingsBySauna,
  RecentBooking
} from "../types";

export async function fetchSaunas(): Promise<Sauna[]> {
  return api.get<Sauna[]>("/saunas");
}

export async function fetchSaunaDetail(id: string): Promise<SaunaDetail> {
  return api.get<SaunaDetail>(`/saunas/${id}`);
}

// 예약 관련
export async function fetchMyBookings(status?: string): Promise<Booking[]> {
  const query = status ? `?status=${status}` : "";
  return api.get<Booking[]>(`/bookings/my${query}`);
}

export async function cancelBooking(bookingId: string): Promise<Booking> {
  return api.patch<Booking>(`/bookings/${bookingId}/cancel`, {});
}

// 리뷰 관련
export async function fetchReviews(saunaId: string): Promise<Review[]> {
  return api.get<Review[]>(`/reviews?sauna_id=${saunaId}`);
}

export async function fetchReviewSummary(saunaId: string): Promise<ReviewSummary> {
  return api.get<ReviewSummary>(`/reviews/summary?sauna_id=${saunaId}`);
}

export async function createReview(data: ReviewCreate): Promise<Review> {
  return api.post<Review>("/reviews", data);
}

export async function deleteReview(reviewId: string): Promise<void> {
  return api.delete<void>(`/reviews/${reviewId}`);
}

// 관리자 대시보드 관련
export async function fetchDashboardStats(): Promise<DashboardStats> {
  return api.get<DashboardStats>("/admin/stats");
}

export async function fetchRevenueByDate(period: number = 7): Promise<RevenueByDate[]> {
  return api.get<RevenueByDate[]>(`/admin/revenue?period=${period}`);
}

export async function fetchBookingsBySauna(): Promise<BookingsBySauna[]> {
  return api.get<BookingsBySauna[]>("/admin/bookings-by-sauna");
}

export async function fetchRecentBookings(limit: number = 5): Promise<RecentBooking[]> {
  return api.get<RecentBooking[]>(`/admin/recent-bookings?limit=${limit}`);
}
