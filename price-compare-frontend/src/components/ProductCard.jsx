export default function ProductCard({ title, price }) {
  return (
    <div className="product-card">
      <img src="https://via.placeholder.com/300x200?text=Product" />
      <h4>{title}</h4>
      <p>From ₹{price}</p>
      <button>Compare Prices</button>
    </div>
  );
}


	
