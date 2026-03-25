import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questions from "../data/questions.json";
import CodeEditor from "../components/CodeEditor";
import LanguageSelector from "../components/LanguageSelector";
import TestResults from "../components/TestResults";

import axios from "axios";
const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001" });

const SUBMISSIONS_KEY = (slug) => `submissions_${slug}`;

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

  const inputKeys = question ? Object.keys(question.testCases[0].input) : [];

  useEffect(() => {
    setCode("");
    setOutput(null);
    setActiveTab("description");
    setCustomResult(null);
    if (question) {
      setCustomFields(Object.fromEntries(inputKeys.map((k) => [k, ""])));
      setSubmissions(getSubmissions(slug));
    }
  }, [slug]);

  useEffect(() => {
    if (question?.languageTemplates?.[language]) {
      setCode(question.languageTemplates[language]);
    }
  }, [question, language]);

  const handleRun = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setOutput(null);
    try {
      const response = await api.post("/api/judge", { code, language, questionId: slug });
      setOutput({ ...response.data, mode: "run" });
    } catch (err) {
      setOutput({ error: "Failed to connect to server.", mode: "run" });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
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
        results: data.results,
      };
      const updated = saveSubmission(slug, submission);
      setSubmissions(updated);
      setOutput({ ...data, mode: "submit", status: submission.status });
    } catch (err) {
      setOutput({ error: "Failed to connect to server.", mode: "submit" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const runCustomTest = async () => {
    try {
      const response = await api.post("/api/judge", {
        code, language, questionId: slug, customInput: customFields,
      });
      setCustomResult(response.data);
    } catch (err) {
      console.error(err);
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
        {/* Tabs */}
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

        {/* Tab content */}
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
        {/* Language selector */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #e0e0e0", backgroundColor: "#fff", flexShrink: 0 }}>
          <LanguageSelector language={language} setLanguage={setLanguage} />
        </div>

        {/* Editor */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <CodeEditor question={question} language={language} code={code} setCode={setCode} />
        </div>

        {/* Run + Submit buttons */}
        <div style={{
          padding: "12px 20px", borderTop: "1px solid #e0e0e0",
          backgroundColor: "#fff", display: "flex", gap: "12px", flexShrink: 0
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
        </div>

        {/* Output */}
        {output && (
          <div style={{
            borderTop: "1px solid #e0e0e0", backgroundColor: "#fff",
            padding: "0 20px 16px", maxHeight: "260px", overflowY: "auto", flexShrink: 0
          }}>
            {output.error ? (
              <p style={{ color: "red", marginTop: 12 }}>{output.error}</p>
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
                  <p style={{ margin: "12px 0 8px", color: "#555", fontSize: "14px" }}>
                    Execution Time: {output.executionTime} ms
                  </p>
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
            <div style={{ marginTop: "12px", padding: "10px", background: "#f6f6f6", borderRadius: "6px" }}>
              <strong>Output:</strong> {customResult.results?.[0]?.actual ?? "No output returned"}
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
            <span style={{ fontSize: "12px", color: "#888" }}>
              {sub.language} &nbsp;|&nbsp; {new Date(sub.timestamp).toLocaleString()}
            </span>
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