import Editor from "@monaco-editor/react";

export default function CodeEditor({
  editorRef,
  language = "python",
  initialCode = "",
}) {
  return (
    <Editor
      height="420px"          // ✅ FIXED HEIGHT (LeetCode-style)
      language={language}
      theme="vs-dark"
      defaultValue={initialCode}
      onMount={(editor) => {
        editorRef.current = editor;
      }}
      options={{
        fontSize: 14,
        lineNumbers: "on",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 12 },
      }}
    />
  );
}
