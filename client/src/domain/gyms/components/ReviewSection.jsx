const ReviewSection = ({ reviews }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-800">리뷰</h3>
    {reviews.length === 0 ? (
      <p className="text-gray-500 text-center py-4">아직 리뷰가 없습니다.</p>
    ) : (
      <div className="space-y-3">
        {reviews.map((r) => (
          <div
            key={r.reviewNo}
            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <p className="font-medium text-gray-800 mb-1">
              {r.writerNickname} - ★{r.rating}
            </p>
            <p className="text-gray-700 text-sm">{r.comment}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default ReviewSection;
