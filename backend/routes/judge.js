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

// ── Detect runtime errors in output ──────────────────────────────
function detectRuntimeError(output, language) {
  const o = output.toLowerCase();
  if (language === "python") {
    if (o.includes("traceback (most recent call last)")) return "Your code threw a runtime error. Check the Your Output tab for details.";
    if (o.includes("syntaxerror")) return "Syntax error in your code. Check for missing colons, wrong indentation, or typos.";
    if (o.includes("nameerror")) return "NameError — you used a variable that doesn't exist. Check your variable names.";
    if (o.includes("typeerror")) return "TypeError — you're using the wrong data type somewhere (e.g. adding a string and a number).";
    if (o.includes("indexerror")) return "IndexError — you're accessing an index that doesn't exist in a list.";
    if (o.includes("keyerror")) return "KeyError — you're accessing a key that doesn't exist in a dictionary.";
    if (o.includes("zerodivisionerror")) return "ZeroDivisionError — your code is dividing by zero.";
    if (o.includes("attributeerror")) return "AttributeError — you're calling a method that doesn't exist on that object.";
    if (o.includes("recursionerror")) return "RecursionError — your recursive function has no base case or runs too deep.";
  }
  if (language === "javascript") {
    if (o.includes("referenceerror")) return "ReferenceError — you used a variable that is not defined.";
    if (o.includes("typeerror")) return "TypeError — you're calling something that isn't a function, or using wrong types.";
    if (o.includes("syntaxerror")) return "Syntax error in your code. Check for missing brackets, semicolons, or typos.";
    if (o.includes("rangeerror")) return "RangeError — a value is outside the allowed range (e.g. infinite recursion).";
  }
  return null;
}

router.post("/", async (req, res) => {
  try {
    const { code, language, questionId, customInput } = req.body;

    // ── Input validation ──
    if (!code || !code.trim()) {
      return res.status(400).json({ error: "Your code is empty. Write a solution before running." });
    }
    if (!language) {
      return res.status(400).json({ error: "No language selected." });
    }

    const question = questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found. Try refreshing the page." });
    }

    const startTime = Date.now();
    const testCases = customInput
      ? [{ input: customInput, output: "" }]
      : question.testCases;

    const results = [];

    for (const test of testCases) {
      let runnableCode;
      try {
        runnableCode = buildRunnableCode(language, code, question.functionName, test.input);
      } catch (buildErr) {
        return res.status(400).json({ error: `Failed to build your code: ${buildErr.message}` });
      }

      let userOutput;
      try {
        userOutput = await executeCode({ language, code: runnableCode, input: "" });
      } catch (execErr) {
        return res.status(500).json({ error: "Code execution service failed. Make sure your backend is running correctly." });
      }

      const actual = String(userOutput || "").trim();
      const expected = String(test.output ?? "").trim();

      // Check for runtime errors in the output
      const runtimeError = detectRuntimeError(actual, language);

      results.push({
        input: test.input,
        expected,
        actual,
        passed: customInput ? true : (!runtimeError && normalize(actual) === normalize(expected)),
        runtimeError: runtimeError || null,
      });
    }

    const executionTime = Date.now() - startTime;
    const timeComplexity = analyzeTimeComplexity(code, language);

    res.json({ success: true, results, executionTime, timeComplexity });
  } catch (err) {
    console.error("🔥 JUDGE ERROR:", err);
    res.status(500).json({ success: false, error: "Something went wrong on the server. Please try again." });
  }
});

export default router;