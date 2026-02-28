import React from "react";
import questions from "../data/questions.json";
import QuestionItem from "../components/QuestionItem";

const QuestionsPage = () => {
  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Questions</h2>
      {questions.map((q) => (
        <QuestionItem key={q.id} question={q} isSolved={false} />
      ))}
    </div>
  );
};

export default QuestionsPage;