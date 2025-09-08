const ReviewSection = ({ reviews }) => (
    <div>
        <h3>리뷰</h3>
        {reviews.length === 0 ? (
            <p>아직 리뷰가 없습니다.</p>
        ) : (
            reviews.map(r => (
                <div key={r.reviewNo}>
                    <p>{r.writerNickname} - ★{r.rating}</p>
                    <p>{r.comment}</p>
                </div>
            ))
        )}
    </div>
);