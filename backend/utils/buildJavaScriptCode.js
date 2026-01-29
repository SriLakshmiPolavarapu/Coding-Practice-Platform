export default function buildJavaScriptCode(userCode, question) {
  const { functionName, testCases } = question;

  let code = `
${userCode}

const results = [];

function normalize(x) {
  if (Array.isArray(x)) return x.map(normalize);
  if (x && typeof x === "object") {
    const obj = {};
    for (const k in x) obj[k] = normalize(x[k]);
    return obj;
  }
  return x;
}

let fn;
try {
  fn = ${functionName};
  if (typeof fn !== "function") {
    throw new Error("Function '${functionName}' is not defined");
  }
} catch (e) {
  console.log(JSON.stringify({
    status: "RUNTIME_ERROR",
    error: e.toString()
  }));
  process.exit(0);
}
`;

  testCases.forEach((tc, idx) => {
    const args = Object.values(tc.input)
      .map(v => JSON.stringify(v))
      .join(", ");

    code += `
try {
  const output = fn(${args});
  const passed =
    JSON.stringify(normalize(output)) ===
    JSON.stringify(normalize(${JSON.stringify(tc.output)}));

  results.push({
    testCase: ${idx + 1},
    input: ${JSON.stringify(tc.input)},
    expected: ${JSON.stringify(tc.output)},
    output,
    passed
  });

  if (!passed) {
    console.log(JSON.stringify({
      status: "WRONG_ANSWER",
      results
    }));
    process.exit(0);
  }
} catch (e) {
  console.log(JSON.stringify({
    status: "RUNTIME_ERROR",
    testCase: ${idx + 1},
    error: e.toString()
  }));
  process.exit(0);
}
`;
  });

  code += `
console.log(JSON.stringify({
  status: "ACCEPTED",
  results
}));
`;

  return code;
}
