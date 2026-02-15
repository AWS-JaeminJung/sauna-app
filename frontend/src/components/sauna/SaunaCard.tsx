import { Link } from "react-router-dom";
import { Users, Clock } from "lucide-react";
import { Sauna } from "../../types";

export default function SaunaCard({ sauna }: { sauna: Sauna }) {
  const amenities = sauna.amenities ? JSON.parse(sauna.amenities) : [];

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group">
      <div className="h-48 bg-gradient-to-br from-orange-300 to-amber-500 relative">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold">{sauna.name}</h3>
        </div>
      </div>
      <div className="p-5">
        <p className="text-stone-600 text-sm line-clamp-2 mb-4">
          {sauna.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" /> Max {sauna.capacity}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {sauna.open_time} - {sauna.close_time}
          </span>
        </div>
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {amenities.slice(0, 3).map((a: string) => (
              <span
                key={a}
                className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded-full"
              >
                {a}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="px-2 py-0.5 text-stone-400 text-xs">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-stone-800">
              {sauna.hourly_rate.toLocaleString()}
            </span>
            <span className="text-stone-500 text-sm ml-1">KRW/hr</span>
          </div>
          <Link
            to={`/booking?sauna=${sauna.id}`}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl font-medium transition"
          >
            Book
          </Link>
        </div>
      </div>
    </div>
  );
}
