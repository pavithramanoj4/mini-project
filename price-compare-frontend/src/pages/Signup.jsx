import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <h1>Create Account</h1>

      <input placeholder="Name" />
      <input placeholder="Email" />
      <input type="password" placeholder="Password" />

      <button onClick={() => navigate("/dashboard")}>Sign Up</button>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
