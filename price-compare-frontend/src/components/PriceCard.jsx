import { useNavigate } from "react-router-dom";

export default function PriceCard({
  data,
  isBestPrice,
  isBestRating,
  isBestReview
}) {

  const navigate = useNavigate();

  const price = data.price
    ? parseFloat(data.price.toString().replace(/[^0-9.]/g, ""))
    : 0;

  const rating = !isNaN(parseFloat(data.rating))
    ? parseFloat(data.rating)
    : 0;

  const reviews = data.reviews || "0";
  const platform = data.platform || "Unknown";

  const fullStars = Math.floor(rating);
  const decimal = rating - fullStars;
  const halfStar = decimal >= 0.25 && decimal < 0.75 ? 1 : 0;
  const extraFull = decimal >= 0.75 ? 1 : 0;
  const totalFullStars = fullStars + extraFull;
  const emptyStars = 5 - totalFullStars - halfStar;

  // ❤️ SAVE TO WISHLIST
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8000/wishlist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: data.title,
          price: price.toString(),
          platform: platform,
          image: data.image,
          link: data.link
        })
      });

      const result = await res.json();

      if (res.ok) {
        alert("❤️ Added to Wishlist");
      } else {
        alert(result.detail || "Error saving");
      }

    } catch (err) {
      alert("Error connecting to backend");
    }
  };

  

  return (
    <div
      className={`price-card
        ${isBestPrice ? "best-price" : ""}
        ${isBestRating ? "best-rating" : ""}
        ${isBestReview ? "best-review" : ""}`}
    >
      {isBestPrice && (
        <div className="badge best-price-badge">🟢 BEST PRICE</div>
      )}
      {isBestRating && (
        <div className="badge best-rating-badge">⭐ BEST RATING</div>
      )}
      {isBestReview && (
        <div className="badge best-review-badge">🔵 MOST REVIEWS</div>
      )}

      <img src={data.image} alt={data.title} />

      <h3>{data.title}</h3>

      <p className="platform-name">
        Platform: <strong>{platform}</strong>
      </p>

      <p className="price">₹{price.toLocaleString()}</p>

      <p>{rating} / 5</p>

      <div className="stars">
        {[...Array(totalFullStars)].map((_, i) => (
          <span key={"full" + i}>★</span>
        ))}
        {halfStar === 1 && (
          <span style={{ opacity: 0.5 }}>★</span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={"empty" + i}>☆</span>
        ))}
      </div>

      <p>{reviews} reviews</p>

    
      {data.link ? (
        <a href={data.link} target="_blank" rel="noopener noreferrer">
          <button>Buy Now</button>
        </a>
      ) : (
        <button disabled>No Link</button>
      )}

      <button
        onClick={handleSave}
        style={{
          marginTop: "12px",
          padding: "10px",
          width: "100%",
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(135deg,#ff6a88,#ff99ac)",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        ❤️ Save to Wishlist
      </button>
    </div>
  );
}