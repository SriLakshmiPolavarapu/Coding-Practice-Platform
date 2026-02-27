import React, { useState } from "react";

function highlightDiff(expected, actual) {
  if (!expected || expected === actual) return actual;
  return <span style={{ color: "#ff6b6b" }}>{actual}</span>;
}

const TestResults = ({ results = [], executionTime = 0 }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Execution Time: {executionTime} ms</h3>
      {results.map((test, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #444",
            marginBottom: "10px",
            padding: "10px",
            background: test.passed ? "#0f5132" : "#842029",
            color: "white",
            borderRadius: "6px"
          }}
        >
          <div
            style={{ cursor: "pointer", fontWeight: "bold" }}
            onClick={() =>
              setExpandedIndex(expandedIndex === index ? null : index)
            }
          >
            Test Case {index + 1} {test.passed ? "✅ PASSED" : "❌ FAILED"}
          </div>

          {expandedIndex === index && (
            <div style={{ marginTop: "10px" }}>
              <div>
                <strong>Input:</strong> {JSON.stringify(test.input)}
              </div>
              <div>
                <strong>Expected:</strong> {test.expected}
              </div>
              <div>
                <strong>Your Output:</strong>{" "}
                {highlightDiff(test.expected, test.actual)}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TestResults;