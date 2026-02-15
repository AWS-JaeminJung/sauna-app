import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Clock,
  Users,
  Thermometer,
  Star,
  Share2,
  Heart,
  Calendar,
  Wifi,
  Coffee,
  Droplets,
  Wind,
  Sparkles,
  ShowerHead,
} from "lucide-react";
import { fetchSaunaDetail } from "../services/api";
import { SaunaDetail } from "../types";
import ReviewList from "../components/review/ReviewList";

export default function SaunaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: sauna, isLoading, error } = useQuery<SaunaDetail>({
    queryKey: ["sauna", id],
    queryFn: () => fetchSaunaDetail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">사우나 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !sauna) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            사우나를 찾을 수 없습니다
          </h2>
          <p className="text-stone-500 mb-4">
            요청하신 사우나 정보를 찾을 수 없습니다.
          </p>
          <Link
            to="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 이미지 갤러리 데이터 준비
  const images = sauna.images?.length > 0
    ? sauna.images.sort((a, b) => a.display_order - b.display_order)
    : sauna.image_url
    ? [{ id: "default", image_url: sauna.image_url, is_primary: true }]
    : [];

  const hasImages = images.length > 0;

  // 편의시설 아이콘 매핑
  const amenityIcons: Record<string, any> = {
    wifi: Wifi,
    "와이파이": Wifi,
    coffee: Coffee,
    "음료": Coffee,
    shower: ShowerHead,
    "샤워실": ShowerHead,
    pool: Droplets,
    "수영장": Droplets,
    "냉탕": Droplets,
    sauna: Wind,
    "사우나": Wind,
    spa: Sparkles,
    "스파": Sparkles,
  };

  const getAmenityIcon = (amenity: string) => {
    const key = Object.keys(amenityIcons).find((k) =>
      amenity.toLowerCase().includes(k.toLowerCase())
    );
    return key ? amenityIcons[key] : Sparkles;
  };

  const amenities = sauna.amenities ? JSON.parse(sauna.amenities) : [];

  // 사우나 타입 배지 색상
  const saunaTypeColors: Record<string, string> = {
    Traditional: "bg-orange-100 text-orange-700",
    Smoke: "bg-stone-100 text-stone-700",
    Infrared: "bg-red-100 text-red-700",
    Steam: "bg-blue-100 text-blue-700",
  };

  // 요일별 운영시간
  const dayNames = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
  const operatingHours = sauna.operating_hours?.length > 0
    ? dayNames.map((day, index) => {
        const hours = sauna.operating_hours.find((h) => h.day_of_week === index);
        return {
          day,
          hours: hours
            ? hours.is_closed
              ? "휴무"
              : `${hours.open_time} - ${hours.close_time}`
            : `${sauna.open_time} - ${sauna.close_time}`,
          isClosed: hours?.is_closed || false,
        };
      })
    : dayNames.map((day) => ({
        day,
        hours: `${sauna.open_time} - ${sauna.close_time}`,
        isClosed: false,
      }));

  // 현재 영업 상태 확인
  const now = new Date();
  const currentDay = (now.getDay() + 6) % 7; // 0=Monday in our system
  const currentTime = now.toTimeString().slice(0, 5);
  const todayHours = operatingHours[currentDay];
  const isOpenNow =
    !todayHours.isClosed &&
    currentTime >= sauna.open_time &&
    currentTime <= sauna.close_time;

  // 이미지 네비게이션
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero 이미지 갤러리 */}
      <div className="relative h-[60vh] bg-gradient-to-br from-orange-300 to-amber-500">
        {hasImages ? (
          <>
            <img
              src={images[currentImageIndex].image_url}
              alt={sauna.name}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
                  aria-label="이전 이미지"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition"
                  aria-label="다음 이미지"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition ${
                        index === currentImageIndex
                          ? "bg-white w-8"
                          : "bg-white/50"
                      }`}
                      aria-label={`이미지 ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <Thermometer className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg opacity-75">이미지 준비중</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 카드 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl sm:text-4xl font-bold text-stone-800">
                      {sauna.name}
                    </h1>
                    {sauna.sauna_type && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          saunaTypeColors[sauna.sauna_type] ||
                          "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {sauna.sauna_type}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-stone-600">
                    {sauna.average_rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">
                          {sauna.average_rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-stone-400">
                          ({sauna.review_count || 0}개 리뷰)
                        </span>
                      </div>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                        신규
                      </span>
                    )}
                    {isOpenNow && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                        영업중
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="p-3 rounded-full hover:bg-stone-100 transition"
                    aria-label="공유하기"
                  >
                    <Share2 className="h-5 w-5 text-stone-600" />
                  </button>
                  <button
                    className="p-3 rounded-full hover:bg-stone-100 transition"
                    aria-label="즐겨찾기"
                  >
                    <Heart className="h-5 w-5 text-stone-600" />
                  </button>
                </div>
              </div>

              {/* 연락처 정보 */}
              <div className="space-y-3 border-t border-stone-200 pt-4">
                {sauna.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-stone-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-stone-700">{sauna.address}</p>
                      {sauna.road_address && (
                        <p className="text-sm text-stone-500">
                          {sauna.road_address}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {sauna.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-stone-400 flex-shrink-0" />
                    <a
                      href={`tel:${sauna.phone}`}
                      className="text-stone-700 hover:text-orange-600 transition"
                    >
                      {sauna.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* 상세 설명 */}
            {sauna.description && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-stone-800 mb-4">
                  소개
                </h2>
                <p className="text-stone-600 leading-relaxed whitespace-pre-line">
                  {sauna.description}
                </p>
              </div>
            )}

            {/* 시설 정보 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-stone-800 mb-6">
                시설 정보
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800 mb-1">
                      수용 인원
                    </h3>
                    <p className="text-stone-600">최대 {sauna.capacity}명</p>
                  </div>
                </div>
                {(sauna.temperature_min || sauna.temperature_max) && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <Thermometer className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800 mb-1">
                        온도 범위
                      </h3>
                      <p className="text-stone-600">
                        {sauna.temperature_min}°C - {sauna.temperature_max}°C
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 편의시설 */}
              {amenities.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold text-stone-800 mb-4">
                    편의시설
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {amenities.map((amenity: string, index: number) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg"
                        >
                          <Icon className="h-5 w-5 text-stone-600" />
                          <span className="text-sm text-stone-700">
                            {amenity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 운영시간 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-stone-800 mb-6">
                운영시간
              </h2>
              <div className="space-y-3">
                {operatingHours.map((item, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center py-2 ${
                      index === currentDay ? "bg-orange-50 -mx-4 px-4 rounded-lg" : ""
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        index === currentDay
                          ? "text-orange-600"
                          : "text-stone-700"
                      }`}
                    >
                      {item.day}
                      {index === currentDay && (
                        <span className="ml-2 text-xs">(오늘)</span>
                      )}
                    </span>
                    <span
                      className={`${
                        item.isClosed
                          ? "text-stone-400"
                          : index === currentDay
                          ? "text-orange-600 font-semibold"
                          : "text-stone-600"
                      }`}
                    >
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 위치 정보 */}
            {(sauna.latitude && sauna.longitude) && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-stone-800 mb-6">
                  위치
                </h2>
                <div className="space-y-4">
                  {sauna.address && (
                    <p className="text-stone-600 flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-stone-400 mt-0.5 flex-shrink-0" />
                      <span>{sauna.address}</span>
                    </p>
                  )}
                  <div className="flex gap-3">
                    <a
                      href={`https://map.kakao.com/link/map/${sauna.name},${sauna.latitude},${sauna.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-4 bg-yellow-400 hover:bg-yellow-500 text-stone-800 text-center rounded-lg font-medium transition"
                    >
                      카카오맵으로 보기
                    </a>
                    <a
                      href={`https://map.naver.com/v5/search/${encodeURIComponent(
                        sauna.address || sauna.name
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white text-center rounded-lg font-medium transition"
                    >
                      네이버 지도로 보기
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 리뷰 섹션 */}
            <ReviewList saunaId={sauna.id} />
          </div>

          {/* 우측 예약 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-stone-800">
                    ₩{sauna.hourly_rate.toLocaleString()}
                  </span>
                  <span className="text-stone-500">/시간</span>
                </div>
                <p className="text-sm text-stone-500">
                  부가세 포함 가격
                </p>
              </div>

              <button
                onClick={() => navigate(`/booking?sauna=${sauna.id}`)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg transition shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                예약하기
              </button>

              <div className="mt-6 pt-6 border-t border-stone-200 space-y-3 text-sm text-stone-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-stone-400" />
                  <span>즉시 예약 확정</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-stone-400" />
                  <span>최대 {sauna.capacity}명까지 이용 가능</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 하단 고정 CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 shadow-lg z-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-stone-500">시간당</div>
            <div className="text-xl font-bold text-stone-800">
              ₩{sauna.hourly_rate.toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => navigate(`/booking?sauna=${sauna.id}`)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            <Calendar className="h-5 w-5" />
            예약하기
          </button>
        </div>
      </div>
    </div>
  );
}
