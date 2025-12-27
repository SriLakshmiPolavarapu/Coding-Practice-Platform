app.post("/api/run", async (req, res) => {
  const userCode = req.body.code;

  if (!userCode) {
    return res.json({ status: "error", error: "No code provided" });
  }

  try {
    const response = await axios.post(
      "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
      {
        language: "python",
        stdin: "",
        files: [
          {
            name: "main.py",
            content: userCode
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

    const stdout = response.data.stdout?.trim();
    const stderr = response.data.stderr;

    if (stderr) {
      return res.json({ status: "error", error: stderr });
    }

    // Two Sum expected output
    const expected = "[0, 1]";

    if (stdout === expected || stdout === "[0,1]") {
      return res.json({ status: "correct" });
    }

    return res.json({
      status: "wrong",
      output: stdout
    });

  } catch (err) {
    return res.json({
      status: "error",
      error: err.message
    });
  }
});
