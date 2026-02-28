import React, { useRef } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ language, code, setCode }) => {
  const editorRef = useRef(null);

  return (
    <Editor
      height="450px"
      language={language}
      value={code}
      onChange={(value) => setCode(value || "")}
      onMount={(editor) => { editorRef.current = editor; }}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 10 }
      }}
    />
  );
};

export default CodeEditor;