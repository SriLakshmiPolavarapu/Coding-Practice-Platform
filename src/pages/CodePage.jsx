import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import questions from "../data/questions.json";
import CodeEditor from "../components/CodeEditor";
import LanguageSelector from "../components/LanguageSelector";
import TestResults from "../components/TestResults";

const CodePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const question = questions.find(q => q.id === slug);

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [customResult, setCustomResult] = useState(null);
  const [steps, setSteps] = useState([]);
  const [customFields, setCustomFields] = useState({});

  const inputKeys = question ? Object.keys(question.testCases[0].input) : [];

  useEffect(() => {
    if (question) {
      setCustomFields(Object.fromEntries(inputKeys.map(k => [k, ""])));
    }
  }, [slug]);

  useEffect(() => {
    if (question?.languageTemplates?.[language]) {
      setCode(question.languageTemplates[language]);
    }
  }, [question, language]);

  const handleRun = async () => {
    try {
      const response = await api.post("/judge", { code, language, questionId: slug });
      setOutput(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const runCustomTest = async () => {
    try {
      const response = await api.post("/judge", {
        code, language, questionId: slug, customInput: customFields
      });
      setCustomResult(response.data);
      const firstVal = Object.values(customFields)[0];
      if (inputKeys.length === 1 && typeof firstVal === "string" && !firstVal.startsWith("[")) {
        generateSteps(firstVal);
      } else {
        setSteps([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generateRandomInput = () => {
    const newFields = {};
    inputKeys.forEach(key => {
      const sample = question.testCases[0].input[key];
      if (Array.isArray(sample)) {
        const len = Math.floor(Math.random() * 4) + 2;
        newFields[key] = JSON.stringify(
          Array.from({ length: len }, () => Math.floor(Math.random() * 20) + 1)
        );
      } else if (typeof sample === "number") {
        newFields[key] = String(Math.floor(Math.random() * 20) + 1);
      } else {
        const chars = "abcdefghijklmnopqrstuvwxyz";
        let str = "";
        for (let i = 0; i < 6; i++) str += chars[Math.floor(Math.random() * chars.length)];
        newFields[key] = str;
      }
    });
    setCustomFields(newFields);
  };

  const generateSteps = (str) => {
    let result = [], temp = "";
    for (let ch of str) { temp = ch + temp; result.push(temp); }
    setSteps(result);
  };

  const difficultyColor = { Easy: "#2db55d", Medium: "#f5a623", Hard: "#e74c3c" };

  if (!question) {
    return <div style={{ padding: "20px" }}><h2>Question not found</h2></div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif", overflow: "hidden" }}>

      {/* LEFT PANEL - Question Description */}
      <div style={{
        width: "40%",
        borderRight: "1px solid #e0e0e0",
        overflowY: "auto",
        padding: "24px",
        backgroundColor: "#fff"
      }}>
        {/* Back button */}
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

        {/* Title + difficulty */}
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

        {/* Examples from test cases */}
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
      </div>

      {/* RIGHT PANEL - Editor + Controls */}
      <div style={{
        width: "60%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        backgroundColor: "#fafafa"
      }}>
        {/* Language selector bar */}
        <div style={{
          padding: "12px 20px",
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#fff"
        }}>
          <LanguageSelector language={language} setLanguage={setLanguage} />
        </div>

        {/* Editor */}
        <div style={{ flex: 1 }}>
          <CodeEditor
            question={question}
            language={language}
            code={code}
            setCode={setCode}
          />
        </div>

        {/* Run button */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #e0e0e0", backgroundColor: "#fff" }}>
          <button
            onClick={handleRun}
            style={{
              background: "#2db55d", color: "white", border: "none",
              padding: "8px 24px", borderRadius: "6px",
              cursor: "pointer", fontWeight: "bold", fontSize: "0.95rem"
            }}
          >
            ▶ Run Code
          </button>
        </div>

        {/* Test Results */}
        {output && (
          <div style={{ padding: "0 20px 20px" }}>
            <TestResults results={output.results} executionTime={output.executionTime} />
          </div>
        )}

        {/* Custom Test */}
        <div style={{
          margin: "0 20px 20px",
          padding: "16px",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          backgroundColor: "#fff"
        }}>
          <h3 style={{ marginTop: 0 }}>Custom Test Cases</h3>

          {inputKeys.map(key => (
            <div key={key} style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ minWidth: "70px", fontWeight: "bold" }}>{key}:</label>
              <input
                value={customFields[key] || ""}
                onChange={(e) => setCustomFields(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={Array.isArray(question.testCases[0].input[key]) ? "e.g. [1,2,3]" : `Enter ${key}`}
                style={{
                  padding: "6px 10px", borderRadius: "6px",
                  border: "1px solid #ccc", width: "250px"
                }}
              />
            </div>
          ))}

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
           
           {/* this part is for random generation of test cases */}
           {/*
            <button
              onClick={generateRandomInput}
              style={{
                padding: "6px 14px", borderRadius: "6px",
                border: "1px solid #ccc", cursor: "pointer", background: "#fff"
              }}
            >
              Random
            </button>
           */}
            <button
              onClick={runCustomTest}
              style={{
                padding: "6px 14px", borderRadius: "6px",
                border: "none", cursor: "pointer",
                background: "#1a73e8", color: "white", fontWeight: "500"
              }}
            >
              Run Custom
            </button>
          </div>

          {customResult && (
            <div style={{ marginTop: "12px", padding: "10px", background: "#f6f6f6", borderRadius: "6px" }}>
              <strong>Output:</strong> {customResult.results?.[0]?.actual ?? "No output returned"}
            </div>
          )}
        </div>

        {/* Visualization */}
        {steps.length > 0 && (
          <div style={{ margin: "0 20px 20px", padding: "16px", border: "1px solid #e0e0e0", borderRadius: "8px", backgroundColor: "#fff" }}>
            <h3 style={{ marginTop: 0 }}>Visualization</h3>
            {steps.map((step, i) => (
              <div key={i} style={{ padding: "4px 0", fontFamily: "monospace" }}>
                Step {i + 1}: {step}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePage;