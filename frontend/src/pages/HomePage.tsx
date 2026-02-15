import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Thermometer, Droplets, MapPin } from "lucide-react";
import { api } from "../services/api";
import { Sauna } from "../types";
import SaunaCard from "../components/sauna/SaunaCard";

export default function HomePage() {
  const [saunas, setSaunas] = useState<Sauna[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Sauna[]>("/saunas")
      .then(setSaunas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-orange-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-6 w-6 text-orange-400" />
              <span className="text-orange-300 font-medium">
                Authentic Finnish Experience
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Experience the Warmth of
              <br />
              <span className="text-orange-400">Finnish Sauna</span>
            </h1>
            <p className="text-lg text-stone-300 mb-8 leading-relaxed">
              Immerse yourself in centuries of Finnish sauna tradition. From
              traditional wood-heated saunas to modern infrared experiences,
              find your perfect way to relax and rejuvenate.
            </p>
            <Link
              to="/booking"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-lg font-semibold transition shadow-lg shadow-orange-500/30"
            >
              Book Your Session
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Thermometer className="h-7 w-7 text-orange-500" />
              </div>
              <h3 className="font-bold text-stone-800 mb-2">
                Authentic Temperature
              </h3>
              <p className="text-stone-500 text-sm">
                Traditional Finnish saunas heated to 80-100°C for the genuine
                löyly experience.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Droplets className="h-7 w-7 text-blue-500" />
              </div>
              <h3 className="font-bold text-stone-800 mb-2">
                Premium Facilities
              </h3>
              <p className="text-stone-500 text-sm">
                Showers, changing rooms, rest areas, and refreshments included
                with every session.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-7 w-7 text-green-500" />
              </div>
              <h3 className="font-bold text-stone-800 mb-2">
                Easy Booking
              </h3>
              <p className="text-stone-500 text-sm">
                Book online in minutes. Choose your sauna, pick a time, and
                you're all set.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sauna List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-800 mb-3">
              Our Saunas
            </h2>
            <p className="text-stone-500 max-w-xl mx-auto">
              Choose from our selection of authentic Finnish saunas, each
              offering a unique experience.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-stone-500">Loading saunas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {saunas.map((sauna) => (
                <SaunaCard key={sauna.id} sauna={sauna} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
