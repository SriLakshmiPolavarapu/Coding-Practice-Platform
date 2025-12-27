import axios from "axios";

export async function runPython(code, input) {
  const response = await axios.post(
    "https://code-compiler.p.rapidapi.com/v2",
    {
      language: "python",
      code,
      input
    },
    {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "code-compiler.p.rapidapi.com",
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
}
