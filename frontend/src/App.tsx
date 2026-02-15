import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/common/Layout";
import HomePage from "./pages/HomePage";
import SaunaDetailPage from "./pages/SaunaDetailPage";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import MyBookingsPage from "./pages/MyBookingsPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/sauna/:id" element={<SaunaDetailPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route
              path="/booking/confirmation/:bookingId"
              element={<ConfirmationPage />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
