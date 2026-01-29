
var twoSum = function(nums, target) {
    const map = {};
    for (let i = 0; i < nums.length; i++) {
        if (target - nums[i] in map) {
            return [map[target - nums[i]], i];
        }
        map[nums[i]] = i;
    }
};

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
  fn = twoSum;
  if (typeof fn !== "function") {
    throw new Error("Function 'twoSum' is not defined");
  }
} catch (e) {
  console.log(JSON.stringify({
    status: "RUNTIME_ERROR",
    error: e.toString()
  }));
  process.exit(0);
}

try {
  const output = fn([2,7,11,15], 9);
  const passed =
    JSON.stringify(normalize(output)) ===
    JSON.stringify(normalize([0,1]));

  results.push({
    testCase: 1,
    input: {"nums":[2,7,11,15],"target":9},
    expected: [0,1],
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
    testCase: 1,
    error: e.toString()
  }));
  process.exit(0);
}

try {
  const output = fn([3,2,4], 6);
  const passed =
    JSON.stringify(normalize(output)) ===
    JSON.stringify(normalize([1,2]));

  results.push({
    testCase: 2,
    input: {"nums":[3,2,4],"target":6},
    expected: [1,2],
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
    testCase: 2,
    error: e.toString()
  }));
  process.exit(0);
}

console.log(JSON.stringify({
  status: "ACCEPTED",
  results
}));
