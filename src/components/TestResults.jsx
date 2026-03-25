import React from "react";

const TestResults = ({ results, executionTime }) => {
  if (!results || results.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
      {results.map((result, i) => (
        <div
          key={i}
          style={{
            background: result.passed ? "#1a7f37" : "#cf222e",
            color: "white",
            borderRadius: "6px",
            padding: "12px 18px",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          Test Case {i + 1} {result.passed ? "PASSED" : "FAILED"}
        </div>
      ))}
    </div>
  );
};

export default TestResults;