// backend/services/OneCompiler.js

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import os from "os";

// --------------------------------------------------
// Helper to run shell commands safely
// --------------------------------------------------
function runCmd(cmd, cwd) {
  return new Promise((resolve) => {
    exec(
      cmd,
      {
        cwd,
        timeout: 8000, // 8s timeout to prevent infinite loops
      },
      (error, stdout, stderr) => {
        resolve({
          error: error ? String(error.message || error) : null,
          stdout: stdout?.toString() || "",
          stderr: stderr?.toString() || "",
        });
      }
    );
  });
}

// --------------------------------------------------
// PYTHON runner
// --------------------------------------------------
export async function runPython(fullCode) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lc-py-"));
  const file = path.join(dir, "main.py");

  fs.writeFileSync(file, fullCode, "utf8");

  return await runCmd("python3 main.py", dir);
}

// --------------------------------------------------
// JAVASCRIPT runner (Node.js)
// --------------------------------------------------
export async function runJavaScript(fullCode) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lc-js-"));
  const file = path.join(dir, "main.js");

  fs.writeFileSync(file, fullCode, "utf8");

  return await runCmd("node main.js", dir);
}
