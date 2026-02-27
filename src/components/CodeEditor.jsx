import React, { useRef } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ question, language, code, setCode }) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleChange = (value) => {
    setCode(value || "");
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <Editor
        height="400px"
        language={language}
        value={code}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
        }}
      />
    </div>
  );
};

export default CodeEditor;