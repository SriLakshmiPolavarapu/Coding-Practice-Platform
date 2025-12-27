import axios from "axios";

export async function runCode(code) {
  const response = await axios.post("http://localhost:5000/api/run", {
    code,
  });
  return response.data;
}
