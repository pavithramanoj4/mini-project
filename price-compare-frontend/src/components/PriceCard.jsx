export default function PriceCard({ data, bestPrice }) {
  const numericPrice = parseInt(data.price?.replace(/[₹,]/g, ""));
  const isBest = numericPrice === bestPrice;

  return (
    <div className={`card ${isBest ? "best" : ""}`}>
      <img src={data.image} alt={data.title} />

      <h4>{data.title}</h4>
      <p><strong>{data.store}</strong></p>

      <p>💰 {data.price}</p>
      <p>⭐ {data.rating || "N/A"}</p>

      {isBest && <p className="badge">Best Price</p>}

      <a href={data.link} target="_blank">
        <button>Buy Now</button>
      </a>
    </div>
  );
}


	
