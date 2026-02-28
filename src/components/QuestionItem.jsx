import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function QuestionItem({ question, isSolved }) {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(isSolved);

  const difficultyColor = {
    Easy: "#2db55d",
    Medium: "#f5a623",
    Hard: "#e74c3c"
  };

  return (
    <div
      onClick={() => navigate(`/problems/${question.id}`)}
      style={{
        border: "1px solid #e0e0e0",
        padding: "14px 18px",
        marginBottom: "10px",
        borderRadius: "8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          style={{ marginRight: "12px", cursor: "pointer" }}
        />
        <span style={{ fontWeight: "500", fontSize: "1rem" }}>
          {question.title}
        </span>
      </div>
      <span
        style={{
          background: difficultyColor[question.difficulty],
          color: "white",
          padding: "4px 12px",
          borderRadius: "12px",
          fontSize: "0.85rem",
          fontWeight: "500",
          whiteSpace: "nowrap"
        }}
      >
        {question.difficulty}
      </span>
    </div>
  );
}