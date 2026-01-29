import { useState } from "react";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [product, setProduct] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const comparePrice = async () => {
    if (!product) return alert("Enter a product name");

    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/compare?product=${product}`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      alert("Backend not responding");
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <h2>🛒 Price Comparison</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search product eg: iPhone 14"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />
        <button onClick={comparePrice}>Compare</button>
      </div>

      {loading && <p>Fetching prices...</p>}

      {results.length > 0 && (
        <div className="results">
          {results.map((item, index) => (
            <div className="card" key={index}>
              <h3>{item.site}</h3>
              <p>₹ {item.price}</p>
              <p>⭐ {item.rating}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
