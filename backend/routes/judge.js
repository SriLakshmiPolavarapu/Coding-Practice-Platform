import express from "express";
import questions from "../data/questions.json" assert { type: "json" };
import { runPython } from "../services/OneCompiler.js";
import { buildPythonCode } from "../utils/buildPythonCode.js";

const router = express.Router();

router.post("/run", async (req, res) => {
  const { questionId, userCode } = req.body;
  const question = questions.find(q => q.id === Number(questionId));

  if (!question) {
    return res.status(404).json({ verdict: "Question not found" });
  }

  try {
    for (let i = 0; i < question.testCases.length; i++) {
      const tc = question.testCases[i];
      const finalCode = buildPythonCode(userCode, question);

      const result = await runPython(
        finalCode,
        JSON.stringify(tc.input)
      );

      if (result.stderr) {
        return res.json({
          verdict: "Runtime Error",
          testCase: i + 1,
          error: result.stderr
        });
      }

      const output = JSON.parse(result.output);
      if (JSON.stringify(output) !== JSON.stringify(tc.output)) {
        return res.json({
          verdict: "Wrong Answer",
          testCase: i + 1,
          expected: tc.output,
          got: output
        });
      }
    }

    return res.json({ verdict: "Accepted" });

  } catch (err) {
    return res.status(500).json({
      verdict: "Error",
      message: err.message
    });
  }
});

export default router;
