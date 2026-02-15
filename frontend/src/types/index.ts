export interface Sauna {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  hourly_rate: number;
  image_url: string | null;
  amenities: string | null;
  is_active: boolean;
  open_time: string;
  close_time: string;
  // 추가 필드
  address?: string | null;
  road_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  sauna_type?: string | null;
  temperature_min?: number | null;
  temperature_max?: number | null;
  average_rating?: number | null;
  review_count?: number;
}

export interface SaunaImage {
  id: string;
  sauna_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
}

export interface OperatingHours {
  id: string;
  sauna_id: string;
  day_of_week: number; // 0=Monday, 6=Sunday
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface SaunaDetail extends Sauna {
  images: SaunaImage[];
  operating_hours: OperatingHours[];
  average_rating?: number | null;
  review_count?: number;
}

export interface Booking {
  id: string;
  sauna_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  total_price: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  notes: string | null;
  status: string;
  sauna_name?: string | null;
  has_review?: boolean;
  user_id?: string;
}

export interface BookingCreate {
  sauna_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_admin: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Review {
  id: string;
  sauna_id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name: string;
}

export interface ReviewCreate {
  sauna_id: string;
  booking_id: string;
  rating: number;
  comment?: string;
}

export interface ReviewSummary {
  average_rating: number;
  review_count: number;
  rating_distribution: Record<string, number>;
}

// 관리자 대시보드 관련 타입
export interface DashboardStats {
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  today_bookings: number;
  today_revenue: number;
  total_customers: number;
  total_saunas: number;
  average_rating: number;
}

export interface RevenueByDate {
  date: string;
  revenue: number;
  booking_count: number;
}

export interface BookingsBySauna {
  sauna_id: string;
  sauna_name: string;
  booking_count: number;
  revenue: number;
}

export interface RecentBooking {
  id: string;
  customer_name: string;
  sauna_name: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  created_at: string;
}
