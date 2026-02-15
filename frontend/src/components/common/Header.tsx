import { Link } from "react-router-dom";
import { Flame, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="bg-stone-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="h-8 w-8 text-orange-400" />
            <span className="text-xl font-bold">Finnish Sauna</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-orange-300 transition">
              Home
            </Link>
            <Link to="/booking" className="hover:text-orange-300 transition">
              Book Now
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="hover:text-orange-300 transition"
              >
                Admin
              </Link>
            )}
            {user ? (
              <button
                onClick={logout}
                className="bg-stone-700 hover:bg-stone-600 px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link
              to="/"
              className="block py-2 hover:text-orange-300"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/booking"
              className="block py-2 hover:text-orange-300"
              onClick={() => setMenuOpen(false)}
            >
              Book Now
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="block py-2 hover:text-orange-300"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="block py-2 text-orange-300"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="block py-2 text-orange-300"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
