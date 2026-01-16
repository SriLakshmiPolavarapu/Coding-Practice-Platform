export default function buildPythonCode(userCode, question) {
    const { functionName, testCases } = question;
  
    // 1️⃣ Remove ALL leading whitespace & blank lines
    const cleanedUserCode = userCode.replace(/^\s+/, "");
  
    // 2️⃣ Start file with user code at column 0 (NO template indentation)
    let code = "";
    code += cleanedUserCode + "\n";
    code += "import json\n";
    code += "import sys\n";
    code += "import traceback\n\n";
  
    code += "results = []\n\n";
  
    code += "def normalize(x):\n";
    code += "    if isinstance(x, tuple):\n";
    code += "        return list(x)\n";
    code += "    if isinstance(x, list):\n";
    code += "        return [normalize(i) for i in x]\n";
    code += "    if isinstance(x, dict):\n";
    code += "        return {k: normalize(v) for k, v in x.items()}\n";
    code += "    return x\n\n";
  
    code += "try:\n";
    code += "    s = Solution()\n";
    code += "except Exception:\n";
    code += "    print(json.dumps({\n";
    code += '        "status": "RUNTIME_ERROR",\n';
    code += "        \"error\": traceback.format_exc()\n";
    code += "    }))\n";
    code += "    sys.exit(0)\n\n";
  
    testCases.forEach((tc, idx) => {
      const args = Object.values(tc.input)
        .map(v => JSON.stringify(v))
        .join(", ");
  
      code += `# ---- Test Case ${idx + 1} ----\n`;
      code += "try:\n";
      code += `    output = s.${functionName}(${args})\n`;
      code += "except Exception:\n";
      code += "    print(json.dumps({\n";
      code += '        "status": "RUNTIME_ERROR",\n';
      code += `        "testCase": ${idx + 1},\n`;
      code += "        \"error\": traceback.format_exc()\n";
      code += "    }))\n";
      code += "    sys.exit(0)\n\n";
  
      code += `passed = normalize(output) == normalize(${JSON.stringify(tc.output)})\n\n`;
  
      code += "results.append({\n";
      code += `    "testCase": ${idx + 1},\n`;
      code += `    "input": ${JSON.stringify(tc.input)},\n`;
      code += `    "expected": ${JSON.stringify(tc.output)},\n`;
      code += "    \"output\": output,\n";
      code += "    \"passed\": passed\n";
      code += "})\n\n";
  
      code += "if not passed:\n";
      code += "    print(json.dumps({\n";
      code += '        "status": "WRONG_ANSWER",\n';
      code += "        \"results\": results\n";
      code += "    }))\n";
      code += "    sys.exit(0)\n\n";
    });
  
    code += "print(json.dumps({\n";
    code += '    "status": "ACCEPTED",\n';
    code += "    \"results\": results\n";
    code += "}))\n";
  
    console.log(code.split("\n").slice(0, 5).join("\n"));

    return code;
  }
  