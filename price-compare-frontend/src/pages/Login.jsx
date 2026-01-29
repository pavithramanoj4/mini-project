export default function Login() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const login = () => {
    if (!name) return alert("Enter name");
    localStorage.setItem("user", name);
    navigate("/compare");
  };

  return (
    <div className="center">
      <h1>🔐 Smart Buy Login</h1>
      <input
        placeholder="Enter your name"
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={login}>Login</button>
    </div>
  );
}

