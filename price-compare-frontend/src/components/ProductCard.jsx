export default function ProductCard({ data, bestPrice, bestReview }) {
  const {
    platform,
    title,
    price,
    rating,
    reviews,
    image
  } = data;

  // ⭐ create stars
  const renderStars = (rating = 0) => {
    const full = Math.floor(rating);
    const empty = 5 - full;
    return "⭐".repeat(full) + "☆".repeat(empty);
  };

  return (
    <div
      className={`card ${
        bestPrice ? "best-price" : ""
      } ${bestReview ? "best-review" : ""}`}
    >
      {bestPrice && <div className="badge price">Best Price</div>}
      {bestReview && <div className="badge review">Best Review</div>}

      <img
        src={image || "https://via.placeholder.com/300x200?text=Product"}
        alt={title}
      />

      <h4>{platform}</h4>
      <p>{title}</p>

      <p className="price">💰 ₹{price}</p>

      <p className="rating">
        {renderStars(rating)} ({rating || "N/A"})
      </p>

      <p className="reviews">
        🧾 {reviews ? `${reviews} reviews` : "No reviews"}
      </p>

      <button>Buy Now</button>
    </div>
  );
}
