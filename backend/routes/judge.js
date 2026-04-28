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

function analyzeTimeComplexity(code, language) {
  const c = code.toLowerCase();

  if (language === "python") {
    const hasNestedLoop = /for .+ in [\s\S]{0,500}for .+ in /.test(c);
    const hasWhileNested = /while [\s\S]{0,500}for .+ in |for .+ in [\s\S]{0,500}while /.test(c);

    const hasBinary = (
      /left\s*=.*right\s*=/.test(c) ||
      (/mid\s*=/.test(c) && /\/\/\s*2/.test(c))
    );

    const funcMatch = c.match(/def (\w+)\(/);
    const funcName = funcMatch ? funcMatch[1] : null;
    const hasRecursion = funcName && new RegExp(`return [^\\n]*${funcName}\\s*\\(`).test(c);

    const hasSingleLoop = /for .+ in |while /.test(c);
    const hasHashMap = /\{\}|dict\(|defaultdict|set\(/.test(c);

    if (hasNestedLoop || hasWhileNested) return "O(n²)";
    if (hasRecursion && hasBinary) return "O(log n)";
    if (hasBinary) return "O(log n)";
    if (hasRecursion && hasSingleLoop) return "O(n)";
    if (hasRecursion) return "O(n)";
    if (hasSingleLoop) return "O(n)";
    if (hasHashMap) return "O(n)";
    return "O(1)";
  }

  if (language === "javascript") {
    const hasNestedLoop = /for\s*\([\s\S]{0,500}for\s*\(|while\s*\([\s\S]{0,500}for\s*\(/.test(c);

    const hasBinary = (
      /left\s*=.*right\s*=/.test(c) ||
      (/mid\s*=/.test(c) && (/>>\s*1/.test(c) || /math\.floor/.test(c)))
    );

    const funcMatch = c.match(/(?:function|const|var|let)\s+(\w+)\s*(?:=\s*(?:function|\())?/);
    const funcName = funcMatch ? funcMatch[1] : null;
    const hasRecursion = funcName && new RegExp(`return [^\\n]*${funcName}\\s*\\(`).test(c);

    const hasSingleLoop = /for\s*\(|while\s*\(|\.foreach|\.map\(|\.filter\(|\.reduce\(/.test(c);
    const hasHashMap = /new map\(\)|new set\(\)|= \{\}/.test(c);

    if (hasNestedLoop) return "O(n²)";
    if (hasRecursion && hasBinary) return "O(log n)";
    if (hasBinary) return "O(log n)";
    if (hasRecursion) return "O(n)";
    if (hasSingleLoop) return "O(n)";
    if (hasHashMap) return "O(n)";
    return "O(1)";
  }

  return "O(n)";
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
    const timeComplexity = analyzeTimeComplexity(code, language);

    res.json({ success: true, results, executionTime, timeComplexity });
  } catch (err) {
    console.error("🔥 JUDGE ERROR:", err);
    res.status(500).json({ success: false, error: "Execution failed" });
  }
});

export default router;