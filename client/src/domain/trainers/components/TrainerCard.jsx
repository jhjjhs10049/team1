const TrainerCard = ({ trainer }) => (
    <div className="trainer-card">
        <h4>{trainer.name}</h4>
        <p>{trainer.specialty}</p>
        <p>평점: {trainer.rating}</p>
    </div>
);

export default TrainerCard;