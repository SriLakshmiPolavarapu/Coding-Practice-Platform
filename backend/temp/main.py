class Solution:
    def reverseString(self, s):
        rev = ""
        for ch in s:
            rev = ch + rev
        return rev

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

try:
    s = Solution()
except Exception:
    print(json.dumps({
        "status": "RUNTIME_ERROR",
        "error": traceback.format_exc()
    }))
    sys.exit(0)

# ---- Test Case 1 ----
try:
    output = s.reverseString("hello")
except Exception:
    print(json.dumps({
        "status": "RUNTIME_ERROR",
        "testCase": 1,
        "error": traceback.format_exc()
    }))
    sys.exit(0)

passed = normalize(output) == normalize("olleh")

results.append({
    "testCase": 1,
    "input": {"s":"hello"},
    "expected": "olleh",
    "output": output,
    "passed": passed
})

if not passed:
    print(json.dumps({
        "status": "WRONG_ANSWER",
        "results": results
    }))
    sys.exit(0)

# ---- Test Case 2 ----
try:
    output = s.reverseString("abcd")
except Exception:
    print(json.dumps({
        "status": "RUNTIME_ERROR",
        "testCase": 2,
        "error": traceback.format_exc()
    }))
    sys.exit(0)

passed = normalize(output) == normalize("dcba")

results.append({
    "testCase": 2,
    "input": {"s":"abcd"},
    "expected": "dcba",
    "output": output,
    "passed": passed
})

if not passed:
    print(json.dumps({
        "status": "WRONG_ANSWER",
        "results": results
    }))
    sys.exit(0)

print(json.dumps({
    "status": "ACCEPTED",
    "results": results
}))
