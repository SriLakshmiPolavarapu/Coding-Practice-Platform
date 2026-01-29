import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Select,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import Output from "../components/Output";
import questions from "../data/questions.json";

export default function CodePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");

  const question = questions.find((q) => q.id === id);

  // 🔴 Load template when question or language changes
  useEffect(() => {
    if (!question) return;

    const template = question.languageTemplates[language];
    setCode(template);
  }, [language, question]);

  if (!question) {
    return (
      <Box p={10}>
        <Text>Question not found</Text>
        <Button mt={4} onClick={() => navigate("/")}>
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box display="flex" height="100vh">
      {/* LEFT SIDE — PROBLEM DESCRIPTION */}
      <Box
        width="45%"
        p={8}
        overflowY="auto"
        borderRight="1px solid #e5e7eb"
      >
        <Button
          size="sm"
          mb={4}
          onClick={() => navigate("/")}
        >
          ← Back to Problems
        </Button>

        <Heading mb={4}>{question.title}</Heading>

        <Text mb={4}>{question.description}</Text>

        <Heading size="md" mt={6} mb={2}>
          Examples
        </Heading>

        {question.testCases.map((tc, idx) => (
          <Box key={idx} mb={3}>
            <Text fontWeight="600">Example {idx + 1}</Text>
            <Text>Input: {JSON.stringify(tc.input)}</Text>
            <Text>Output: {JSON.stringify(tc.output)}</Text>
          </Box>
        ))}
      </Box>

      {/* RIGHT SIDE — EDITOR */}
      <Box width="55%" p={6}>
        {/* Language Selector */}
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          width="160px"
          mb={2}
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </Select>

        {/* Code Editor */}
        <Editor
          height="70vh"
          theme="vs-dark"
          language={language === "python" ? "python" : "javascript"}
          value={code}
          onMount={(editor) => (editorRef.current = editor)}
          onChange={(value) => setCode(value)}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
          }}
        />

        {/* Run Button + Output */}
        <Output
          editorRef={editorRef}
          questionId={question.id}
          language={language}
        />
      </Box>
    </Box>
  );
}
