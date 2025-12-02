import questions from "../data/questions.json";
import QuestionItem from "../components/QuestionItem";

export default function QuestionPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Questions
      </h1>

      <div style={{ width: "60%" }}>
        {questions.map((q) => (
          <QuestionItem key={q.id} question={q} />
        ))}
      </div>
    </div>
  );
}
