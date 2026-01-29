class Solution:
    def twoSum(self, nums, target):
        # write your code here
        pass


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
    output = s.twoSum([2,7,11,15], 9)
except Exception:
    print(json.dumps({
        "status": "RUNTIME_ERROR",
        "testCase": 1,
        "error": traceback.format_exc()
    }))
    sys.exit(0)

passed = normalize(output) == normalize([0,1])

results.append({
    "testCase": 1,
    "input": {"nums":[2,7,11,15],"target":9},
    "expected": [0,1],
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
    output = s.twoSum([3,2,4], 6)
except Exception:
    print(json.dumps({
        "status": "RUNTIME_ERROR",
        "testCase": 2,
        "error": traceback.format_exc()
    }))
    sys.exit(0)

passed = normalize(output) == normalize([1,2])

results.append({
    "testCase": 2,
    "input": {"nums":[3,2,4],"target":6},
    "expected": [1,2],
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
