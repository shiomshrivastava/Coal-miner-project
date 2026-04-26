import { useState } from "react";
import axios from "axios";
import "./Login.css"; // CSS file ko import zaroor karna

function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, {
        name,
        password,
      });

      const role = res.data.role;
      if (role === "admin") window.location.href = "/admin";
      else if (role === "miner") window.location.href = "/miner";
      else if (role === "investigator") window.location.href = "/investigator";
    } catch (err) {
      const status = err?.response?.status;
      const backendMsg = err?.response?.data?.error;
      const mixedContentLikely =
        window.location.protocol === "https:" &&
        typeof API_BASE_URL === "string" &&
        API_BASE_URL.startsWith("http://");

      if (status === 401) {
        alert(backendMsg || "Invalid Credentials!");
      } else if (mixedContentLikely || err?.code === "ERR_NETWORK") {
        alert("Login blocked: HTTPS frontend cannot call HTTP backend. Use HTTPS backend URL or proxy via Vercel.");
      } else {
        alert(backendMsg || "Login failed due to server/network issue.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>IoT Dashboard</h2>
          <p>Smart Safety Monitoring System</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "Login to System"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;