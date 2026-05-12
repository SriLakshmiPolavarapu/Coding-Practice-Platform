import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "../firebase";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Try logging in instead.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/user-not-found":
        return "No account found with this email. Sign up first.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-credential":
        return "Invalid email or password. Please check and try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/problems");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        padding: "40px",
        borderRadius: "16px",
        background: "#ffffff",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            fontSize: "28px",
            fontWeight: "800",
            color: "#0f172a",
            marginBottom: "4px",
            letterSpacing: "-0.5px",
          }}>
            {"<"} CodePractice {"/>"}
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
        </div>

        {/* Toggle */}
        <div style={{
          display: "flex",
          borderRadius: "10px",
          background: "#f1f5f9",
          padding: "4px",
          marginBottom: "28px",
        }}>
          {["Login", "Sign Up"].map((label, i) => {
            const active = i === 0 ? !isSignUp : isSignUp;
            return (
              <button
                key={label}
                onClick={() => { setIsSignUp(i === 1); setError(""); }}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "all 0.2s",
                  background: active ? "#0f172a" : "transparent",
                  color: active ? "#fff" : "#64748b",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: "12px 14px",
            borderRadius: "8px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            fontSize: "13px",
            marginBottom: "20px",
            lineHeight: "1.5",
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <div>
          <div style={{ marginBottom: "18px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#334155",
              marginBottom: "6px",
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1.5px solid #e2e8f0",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#334155",
              marginBottom: "6px",
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1.5px solid #e2e8f0",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          {isSignUp && (
            <div style={{ marginBottom: "18px" }}>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#334155",
                marginBottom: "6px",
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1.5px solid #e2e8f0",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "8px",
              border: "none",
              background: loading ? "#94a3b8" : "#2563eb",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              marginTop: "8px",
            }}
          >
            {loading
              ? "Please wait..."
              : isSignUp
                ? "Create Account"
                : "Log In"
            }
          </button>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: "center",
          fontSize: "13px",
          color: "#94a3b8",
          marginTop: "24px",
          marginBottom: 0,
        }}>
          {isSignUp
            ? "Already have an account? "
            : "Don't have an account? "
          }
          <span
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            style={{
              color: "#2563eb",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {isSignUp ? "Log in" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
