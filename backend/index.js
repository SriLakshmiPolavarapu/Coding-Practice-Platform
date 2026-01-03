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

  const testCases = [
    { nums: [2,7,11,15], target: 9, expected: [0,1] },
    { nums: [3,2,4], target: 6, expected: [1,2] },
    { nums: [3,3], target: 6, expected: [0,1] }
  ];

  try {
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];

      const finalCode = `
${userCode}

import json
result = twoSum(${JSON.stringify(tc.nums)}, ${tc.target})
print(json.dumps(result))
`;

      const response = await axios.post(
        "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
        {
          language: "python",
          files: [{ name: "main.py", content: finalCode }]
        },
        {
          headers: {
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
            "X-RapidAPI-Host": "onecompiler-apis.p.rapidapi.com"
          }
        }
      );

      const output = JSON.parse(response.data.stdout);

      if (JSON.stringify(output) !== JSON.stringify(tc.expected)) {
        return res.json({
          status: "wrong",
          testCase: i + 1,
          expected: tc.expected,
          got: output
        });
      }
    }

    return res.json({
      status: "correct",
      totalTests: testCases.length
    });

  } catch (err) {
    return res.json({ status: "error", error: err.message });
  }
});
