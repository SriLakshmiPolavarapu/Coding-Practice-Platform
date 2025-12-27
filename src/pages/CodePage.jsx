import { useRef } from "react";
import CodeEditor from "../components/CodeEditor";
import Output from "../components/Output";

export default function CodePage() {
  const editorRef = useRef(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT: QUESTION */}
      <div style={{ width: "50%", padding: "20px", borderRight: "1px solid #ddd" }}>
        <h2>Two Sum</h2>

        <p>
          Given an array of integers <code>nums</code> and an integer{" "}
          <code>target</code>, return indices of the two numbers such that they
          add up to <code>target</code>.
        </p>

        <pre>
nums = [2,7,11,15]
target = 9
Output: [0,1]
        </pre>

        <p><b>Note:</b> Write only the function. Do not print anything.</p>
      </div>

      {/* RIGHT: EDITOR + RUN */}
      <div style={{ width: "50%", padding: "20px" }}>
        <CodeEditor editorRef={editorRef} />
        <Output editorRef={editorRef} />
      </div>
    </div>
  );
}
