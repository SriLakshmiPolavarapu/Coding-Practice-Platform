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
    return res.json({ status: "error", error: "No code provided" });
  }

  const testCases = [
    { nums: [2, 7, 11, 15], target: 9, expected: "[0, 1]" },
    { nums: [3, 2, 4], target: 6, expected: "[1, 2]" },
    { nums: [3, 3], target: 6, expected: "[0, 1]" }
  ];

  try {
    for (let i = 0; i < testCases.length; i++) {
      const { nums, target, expected } = testCases[i];


      const finalCode = `
nums = ${JSON.stringify(nums)}
target = ${target}

${userCode}
`;

      const response = await axios.post(
        "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
        {
          language: "python",
          stdin: "",
          files: [{ name: "main.py", content: finalCode }]
        },
        {
          headers: {
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
            "X-RapidAPI-Host": "onecompiler-apis.p.rapidapi.com",
            "Content-Type": "application/json"
          }
        }
      );

      const stdout = response.data.stdout?.trim();
      const stderr = response.data.stderr;

      if (stderr) {
        return res.json({
          status: "error",
          testCase: i + 1,
          error: stderr
        });
      }

      if (stdout !== expected && stdout !== expected.replace(" ", "")) {
        return res.json({
          status: "wrong",
          testCase: i + 1,
          expected,
          got: stdout
        });
      }
    }

    return res.json({ status: "correct" });

  } catch (err) {
    return res.json({ status: "error", error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");

});
