import { useNavigate } from "react-router-dom";

export default function Profile() {
  const user = localStorage.getItem("user");
  const navigate = useNavigate();

  return (
    <div className="center">
      <h1>👤 Profile</h1>
      <p>Name: <b>{user}</b></p>
      <button onClick={() => navigate("/compare")}>Back</button>
      <button onClick={() => {
        localStorage.clear();
        navigate("/");
      }}>Logout</button>
    </div>
  );
}
