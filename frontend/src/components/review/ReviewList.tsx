import { useQuery } from "@tanstack/react-query";
import { Star, User } from "lucide-react";
import { fetchReviews, fetchReviewSummary } from "../../services/api";
import { Review, ReviewSummary } from "../../types";

interface ReviewListProps {
  saunaId: string;
}

export default function ReviewList({ saunaId }: ReviewListProps) {
  const {
    data: reviews,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useQuery<Review[]>({
    queryKey: ["reviews", saunaId],
    queryFn: () => fetchReviews(saunaId),
  });

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery<ReviewSummary>({
    queryKey: ["reviewSummary", saunaId],
    queryFn: () => fetchReviewSummary(saunaId),
  });

  // 상대 시간 표시 함수
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) return `${diffYears}년 전`;
    if (diffMonths > 0) return `${diffMonths}개월 전`;
    if (diffWeeks > 0) return `${diffWeeks}주 전`;
    if (diffDays > 0) return `${diffDays}일 전`;
    if (diffHours > 0) return `${diffHours}시간 전`;
    if (diffMins > 0) return `${diffMins}분 전`;
    return "방금 전";
  };

  // 별점 렌더링
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-stone-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (reviewsLoading || summaryLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-stone-800 mb-6">고객 리뷰</h2>
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">리뷰를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (reviewsError || summaryError) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-stone-800 mb-6">고객 리뷰</h2>
        <div className="text-center py-8">
          <p className="text-stone-500">리뷰를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const hasReviews = reviews && reviews.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-stone-800 mb-6">고객 리뷰</h2>

      {hasReviews && summary ? (
        <>
          {/* 평점 요약 */}
          <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
            <div className="flex items-start gap-6">
              {/* 평균 평점 */}
              <div className="text-center">
                <div className="text-5xl font-bold text-stone-800 mb-2">
                  {summary.average_rating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(summary.average_rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-stone-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-stone-600">
                  {summary.review_count}개의 리뷰
                </div>
              </div>

              {/* 별점 분포 */}
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = summary.rating_distribution[star] || 0;
                  const percentage = summary.review_count
                    ? (count / summary.review_count) * 100
                    : 0;

                  return (
                    <div key={star} className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm text-stone-700">{star}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </div>
                      <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-stone-600 w-12 text-right">
                        {count}개
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 리뷰 목록 */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-stone-200 last:border-b-0 pb-6 last:pb-0"
              >
                <div className="flex items-start gap-4">
                  {/* 프로필 아이콘 */}
                  <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-stone-500" />
                  </div>

                  <div className="flex-1">
                    {/* 작성자 & 날짜 */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-stone-800">
                          {review.user_name}
                        </p>
                        <p className="text-xs text-stone-500">
                          {getRelativeTime(review.created_at)}
                        </p>
                      </div>
                      {renderStars(review.rating)}
                    </div>

                    {/* 리뷰 내용 */}
                    {review.comment && (
                      <p className="text-stone-600 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* 리뷰 없음 */
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 mb-2">아직 리뷰가 없습니다</p>
          <p className="text-sm text-stone-400">
            이 사우나를 이용하신 후 첫 리뷰를 남겨주세요!
          </p>
        </div>
      )}
    </div>
  );
}
