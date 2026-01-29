import express from "express";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";

import buildPythonCode from "../utils/buildPythonCode.js";
import buildJavaScriptCode from "../utils/buildJavaScriptCode.js";

const router = express.Router();

// Resolve __dirname (ESM-safe)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load questions.json safely
const questionsPath = path.resolve(
  __dirname,
  "../../src/data/questions.json"
);
const questions = JSON.parse(
  fs.readFileSync(questionsPath, "utf-8")
);

router.post("/run", async (req, res) => {
  const { questionId, language, code } = req.body;

  console.log("========== RUN REQUEST ==========");
  console.log("Question ID:", questionId);
  console.log("Language RECEIVED:", language);
  console.log("=================================");

  const question = questions.find((q) => q.id === questionId);
  if (!question) {
    return res.json({ stderr: "Question not found" });
  }

  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  let filename;
  let command;
  let finalCode;

  try {
    if (language === "python") {
      console.log("👉 Using PYTHON test harness");
      filename = "main.py";
      finalCode = buildPythonCode(code, question);
      command = `python3 ${filename}`;
    } else if (language === "javascript") {
      console.log("👉 Using JAVASCRIPT test harness");
      filename = "main.js";
      finalCode = buildJavaScriptCode(code, question);
      command = `node ${filename}`;
    } else {
      return res.json({ stderr: "Unsupported language" });
    }

    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, finalCode);

    exec(command, { cwd: tempDir }, (error, stdout, stderr) => {
      if (error && !stdout) {
        return res.json({
          stdout: "",
          stderr: stderr || error.message,
        });
      }

      return res.json({
        stdout,
        stderr,
      });
    });
  } catch (err) {
    return res.json({
      stdout: "",
      stderr: err.message,
    });
  }
});

export default router;
