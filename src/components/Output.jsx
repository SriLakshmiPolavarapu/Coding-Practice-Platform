import { useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import axios from "axios";

export default function Output({ editorRef, questionId, language }) {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    if (!editorRef?.current) return;

    const code = editorRef.current.getValue();

    // 🔴 CRITICAL LOG
    console.log("LANGUAGE SENT FROM FRONTEND:", language);

    setLoading(true);
    setOutput("");

    try {
      const res = await axios.post(
        "http://localhost:5001/api/run",
        { questionId, language, code },
        { headers: { "Content-Type": "application/json" } }
      );

      const stdout = res.data?.stdout || "";
      const stderr = res.data?.stderr || "";

      if (stderr && !stdout) {
        setOutput(stderr);
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(stdout);

        if (parsed.status === "ACCEPTED") {
          let text = `All ${parsed.results.length} test cases passed\n\n`;
          parsed.results.forEach((tc) => {
            text += `Test Case ${tc.testCase}: Passed\n`;
            Object.entries(tc.input).forEach(([k, v]) => {
              text += `${k} = ${JSON.stringify(v)}\n`;
            });
            text += `Expected = ${JSON.stringify(tc.expected)}\n\n`;
          });
          setOutput(text);
        } else if (parsed.status === "WRONG_ANSWER") {
          let text = "Wrong Answer\n\n";
          parsed.results.forEach((tc) => {
            text += `Test Case ${tc.testCase}: ${
              tc.passed ? "Passed" : "Failed"
            }\n`;
            text += `Input = ${JSON.stringify(tc.input)}\n`;
            text += `Expected = ${JSON.stringify(tc.expected)}\n`;
            text += `Output = ${JSON.stringify(tc.output)}\n\n`;
          });
          setOutput(text);
        } else if (parsed.status === "RUNTIME_ERROR") {
          setOutput(parsed.error);
        }
      } catch {
        setOutput(stdout || stderr);
      }
    } catch {
      setOutput("Error: Failed to connect to backend");
    }

    setLoading(false);
  };

  return (
    <Box>
      <Button
        colorScheme="green"
        onClick={runCode}
        isLoading={loading}
        mb={3}
      >
        Run Code
      </Button>

      {output && (
        <Box
          p={4}
          border="1px solid #e5e7eb"
          borderRadius="6px"
          fontFamily="monospace"
          whiteSpace="pre-wrap"
          bg="white"
        >
          {output}
        </Box>
      )}
    </Box>
  );
}
