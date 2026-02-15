import { useState } from "react";
import { X, Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview } from "../../services/api";
import { ReviewCreate } from "../../types";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  saunaId: string;
  saunaName: string;
  onSuccess?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  bookingId,
  saunaId,
  saunaName,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: (data: ReviewCreate) => createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      queryClient.invalidateQueries({ queryKey: ["reviews", saunaId] });
      queryClient.invalidateQueries({ queryKey: ["reviewSummary", saunaId] });
      queryClient.invalidateQueries({ queryKey: ["sauna", saunaId] });
      onSuccess?.();
      onClose();
      // 성공 메시지
      alert("리뷰가 성공적으로 등록되었습니다!");
    },
    onError: (error: Error) => {
      alert(`리뷰 등록 실패: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      alert("별점을 선택해주세요 (1-5점)");
      return;
    }

    createReviewMutation.mutate({
      sauna_id: saunaId,
      booking_id: bookingId,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-stone-800">리뷰 작성</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition"
            aria-label="닫기"
          >
            <X className="h-6 w-6 text-stone-500" />
          </button>
        </div>

        {/* Sauna Name */}
        <div className="mb-6 p-4 bg-stone-50 rounded-lg">
          <p className="text-sm text-stone-500 mb-1">사우나</p>
          <p className="font-semibold text-stone-800">{saunaName}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-3">
              별점을 선택해주세요
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-lg font-semibold text-stone-700">
                {rating}.0
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-stone-700 mb-2"
            >
              이용 후기 (선택사항)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="이용 후기를 남겨주세요"
              rows={4}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <p className="text-xs text-stone-500 mt-1 text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition font-medium"
              disabled={createReviewMutation.isPending}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={createReviewMutation.isPending}
            >
              {createReviewMutation.isPending ? "등록 중..." : "등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
