export default function buildPythonCode(userCode, question) {
    const { functionName, testCases } = question;
  
    let code = `
  ${userCode}
  
  import json
  import sys
  import traceback
  
  results = []
  
  def normalize(x):
      if isinstance(x, tuple):
          return list(x)
      if isinstance(x, list):
          return [normalize(i) for i in x]
      if isinstance(x, dict):
          return {k: normalize(v) for k, v in x.items()}
      return x
  
  # If syntax error exists, Python will exit before this point
  
  try:
      s = Solution()
  except Exception:
      print(json.dumps({
          "status": "RUNTIME_ERROR",
          "error": traceback.format_exc()
      }))
      sys.exit(0)
  `;
  
    testCases.forEach((tc, idx) => {
      const args = Object.values(tc.input)
        .map(v => JSON.stringify(v))
        .join(", ");
  
      code += `
  # ---- Test Case ${idx + 1} ----
  try:
      output = s.${functionName}(${args})
  except Exception:
      print(json.dumps({
          "status": "RUNTIME_ERROR",
          "testCase": ${idx + 1},
          "error": traceback.format_exc()
      }))
      sys.exit(0)
  
  passed = normalize(output) == normalize(${JSON.stringify(tc.output)})
  
  results.append({
      "testCase": ${idx + 1},
      "input": ${JSON.stringify(tc.input)},
      "expected": ${JSON.stringify(tc.output)},
      "output": output,
      "passed": passed
  })
  
  if not passed:
      print(json.dumps({
          "status": "WRONG_ANSWER",
          "results": results
      }))
      sys.exit(0)
  `;
    });
  
    code += `
  print(json.dumps({
      "status": "ACCEPTED",
      "results": results
  }))
  `;
  
    return code;
  }
  