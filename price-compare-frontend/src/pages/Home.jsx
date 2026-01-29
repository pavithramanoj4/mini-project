import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>SmartBuy – Price Comparison App</h1>
      <p>Compare prices from Amazon, Flipkart & more</p>

      <Link to="/login">
        <button>Login</button>
      </Link>

      <Link to="/signup" style={{ marginLeft: "10px" }}>
        <button>Create Account</button>
      </Link>
    </div>
  );
}
