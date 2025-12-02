import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import questions from "../data/questions.json";

export default function CodePage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("// write your code here...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find question from your JSON
    const q = questions.find((q) => q.id === Number(id));
    setQuestion(q || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div style={styles.center}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div style={styles.center}>
        <h2>Question not found</h2>
        <Link to="/">Go back</Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      {/* HEADER */}
      <div style={styles.header}>
        <Link to="/" style={styles.backLink}>
          ← Back
        </Link>
        <h2 style={{ margin: 0 }}>{question.title}</h2>
        <span
          style={{
            ...styles.difficulty,
            background: difficultyColor(question.difficulty),
          }}
        >
          {question.difficulty}
        </span>
      </div>

      {/* MAIN SPLIT SCREEN */}
      <div style={{ flex: 1, display: "flex" }}>
        {/* LEFT SIDE (placeholder text for now) */}
        <div style={styles.leftPane}>
          <h3>Description</h3>
          <p>
            (Add detailed descriptions later — your JSON currently does not have
            descriptions)
          </p>

          <h3>Examples</h3>
          <p>(Examples will go here)</p>

          <h3>Constraints</h3>
          <p>(Constraints will go here)</p>
        </div>

        {/* RIGHT SIDE (Code Editor) */}
        <div style={styles.rightPane}>
          <div style={styles.buttonRow}>
            <button onClick={() => setCode("// write your code here...")}>
              Reset
            </button>
            <button onClick={() => console.log("Running:", code)}>
              Run Code
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={styles.textarea}
          />
        </div>
      </div>
    </div>
  );
}

/* --- STYLES --- */

const styles = {
  header: {
    padding: "15px",
    borderBottom: "1px solid #ccc",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  backLink: {
    color: "blue",
    textDecoration: "underline",
    cursor: "pointer",
  },
  difficulty: {
    color: "white",
    padding: "5px 10px",
    borderRadius: "8px",
    fontSize: "0.9rem",
  },
  leftPane: {
    width: "50%",
    padding: "20px",
    borderRight: "1px solid #ddd",
    overflowY: "auto",
  },
  rightPane: {
    width: "50%",
    display: "flex",
    flexDirection: "column",
  },
  buttonRow: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
    display: "flex",
    gap: "10px",
  },
  textarea: {
    flex: 1,
    width: "100%",
    padding: "15px",
    fontFamily: "monospace",
    fontSize: "14px",
    border: "none",
    outline: "none",
    resize: "none",
  },
  center: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
  },
};

function difficultyColor(level) {
  switch (level) {
    case "Easy":
      return "green";
    case "Medium":
      return "orange";
    case "Hard":
      return "red";
    default:
      return "gray";
  }
}
