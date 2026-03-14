import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:8000/history", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setHistory(data));
  }, []);

  return (
    <>
      <Navbar />

      <div style={{
        padding: "40px",
        maxWidth: "900px",
        margin: "auto"
      }}>
        <h2 style={{ marginBottom: "30px" }}>
          📜 Your Search History
        </h2>

        {history.length === 0 && <p>No searches yet.</p>}

        <div style={{ display: "grid", gap: "20px" }}>
          {history.map((item) => (
            <div
              key={item.id}
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "15px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
              }}
            >
              <h3>{item.product_name}</h3>

              <p><strong>Cheapest:</strong> {item.cheapest_platform}</p>

              <p>
                <strong>You Saved:</strong> ₹
                {Number(item.saved_amount).toFixed(2)}
              </p>

              <p style={{ fontSize: "13px", color: "gray" }}>
                {new Date(item.created_at).toLocaleString()}
              </p>

              <button
                onClick={() =>
                  navigate(`/compare?product=${item.product_name}`)
                }
                style={{
                  marginTop: "12px",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#667eea",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                🔄 Re-Compare
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
