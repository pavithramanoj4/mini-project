import { useState } from "react";
import PriceCard from "../components/PriceCard";

export default function Compare() {
  const [product, setProduct] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!product) {
      alert("Enter product name");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/compare?product=${product}`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      alert("Backend not reachable");
      console.error(err);
    }
    setLoading(false);
  };

  // 👉 find minimum price
  const minPrice =
    results.length > 0
      ? Math.min(...results.map((item) => item.price))
      : null;

  return (
    <div style={{ padding: "30px" }}>
      <h2>🛒 Price Comparison</h2>

      <input
        type="text"
        placeholder="Search product eg: iPhone 14"
        value={product}
        onChange={(e) => setProduct(e.target.value)}
        style={{
          padding: "10px",
          width: "70%",
          marginRight: "10px"
        }}
      />

      <button onClick={handleCompare} style={{ padding: "10px 20px" }}>
        Compare
      </button>

      {loading && <p>Loading...</p>}

      {/* ✅ UPDATED RENDER PART */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px"
        }}
      >
        {results.map((item, index) => (
          <PriceCard
            key={index}
            data={item}
            best={item.price === minPrice}
          />
        ))}
      </div>
    </div>
  );
}


	
