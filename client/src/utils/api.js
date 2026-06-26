const API_URL = 'http://localhost:5000/api/analyze';

export async function analyzeCode(code, language = 'javascript') {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  });
  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.statusText}`);
  }
  return response.json();
}
