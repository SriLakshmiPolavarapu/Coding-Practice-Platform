import React from "react";
import { Link } from "react-router-dom";
import questions from "../data/questions.json";

const QuestionsPage = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Problems</h1>

      {questions.map((q) => (
        <div
          key={q.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px"
          }}
        >
          <Link
            to={`/problems/${q.id}`}
            style={{ textDecoration: "none", fontWeight: "bold" }}
          >
            {q.title}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default QuestionsPage;