import Editor from "@monaco-editor/react";

export default function CodeEditor({ editorRef }) {
  const starterCode = `# Write your Python code here
# Print the output

`;

  return (
    <Editor
      height="70vh"
      language="python"
      theme="vs-dark"
      value={starterCode}
      onMount={(editor) => {
        editorRef.current = editor;
      }}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
      }}
    />
  );
}
