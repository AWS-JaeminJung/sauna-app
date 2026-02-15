import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="bg-stone-900 text-stone-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Finnish Sauna Booking. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Experience the authentic Finnish sauna tradition.
          </p>
        </div>
      </footer>
    </div>
  );
}
