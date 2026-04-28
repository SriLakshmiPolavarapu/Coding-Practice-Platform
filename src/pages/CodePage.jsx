import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questions from "../data/questions.json";
import CodeEditor from "../components/CodeEditor";
import LanguageSelector from "../components/LanguageSelector";
import TestResults from "../components/TestResults";

import axios from "axios";
const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001" });

const SUBMISSIONS_KEY = (slug) => `submissions_${slug}`;
const SOLVED_KEY = "solved_problems";

const getSubmissions = (slug) => {
  try {
    return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY(slug))) || [];
  } catch {
    return [];
  }
};

const saveSubmission = (slug, submission) => {
  const existing = getSubmissions(slug);
  const updated = [submission, ...existing];
  localStorage.setItem(SUBMISSIONS_KEY(slug), JSON.stringify(updated));
  return updated;
};

const getSolved = () => {
  try {
    return JSON.parse(localStorage.getItem(SOLVED_KEY)) || [];
  } catch {
    return [];
  }
};

const markSolved = (slug) => {
  const existing = getSolved();
  if (!existing.includes(slug)) {
    localStorage.setItem(SOLVED_KEY, JSON.stringify([...existing, slug]));
  }
};

const getErrorMessage = (err) => {
  if (!err.response) {
    return "Cannot connect to the server. Make sure the backend is running on port 5001.";
  }
  const status = err.response?.status;
  const serverMsg = err.response?.data?.error;
  if (status === 400) return serverMsg || "Bad request. Check your code and try again.";
  if (status === 404) return "Question not found. Try refreshing the page.";
  if (status === 408) return "Your code took too long to run. Check for infinite loops.";
  if (status === 500) return serverMsg || "Server error. Check the backend logs.";
  return serverMsg || "Something went wrong. Please try again.";
};

// ── Hints Component ───────────────────────────────────────────────
const HintsSection = ({ hints }) => {
  const [revealed, setRevealed] = useState([]);

  const revealNext = () => {
    if (revealed.length < hints.length) {
      setRevealed((prev) => [...prev, prev.length]);
    }
  };

  return (
    <div style={{ marginTop: "24px" }}>
      <h4 style={{ marginBottom: "12px" }}>💡 Hints</h4>

      {revealed.map((idx) => (
        <div key={idx} style={{
          background: "#fffbeb",
          border: "1px solid #fcd34d",
          borderRadius: "6px",
          padding: "10px 14px",
          marginBottom: "8px",
          fontSize: "0.9rem",
          lineHeight: "1.6",
          color: "#444",
        }}>
          <strong>Hint {idx + 1}:</strong> {hints[idx]}
        </div>
      ))}

      {revealed.length < hints.length ? (
        <button
          onClick={revealNext}
          style={{
            background: "none",
            border: "1px solid #f5a623",
            color: "#f5a623",
            padding: "6px 14px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: "600",
          }}
        >
          {revealed.length === 0 ? "Show Hint 1" : `Show Hint ${revealed.length + 1}`}
        </button>
      ) : (
        <p style={{ fontSize: "0.85rem", color: "#888", marginTop: "4px" }}>
          All hints revealed.
        </p>
      )}
    </div>
  );
};

const CodePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const question = questions.find((q) => q.id === slug);

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [submissions, setSubmissions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [customFields, setCustomFields] = useState({});
  const [customResult, setCustomResult] = useState(null);
  const [isSolved, setIsSolved] = useState(false);

  const inputKeys = question ? Object.keys(question.testCases[0].input) : [];

  useEffect(() => {
    setCode("");
    setOutput(null);
    setActiveTab("description");
    setCustomResult(null);
    if (question) {
      setCustomFields(Object.fromEntries(inputKeys.map((k) => [k, ""])));
      setSubmissions(getSubmissions(slug));
      setIsSolved(getSolved().includes(slug));
    }
  }, [slug]);

  useEffect(() => {
    if (question?.languageTemplates?.[language]) {
      setCode(question.languageTemplates[language]);
    }
  }, [question, language]);

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput({ error: "Editor is empty. Write some code before running.", mode: "run" });
      return;
    }
    setIsRunning(true);
    setOutput(null);
    try {
      const response = await api.post("/api/judge", { code, language, questionId: slug });
      setOutput({ ...response.data, mode: "run" });
    } catch (err) {
      setOutput({ error: getErrorMessage(err), mode: "run" });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setOutput({ error: "Editor is empty. Write some code before submitting.", mode: "submit" });
      return;
    }
    setIsSubmitting(true);
    setOutput(null);
    try {
      const response = await api.post("/api/judge", { code, language, questionId: slug });
      const data = response.data;
      const allPassed = data.results && data.results.every((r) => r.passed);
      const submission = {
        id: Date.now(),
        code,
        language,
        timestamp: new Date().toISOString(),
        status: allPassed ? "Accepted" : "Wrong Answer",
        executionTime: data.executionTime,
        timeComplexity: data.timeComplexity,
        results: data.results,
      };
      const updated = saveSubmission(slug, submission);
      setSubmissions(updated);

      if (allPassed) {
        markSolved(slug);
        setIsSolved(true);
      }

      setOutput({ ...data, mode: "submit", status: submission.status });
    } catch (err) {
      setOutput({ error: getErrorMessage(err), mode: "submit" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const runCustomTest = async () => {
    if (!code.trim()) {
      setCustomResult({ error: "Editor is empty. Write some code first." });
      return;
    }
    try {
      const response = await api.post("/api/judge", {
        code, language, questionId: slug, customInput: customFields,
      });
      setCustomResult(response.data);
    } catch (err) {
      setCustomResult({ error: getErrorMessage(err) });
    }
  };

  const difficultyColor = { Easy: "#2db55d", Medium: "#f5a623", Hard: "#e74c3c" };

  if (!question) {
    return <div style={{ padding: "20px" }}><h2>Question not found</h2></div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif", overflow: "hidden" }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        width: "40%", borderRight: "1px solid #e0e0e0",
        display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#fff"
      }}>
        <div style={{ display: "flex", borderBottom: "1px solid #e0e0e0", flexShrink: 0 }}>
          {["description", "submissions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 20px", border: "none", background: "none",
                cursor: "pointer", fontWeight: activeTab === tab ? "700" : "400",
                borderBottom: activeTab === tab ? "2px solid #000" : "2px solid transparent",
                fontSize: "14px", textTransform: "capitalize",
              }}
            >
              {tab === "submissions"
                ? `Submissions${submissions.length > 0 ? ` (${submissions.length})` : ""}`
                : "Description"}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {activeTab === "description" && (
            <>
              <button
                onClick={() => navigate("/problems")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#555", fontSize: "0.9rem", marginBottom: "16px",
                  padding: 0, display: "flex", alignItems: "center", gap: "4px"
                }}
              >
                ← Back to Problems
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <h2 style={{ margin: 0 }}>{question.title}</h2>
                <span style={{
                  background: difficultyColor[question.difficulty],
                  color: "white", padding: "3px 10px",
                  borderRadius: "12px", fontSize: "0.8rem", fontWeight: "500"
                }}>
                  {question.difficulty}
                </span>
                {isSolved && (
                  <span style={{
                    background: "#e6f9ed", color: "#1a7f37",
                    padding: "3px 10px", borderRadius: "12px",
                    fontSize: "0.8rem", fontWeight: "600",
                    border: "1px solid #a8e6bc"
                  }}>
                    ✓ Solved
                  </span>
                )}
              </div>

              <p style={{ color: "#444", lineHeight: "1.6", marginBottom: "24px" }}>
                {question.description}
              </p>

              <h4 style={{ marginBottom: "8px" }}>Examples</h4>
              {question.testCases.map((tc, i) => (
                <div key={i} style={{
                  background: "#f6f6f6", borderRadius: "6px",
                  padding: "10px 14px", marginBottom: "10px",
                  fontSize: "0.9rem", fontFamily: "monospace"
                }}>
                  <div><strong>Example {i + 1}</strong></div>
                  <div>Input: {JSON.stringify(tc.input)}</div>
                  <div>Output: {JSON.stringify(tc.output)}</div>
                </div>
              ))}

              {/* ── Hints ── */}
              {question.hints && question.hints.length > 0 && (
                <HintsSection hints={question.hints} />
              )}
            </>
          )}

          {activeTab === "submissions" && (
            <SubmissionsPanel
              submissions={submissions}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
            />
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        width: "60%", display: "flex", flexDirection: "column",
        overflow: "hidden", backgroundColor: "#fafafa"
      }}>
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #e0e0e0", backgroundColor: "#fff", flexShrink: 0 }}>
          <LanguageSelector language={language} setLanguage={setLanguage} />
        </div>

        <div style={{ flex: 1, overflow: "hidden" }}>
          <CodeEditor question={question} language={language} code={code} setCode={setCode} />
        </div>

        <div style={{
          padding: "12px 20px", borderTop: "1px solid #e0e0e0",
          backgroundColor: "#fff", display: "flex", gap: "12px",
          alignItems: "center", flexShrink: 0
        }}>
          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            style={{
              background: "#2db55d", color: "white", border: "none",
              padding: "8px 24px", borderRadius: "6px",
              cursor: isRunning || isSubmitting ? "not-allowed" : "pointer",
              fontWeight: "bold", fontSize: "0.95rem",
              opacity: isRunning || isSubmitting ? 0.7 : 1,
            }}
          >
            {isRunning ? "Running..." : "▶ Run Code"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            style={{
              background: "#2563eb", color: "white", border: "none",
              padding: "8px 24px", borderRadius: "6px",
              cursor: isRunning || isSubmitting ? "not-allowed" : "pointer",
              fontWeight: "bold", fontSize: "0.95rem",
              opacity: isRunning || isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          {isSolved && (
            <span style={{ color: "#1a7f37", fontWeight: "600", fontSize: "14px" }}>
              ✓ Solved
            </span>
          )}
        </div>

        {/* Output */}
        {output && (
          <div style={{
            borderTop: "1px solid #e0e0e0", backgroundColor: "#fff",
            padding: "0 20px 16px", maxHeight: "260px", overflowY: "auto", flexShrink: 0
          }}>
            {output.error ? (
              <div style={{
                margin: "12px 0 8px", padding: "12px 16px", borderRadius: "6px",
                background: "#fff3cd", border: "1px solid #ffc107",
                color: "#856404", fontSize: "14px", lineHeight: "1.6",
              }}>
                ⚠️ {output.error}
              </div>
            ) : (
              <>
                {output.mode === "submit" && (
                  <div style={{
                    margin: "12px 0 8px", padding: "10px 16px", borderRadius: "6px",
                    background: output.status === "Accepted" ? "#1a7f37" : "#cf222e",
                    color: "#fff", fontWeight: "700", fontSize: "15px",
                  }}>
                    {output.status === "Accepted" ? "✓ Accepted" : "✗ Wrong Answer"}
                  </div>
                )}
                {output.executionTime !== undefined && (
                  <div style={{ display: "flex", gap: "20px", margin: "12px 0 8px", fontSize: "14px", color: "#555" }}>
                    <span>⏱ Execution Time: <strong>{output.executionTime} ms</strong></span>
                    <span>📊 Time Complexity: <strong>{output.timeComplexity || "O(n)"}</strong></span>
                  </div>
                )}
                <TestResults results={output.results} />
              </>
            )}
          </div>
        )}

        {/* Custom Test */}
        <div style={{
          margin: "12px 20px", padding: "16px",
          border: "1px solid #e0e0e0", borderRadius: "8px",
          backgroundColor: "#fff", flexShrink: 0
        }}>
          <h3 style={{ marginTop: 0 }}>Custom Test Cases</h3>
          {inputKeys.map((key) => (
            <div key={key} style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ minWidth: "70px", fontWeight: "bold" }}>{key}:</label>
              <input
                value={customFields[key] || ""}
                onChange={(e) => setCustomFields((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={Array.isArray(question.testCases[0].input[key]) ? "e.g. [1,2,3]" : `Enter ${key}`}
                style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", width: "250px" }}
              />
            </div>
          ))}
          <button
            onClick={runCustomTest}
            style={{
              padding: "6px 14px", borderRadius: "6px", border: "none",
              cursor: "pointer", background: "#1a73e8", color: "white", fontWeight: "500"
            }}
          >
            Run Custom
          </button>
          {customResult && (
            <div style={{
              marginTop: "12px", padding: "10px", borderRadius: "6px",
              background: customResult.error ? "#fff3cd" : "#f6f6f6",
              border: customResult.error ? "1px solid #ffc107" : "none",
            }}>
              {customResult.error
                ? <span style={{ color: "#856404", fontSize: "13px" }}>⚠️ {customResult.error}</span>
                : <><strong>Output:</strong> {customResult.results?.[0]?.actual ?? "No output returned"}</>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Submissions Panel ─────────────────────────────────────────────
const SubmissionsPanel = ({ submissions, expandedId, setExpandedId }) => {
  if (submissions.length === 0) {
    return (
      <div style={{ color: "#888", marginTop: 40, textAlign: "center" }}>
        No submissions yet.<br />Click <strong>Submit</strong> to record your solution.
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Submissions</h3>
      {submissions.map((sub) => (
        <div key={sub.id} style={{ border: "1px solid #e0e0e0", borderRadius: "8px", marginBottom: "12px", overflow: "hidden" }}>
          <div
            onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", cursor: "pointer", background: "#fafafa",
            }}
          >
            <span style={{ fontWeight: "700", color: sub.status === "Accepted" ? "#1a7f37" : "#cf222e" }}>
              {sub.status === "Accepted" ? "✓" : "✗"} {sub.status}
            </span>
            <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#888" }}>
              {sub.timeComplexity && <span>📊 {sub.timeComplexity}</span>}
              <span>{sub.language} &nbsp;|&nbsp; {new Date(sub.timestamp).toLocaleString()}</span>
            </div>
            <span style={{ fontSize: "12px", color: "#888" }}>
              {expandedId === sub.id ? "▲" : "▼"}
            </span>
          </div>

          {expandedId === sub.id && (
            <div style={{ borderTop: "1px solid #e0e0e0" }}>
              <pre style={{
                margin: 0, padding: "16px", background: "#1e1e1e",
                color: "#d4d4d4", fontSize: "13px", overflowX: "auto", fontFamily: "monospace",
              }}>
                {sub.code}
              </pre>
              {sub.results && (
                <div style={{ padding: "8px 14px", background: "#f6f8fa" }}>
                  <TestResults results={sub.results} />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CodePage;