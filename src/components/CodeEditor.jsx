import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ editorRef, language, question }) {
  const [code, setCode] = useState(
    question.languageTemplates[language]
  );

  useEffect(() => {
    setCode(question.languageTemplates[language]);
  }, [language, question]);

  return (
    <Box>
      <Editor
        height="420px"
        language={language === "javascript" ? "javascript" : "python"}
        value={code}
        theme="vs-dark"
        onMount={(editor) => {
          editorRef.current = editor;
        }}
        onChange={(value) => setCode(value)}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </Box>
  );
}
