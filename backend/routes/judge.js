import express from "express";
import { executeCode } from "../services/OneCompiler.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const questionsPath = path.resolve(__dirname, "../../src/data/questions.json");
const questions = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));

function parseValue(v) {
  if (typeof v !== "string") return JSON.stringify(v);
  if (v.startsWith("[") || v.startsWith("{")) return v;
  if (v === "true") return "True";
  if (v === "false") return "False";
  if (!isNaN(v) && v.trim() !== "") return v;
  return JSON.stringify(v);
}

function parseValueJS(v) {
  if (typeof v !== "string") return JSON.stringify(v);
  if (v.startsWith("[") || v.startsWith("{")) return v;
  if (!isNaN(v) && v.trim() !== "") return v;
  return JSON.stringify(v);
}

function buildRunnableCode(language, userCode, functionName, input) {
  const { output, expected, ...cleanInput } = input;

  if (language === "python") {
    const args = Object.entries(cleanInput)
      .map(([k, v]) => `${k}=${parseValue(v)}`)
      .join(", ");

    return `
${userCode}

sol = Solution()
result = sol.${functionName}(${args})
print(result)
`.trim();
  }

  if (language === "javascript") {
    const args = Object.values(cleanInput)
      .map(v => parseValueJS(v))
      .join(", ");

    return `
${userCode}

const result = ${functionName}(${args});
console.log(JSON.stringify(result));
`.trim();
  }

  return userCode;
}

const normalize = (val) =>
  String(val)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[\[\]]/g, "")
    .replace(/,+/g, ",")
    .trim();

router.post("/", async (req, res) => {
  try {
    const { code, language, questionId, customInput } = req.body;
    const startTime = Date.now();

    const question = questions.find(q => q.id === questionId);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const testCases = customInput
      ? [{ input: customInput, output: "" }]
      : question.testCases;

    const results = [];

    for (const test of testCases) {
      const runnableCode = buildRunnableCode(
        language,
        code,
        question.functionName,
        test.input
      );

      const userOutput = await executeCode({
        language,
        code: runnableCode,
        input: ""
      });

      const actual = String(userOutput || "").trim();
      const expected = String(test.output ?? "").trim();

      results.push({
        input: test.input,
        expected,
        actual,
        passed: customInput ? true : normalize(actual) === normalize(expected)
      });
    }

    const executionTime = Date.now() - startTime;
    res.json({ success: true, results, executionTime });

  } catch (err) {
    console.error("🔥 JUDGE ERROR:", err);
    res.status(500).json({ success: false, error: "Execution failed" });
  }
});

export default router;