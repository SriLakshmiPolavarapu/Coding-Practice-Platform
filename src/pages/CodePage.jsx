import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import questions from "../data/questions.json";
import CodeEditor from "../components/CodeEditor";
import LanguageSelector from "../components/LanguageSelector";
import TestResults from "../components/TestResults";

const CodePage = () => {
  const { slug } = useParams();
  const question = questions.find(q => q.id === slug);

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [customResult, setCustomResult] = useState(null);
  const [steps, setSteps] = useState([]);
  const [customFields, setCustomFields] = useState({});

  const inputKeys = question ? Object.keys(question.testCases[0].input) : [];

  // Initialize custom fields when question loads
  useEffect(() => {
    if (question) {
      setCustomFields(Object.fromEntries(inputKeys.map(k => [k, ""])));
    }
  }, [slug]);

  // Set starter code when language changes
  useEffect(() => {
    if (question?.languageTemplates?.[language]) {
      setCode(question.languageTemplates[language]);
    }
  }, [question, language]);

  const handleRun = async () => {
    try {
      const response = await api.post("/judge", {
        code,
        language,
        questionId: slug
      });
      setOutput(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const runCustomTest = async () => {
    try {
      const response = await api.post("/judge", {
        code,
        language,
        questionId: slug,
        customInput: customFields
      });
      setCustomResult(response.data);

      // Show visualization only for single string inputs
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
        for (let i = 0; i < 6; i++) {
          str += chars[Math.floor(Math.random() * chars.length)];
        }
        newFields[key] = str;
      }
    });
    setCustomFields(newFields);
  };

  const generateSteps = (str) => {
    let result = [];
    let temp = "";
    for (let ch of str) {
      temp = ch + temp;
      result.push(temp);
    }
    setSteps(result);
  };

  if (!question) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Question not found</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>{question.title}</h2>
      <p>{question.description}</p>

      <LanguageSelector language={language} setLanguage={setLanguage} />

      <CodeEditor
        question={question}
        language={language}
        code={code}
        setCode={setCode}
      />

      <button onClick={handleRun} style={{ marginTop: "10px" }}>
        Run Code
      </button>

      {output && (
        <TestResults
          results={output.results}
          executionTime={output.executionTime}
        />
      )}

      {/* Custom Test Section */}
      <div style={{ marginTop: "30px" }}>
        <h3>Custom Test</h3>

        {inputKeys.map(key => (
          <div key={key} style={{ marginBottom: "8px" }}>
            <label style={{ marginRight: "8px" }}>
              <strong>{key}:</strong>
            </label>
            <input
              value={customFields[key] || ""}
              onChange={(e) =>
                setCustomFields(prev => ({ ...prev, [key]: e.target.value }))
              }
              placeholder={
                Array.isArray(question.testCases[0].input[key])
                  ? "e.g. [1,2,3]"
                  : `Enter ${key}`
              }
              style={{ padding: "5px", width: "250px" }}
            />
          </div>
        ))}

        <div style={{ marginTop: "8px" }}>
          <button onClick={generateRandomInput}>🎲 Random</button>
          <button onClick={runCustomTest} style={{ marginLeft: "10px" }}>
            Run Custom
          </button>
        </div>

        {customResult && (
          <div style={{ marginTop: "10px" }}>
            <strong>Output:</strong>{" "}
            {customResult.results?.[0]?.actual ?? "No output returned"}
          </div>
        )}
      </div>

      {/* Visualization - only for single string inputs */}
      {steps.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Visualization</h3>
          {steps.map((step, i) => (
            <div key={i}>Step {i + 1}: {step}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodePage;