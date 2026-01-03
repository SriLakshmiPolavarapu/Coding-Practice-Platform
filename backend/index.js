import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/run", async (req, res) => {
  const userCode = req.body.code;

  if (!userCode) {
    return res.json({
      status: "error",
      error: "No code provided"
    });
  }

  const testCases = [
    { nums: [2, 7, 11, 15], target: 9, expected: [0, 1] },
    { nums: [3, 2, 4], target: 6, expected: [1, 2] },
    { nums: [3, 3], target: 6, expected: [0, 1] }
  ];

  try {
    for (let i = 0; i < testCases.length; i++) {
      const { nums, target, expected } = testCases[i];

      const finalCode = `
${userCode}

import json
result = twoSum(${JSON.stringify(nums)}, ${target})
print(json.dumps(result))
`;

      const response = await axios.post(
        "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
        {
          language: "python",
          files: [
            {
              name: "main.py",
              content: finalCode
            }
          ]
        },
        {
          headers: {
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
            "X-RapidAPI-Host": "onecompiler-apis.p.rapidapi.com",
            "Content-Type": "application/json"
          }
        }
      );

      const stdout = response.data.stdout;
      const stderr = response.data.stderr;

      if (stderr && stderr.trim().length > 0) {
        return res.json({
          status: "error",
          error: stderr
        });
      }
      if (!stdout || stdout.trim().length === 0) {
        return res.json({
          status: "error",
          error: "No output produced by code"
        });
      }

      let output;
      try {
        output = JSON.parse(stdout);
      } catch (e) {
        return res.json({
          status: "error",
          error: "Output is not valid JSON"
        });
      }

      if (JSON.stringify(output) !== JSON.stringify(expected)) {
        return res.json({
          status: "wrong",
          testCase: i + 1,
          input: { nums, target },
          expected,
          got: output
        });
      }
    }

    return res.json({
      status: "correct",
      totalTests: testCases.length,
      results: testCases.map((tc, index) => ({
        testCase: index + 1,
        input: { nums: tc.nums, target: tc.target },
        expected: tc.expected,
        status: "Passed"
      }))
    });

  } catch (err) {
    return res.json({
      status: "error",
      error: err.message
    });
  }
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
