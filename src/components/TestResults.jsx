import React, { useState } from "react";

const TestResults = ({ results }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!results || results.length === 0) return null;

  const activeResult = results[activeTab];

  return (
    <div style={{ marginTop: "12px" }}>

      {/* Tab row — one button per test case */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
        {results.map((result, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: activeTab === i ? "700" : "400",
              background: activeTab === i
                ? (result.passed ? "#1a7f37" : "#cf222e")
                : (result.passed ? "#e6f9ed" : "#fdecea"),
              color: activeTab === i
                ? "white"
                : (result.passed ? "#1a7f37" : "#cf222e"),
            }}
          >
            {result.passed ? "✓" : "✗"} Case {i + 1}
          </button>
        ))}
      </div>

      {/* Detail panel for active test case */}
      {activeResult && (
        <div style={{
          border: `1px solid ${activeResult.passed ? "#a8e6bc" : "#f5c6cb"}`,
          borderRadius: "8px",
          overflow: "hidden",
          fontSize: "13px",
          fontFamily: "monospace",
        }}>
          {/* Status bar */}
          <div style={{
            background: activeResult.passed ? "#1a7f37" : "#cf222e",
            color: "white",
            padding: "8px 14px",
            fontWeight: "700",
          }}>
            {activeResult.passed ? "✓ Passed" : "✗ Failed"}
          </div>

          {/* Input */}
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #e0e0e0", background: "#fafafa" }}>
            <div style={{ color: "#888", fontSize: "11px", marginBottom: "4px", fontFamily: "Arial, sans-serif", textTransform: "uppercase" }}>
              Input
            </div>
            {Object.entries(activeResult.input || {}).map(([k, v]) => (
              <div key={k} style={{ color: "#222" }}>{k} = {JSON.stringify(v)}</div>
            ))}
          </div>

          {/* Expected */}
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #e0e0e0", background: "#fafafa" }}>
            <div style={{ color: "#888", fontSize: "11px", marginBottom: "4px", fontFamily: "Arial, sans-serif", textTransform: "uppercase" }}>
              Expected Output
            </div>
            <div style={{ color: "#1a7f37", fontWeight: "600" }}>
              {String(activeResult.expected)}
            </div>
          </div>

          {/* Actual */}
          <div style={{ padding: "10px 14px", background: activeResult.passed ? "#f6fef9" : "#fff8f8" }}>
            <div style={{ color: "#888", fontSize: "11px", marginBottom: "4px", fontFamily: "Arial, sans-serif", textTransform: "uppercase" }}>
              Your Output
            </div>
            <div style={{ color: activeResult.passed ? "#1a7f37" : "#cf222e", fontWeight: "600" }}>
              {String(activeResult.actual) || "(no output)"}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div style={{ marginTop: "8px", fontSize: "12px", color: "#666", fontFamily: "Arial, sans-serif" }}>
        {results.filter(r => r.passed).length} / {results.length} test cases passed
      </div>

    </div>
  );
};

export default TestResults;