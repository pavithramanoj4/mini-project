import { useNavigate } from "react-router-dom";
import "./navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="nav-left">
        <h2>🛒 SmartCompare</h2>
      </div>

      <div className="nav-right">
        <button onClick={() => navigate("/compare")}>
          Compare
        </button>

        <button onClick={() => navigate("/history")}>
          History
        </button>

        {/* ❤️ NEW WISHLIST BUTTON */}
        <button onClick={() => navigate("/wishlist")}>
          Wishlist
        </button>

        <button onClick={() => navigate("/profile")}>
          My Profile
        </button>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}