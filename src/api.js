const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const runCode = async (code, language, questionId) => {
  const response = await fetch(`${API_URL}/api/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, questionId }),
  });
  return response.json();
};

export const submitCode = async (code, language, questionId) => {
  const response = await fetch(`${API_URL}/api/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, questionId }),
  });
  return response.json();
};