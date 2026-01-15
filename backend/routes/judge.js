import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const questionsPath = path.join(
  __dirname,
  "../../src/data/questions.json"
);

const questions = JSON.parse(
  fs.readFileSync(questionsPath, "utf-8")
);


import express from "express";


import buildPythonCode from "../utils/buildPythonCode.js";
import buildJavaCode from "../utils/buildJavaCode.js";
import { runPython, runJava } from "../services/OneCompiler.js";

const router = express.Router();

function getQuestionById(id) {
  return questions.find(q => q.id === id);
}


router.post("/run", async (req, res) => {
  const { questionId, language, code } = req.body;

  if (!questionId || !language || !code) {
    return res.json({ status: "error", error: "Missing questionId/language/code" });
  }

  const question = getQuestionById(questionId);
  if (!question) {
    return res.json({ status: "error", error: "Invalid questionId" });
  }

  try {
    if (language === "python") {
      const fullCode = buildPythonCode(code, question);
      const result = await runPython(fullCode);
      return res.json({ status: "ok", ...result });
    }

    if (language === "java") {
      const fullCode = buildJavaCode(code, question);
      const result = await runJava(fullCode);
      return res.json({ status: "ok", ...result });
    }

    return res.json({ status: "error", error: "Unsupported language" });
  } catch (e) {
    return res.json({ status: "error", error: String(e) });
  }
});

export default router;
