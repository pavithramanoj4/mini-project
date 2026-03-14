import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Wishlist() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8000/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setItems(data);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://127.0.0.1:8000/wishlist/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      } else {
        alert("Failed to remove item");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <>
      <Navbar />

      <div style={{
        padding: "40px",
        background: "linear-gradient(135deg,#fdfbfb,#ebedee)",
        minHeight: "100vh"
      }}>
        <h1 style={{ marginBottom: "20px" }}>❤️ My Wishlist</h1>

        {items.length === 0 && (
          <p style={{ fontSize: "18px" }}>No items saved yet.</p>
        )}

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "25px"
        }}>
          {items.map(item => (
            <div
              key={item.id}
              style={{
                width: "260px",
                background: "white",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                transition: "0.3s"
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                style={{ width: "100%", borderRadius: "8px" }}
              />

              <h3 style={{ marginTop: "10px" }}>{item.title}</h3>

              <p style={{ fontWeight: "bold" }}>₹{item.price}</p>

              <p style={{ color: "#555" }}>{item.platform}</p>

              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <button style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#4CAF50",
                  color: "white",
                  cursor: "pointer"
                }}>
                  Buy Now
                </button>
              </a>

              <button
                onClick={() => handleRemove(item.id)}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "none",
                  background: "linear-gradient(135deg,#ff4d4d,#cc0000)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                🗑 Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
