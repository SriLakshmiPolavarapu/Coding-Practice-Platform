export function buildPythonCode(userCode, question) {
    return `
  ${userCode}
  
  import json
  import sys
  
  data = json.loads(sys.stdin.read())
  result = ${question.functionName}(**data)
  print(json.dumps(result))
  `;
  }
  