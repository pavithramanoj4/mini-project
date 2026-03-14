import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Navbar from "../components/Navbar";
import PriceCard from "../components/PriceCard";
import "../styles/compare.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function Compare() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [product, setProduct] = useState("");
  const [results, setResults] = useState([]);
  const [bestSmartPlatform, setBestSmartPlatform] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // ✅ PROTECT PAGE
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.sub);
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  // ✅ AUTO RE-COMPARE (FIXED SAFE VERSION)
  useEffect(() => {
    const productFromURL = searchParams.get("product");
    if (productFromURL) {
      setProduct(productFromURL);
      handleCompare(productFromURL);
    }
    // eslint-disable-next-line
  }, []);

  const handleCompare = async (customProduct) => {
    const searchItem = customProduct || product;

    if (!searchItem) {
      alert("Enter product name");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:8000/compare?product=${encodeURIComponent(searchItem)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      setResults(data.results || []);
      setBestSmartPlatform(data.best_smart_platform || null);

    } catch (err) {
      alert("Backend not reachable");
      console.error(err);
    }

    setLoading(false);
  };

  const cleanPrice = (price) => {
    if (!price) return 0;
    const num = parseFloat(price.toString().replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const cleanReviews = (reviews) => {
    if (!reviews) return 0;
    const num = parseInt(reviews.toString().replace(/[^0-9]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const formatReviews = (reviews) => {
    return Number(reviews).toLocaleString();
  };

  const prices = results.map((item) => cleanPrice(item.price));
  const ratings = results.map((item) =>
    isNaN(parseFloat(item.rating)) ? 0 : parseFloat(item.rating)
  );
  const reviews = results.map((item) => cleanReviews(item.reviews));

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxRating = ratings.length ? Math.max(...ratings) : 0;
  const maxReviews = reviews.length ? Math.max(...reviews) : 0;

  const chartData = results.map((item, index) => ({
    platform: item.platform + " " + (index + 1),
    price: cleanPrice(item.price)
  }));

  return (
    <>
      <Navbar />

      <div className="compare-container">
        <div className="hero-wrapper">
          <div className="hero-card">
            <h1 className="hero-title">S3P SmartCompare</h1>
            <p className="hero-subtitle">
              Smarter Shopping 🛍️ • Better Decisions 🧠 • Instant Savings 💸
            </p>

            <p style={{ marginTop: "20px", fontSize: "14px", lineHeight: "1.5", opacity: 0.9 }}>
              Why overpay when you can outsmart the price? 😎<br />
              SmartCompare finds the best deals across stores in seconds — so you save money, time, 
              and maybe even impress your wallet. 💼✨<br /><br />
              <strong>Search. Compare. Save. It’s that simple. ❤️</strong>
            </p>

            <div className="search-container" style={{ marginTop: "25px" }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search product eg: iPhone 14"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />
              <button
                className="search-btn"
                onClick={() => handleCompare()}
                disabled={loading}
              >
                {loading ? "Searching..." : "Compare"}
              </button>
            </div>
          </div>
        </div>

        {results.length > 0 && (
          <>
            <div className="summary-section">
              <h2>Summary</h2>
              <div className="summary-boxes">

                <div className="summary-card">
                  <h3>Lowest Price</h3>
                  <p>₹{minPrice.toLocaleString()}</p>
                  <small>
                    {results[prices.indexOf(minPrice)]?.platform}
                  </small>
                </div>

                <div className="summary-card">
                  <h3>Best Rating</h3>
                  <p>{maxRating} ⭐</p>
                  <small>
                    {results[ratings.indexOf(maxRating)]?.platform}
                  </small>
                </div>

                <div className="summary-card">
                  <h3>Most Reviews</h3>
                  <p>{formatReviews(maxReviews)}</p>
                  <small>
                    {results[reviews.indexOf(maxReviews)]?.platform}
                  </small>
                </div>

                <div className="summary-card">
                  <h3>Best Deal</h3>
                  <p>
                    Save ₹{(Math.max(...prices) - minPrice).toLocaleString()}
                  </p>
                  <small>
                    Buy from {results[prices.indexOf(minPrice)]?.platform}
                  </small>
                </div>

              </div>
            </div>

            <div style={{
              width: "100%",
              height: 420,
              marginTop: "40px",
              marginBottom: "80px"
            }}>
              <h2 style={{ textAlign: "center" }}>
                Price Comparison Chart
              </h2>

              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" interval={0} />
                  <YAxis tickFormatter={(value) => `₹${value}`} />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Bar dataKey="price" fill="#4a90e2" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="cards-container">
              {results.map((item, index) => {
                const price = cleanPrice(item.price);
                const rating = isNaN(parseFloat(item.rating))
                  ? 0
                  : parseFloat(item.rating);
                const reviewCount = cleanReviews(item.reviews);

                return (
                  <PriceCard
                    key={index}
                    data={{
                      ...item,
                      reviews: formatReviews(reviewCount)
                    }}
                    isBestPrice={
                      price === minPrice &&
                      index === prices.indexOf(minPrice)
                    }
                    isBestRating={
                      rating === maxRating &&
                      index === ratings.indexOf(maxRating)
                    }
                    isBestReview={
                      reviewCount === maxReviews &&
                      index === reviews.indexOf(maxReviews)
                    }
                    isSmartChoice={
                      item.platform === bestSmartPlatform
                    }
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}