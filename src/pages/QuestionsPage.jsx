import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import questions from "../data/questions.json";
import QuestionItem from "../components/QuestionItem";
import { auth, signOut } from "../firebase";

const QuestionsPage = ({ user }) => {
  const navigate = useNavigate();
  const [solvedIds, setSolvedIds] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("solved_problems")) || [];
      setSolvedIds(stored);
    } catch {
      setSolvedIds([]);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        padding: "12px 16px",
        background: "#f8fafc",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
      }}>
        <div style={{ fontSize: "13px", color: "#64748b" }}>
          Signed in as{" "}
          <span style={{ fontWeight: "600", color: "#334155" }}>
            {user?.email}
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#64748b",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Questions</h2>
      {questions.map((q) => (
        <QuestionItem
          key={q.id}
          question={q}
          isSolved={solvedIds.includes(q.id)}
        />
      ))}
    </div>
  );
};

export default QuestionsPage;
