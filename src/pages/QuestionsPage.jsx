import React, { useState, useEffect } from "react";
import questions from "../data/questions.json";
import QuestionItem from "../components/QuestionItem";

const QuestionsPage = () => {
  const [solvedIds, setSolvedIds] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("solved_problems")) || [];
      setSolvedIds(stored);
    } catch {
      setSolvedIds([]);
    }
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
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