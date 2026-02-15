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
