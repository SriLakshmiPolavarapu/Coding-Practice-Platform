import fs from "fs";
import path from "path";
import { exec } from "child_process";
import os from "os";

function runCmd(cmd, cwd) {
  return new Promise((resolve) => {
    exec(cmd, { cwd, timeout: 8000 }, (error, stdout, stderr) => {
      resolve({
        error: error ? String(error.message || error) : null,
        stdout: stdout?.toString() || "",
        stderr: stderr?.toString() || ""
      });
    });
  });
}

export async function runPython(fullCode) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lc-py-"));
  const file = path.join(dir, "main.py");
  fs.writeFileSync(file, fullCode, "utf8");

  const result = await runCmd(`python3 main.py`, dir);
  return result;
}

export async function runJava(fullCode) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lc-java-"));
  const file = path.join(dir, "Main.java");
  fs.writeFileSync(file, fullCode, "utf8");

  const compile = await runCmd(`javac Main.java`, dir);
  if (compile.error || compile.stderr) {
    return {
      error: compile.error,
      stdout: compile.stdout,
      stderr: compile.stderr || "Compilation error"
    };
  }

  const run = await runCmd(`java Main`, dir);
  return run;
}
