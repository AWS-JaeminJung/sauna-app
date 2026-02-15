import { Link, useNavigate } from "react-router-dom";
import { Users, Clock, MapPin, Star } from "lucide-react";
import { Sauna } from "../../types";

export default function SaunaCard({ sauna }: { sauna: Sauna }) {
  const navigate = useNavigate();
  const amenities = sauna.amenities ? JSON.parse(sauna.amenities) : [];

  const handleCardClick = () => {
    navigate(`/sauna/${sauna.id}`);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group cursor-pointer"
    >
      <div className="h-48 bg-gradient-to-br from-orange-300 to-amber-500 relative overflow-hidden">
        {sauna.image_url ? (
          <img
            src={sauna.image_url}
            alt={sauna.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-amber-500" />
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold">{sauna.name}</h3>
        </div>
      </div>
      <div className="p-5">
        {/* 주소 및 평점 */}
        <div className="flex items-start justify-between gap-2 mb-3">
          {sauna.address && (
            <div className="flex items-start gap-1 text-xs text-stone-500 flex-1 min-w-0">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span className="truncate">{sauna.address}</span>
            </div>
          )}
          {sauna.average_rating && (
            <div className="flex items-center gap-1 text-xs flex-shrink-0">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-stone-700">
                {sauna.average_rating.toFixed(1)}
              </span>
              <span className="text-stone-400">
                ({sauna.review_count || 0})
              </span>
            </div>
          )}
        </div>

        <p className="text-stone-600 text-sm line-clamp-2 mb-4">
          {sauna.description || "편안한 사우나 시설을 제공합니다."}
        </p>

        <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" /> 최대 {sauna.capacity}명
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
                +{amenities.length - 3}개
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-stone-800">
              ₩{sauna.hourly_rate.toLocaleString()}
            </span>
            <span className="text-stone-500 text-sm ml-1">/시간</span>
          </div>
          <Link
            to={`/booking?sauna=${sauna.id}`}
            onClick={handleBookClick}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl font-medium transition"
          >
            예약
          </Link>
        </div>
      </div>
    </div>
  );
}
