import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (data.success) {
      alert("✅ Login successful!");
      onLogin(); // Call the onLogin prop to update the login state
      navigate("/dashboard"); // Navigate to the products page
    } else {
      alert("❌ Login failed. Check your credentials.");
    }
  };

  return (
      <div className="login-container w-120 h-70">
        <div className="login-card bg-white shadow rounded p-4">
          <div className="card-body">
            <h2 className="text-center mb-4 fw-bold text-secondary">Login</h2>
            <form onSubmit={handleLogin}>
              {/* Username */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control border-secondary"
                  placeholder="Enter your username"
                  required
                />
              </div>
  
              {/* Password */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control border-secondary"
                  placeholder="Enter your password"
                  required
                />
              </div>
  
              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold shadow-sm">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
  );
};

export default Login;