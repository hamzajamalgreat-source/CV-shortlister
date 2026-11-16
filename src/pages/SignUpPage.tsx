import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0a0e27" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "40px", backgroundColor: "#12152e", borderRadius: "8px", border: "1px solid #2a2d4a" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px", color: "white", textAlign: "center" }}>Create Account</h1>

        {error && (
          <div style={{ padding: "12px", backgroundColor: "#ef4444", color: "white", borderRadius: "6px", marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "white" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #2a2d4a",
                backgroundColor: "#0a0e27",
                color: "white",
                boxSizing: "border-box",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "white" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #2a2d4a",
                backgroundColor: "#0a0e27",
                color: "white",
                boxSizing: "border-box",
                fontSize: "14px",
              }}
            />
            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>At least 8 characters</p>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", fontSize: "14px", color: "white" }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #2a2d4a",
                backgroundColor: "#0a0e27",
                color: "white",
                boxSizing: "border-box",
                fontSize: "14px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p style={{ marginTop: "16px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
          Already have an account? <a href="/login" style={{ color: "#7c3aed", textDecoration: "none", fontWeight: "bold" }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}
