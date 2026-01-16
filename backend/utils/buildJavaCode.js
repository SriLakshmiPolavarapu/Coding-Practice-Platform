export default function buildJavaCode(userCode, question) {
    const { functionName, testCases } = question;
  
    function toJavaLiteral(val) {
      if (typeof val === "number") return String(val);
      if (typeof val === "string") return `"${val.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
      if (Array.isArray(val)) {
  
        return `new int[]{${val.map(toJavaLiteral).join(", ")}}`;
      }
      return "null";
    }
  
    function guessType(val) {
      if (typeof val === "number") return "int";
      if (typeof val === "string") return "String";
      if (Array.isArray(val)) return "int[]";
      return "Object";
    }
  
    const testLines = testCases.map((tc, idx) => {
      const inp = tc.input;
      const expected = tc.output;
  
      const keys = Object.keys(inp);
      const args = keys.map((k) => toJavaLiteral(inp[k])).join(", ");
  
      const expectedLit = toJavaLiteral(expected);
      const expectedType = guessType(expected);
  
      const isArray = Array.isArray(expected);
  
      const compare = isArray
        ? `java.util.Arrays.equals(result, ${expectedLit})`
        : `java.util.Objects.equals(result, ${expectedLit})`;
  
      const gotToString = isArray
        ? `java.util.Arrays.toString(result)`
        : `String.valueOf(result)`;
  
      const expToString = isArray
        ? `java.util.Arrays.toString(${expectedLit})`
        : `String.valueOf(${expectedLit})`;
  
      return `
          // Test ${idx + 1}
          try {
              ${expectedType} result = sol.${functionName}(${args});
              if (!(${compare})) {
                  System.out.println("WRONG_ANSWER");
                  System.out.println("Test: ${idx + 1}");
                  System.out.println("Input: ${JSON.stringify(inp).replace(/"/g, '\\"')}");
                  System.out.println("Expected: " + ${expToString});
                  System.out.println("Got: " + ${gotToString});
                  return;
              }
          } catch (Exception e) {
              System.out.println("RUNTIME_ERROR: Test ${idx + 1}: " + e.getMessage());
              return;
          }
      `;
    });
  
    return `
  import java.util.*;
  
  // ===== USER CODE START =====
  ${userCode}
  // ===== USER CODE END =====
  
  public class Main {
      public static void main(String[] args) {
          Solution sol;
          try {
              sol = new Solution();
          } catch (Exception e) {
              System.out.println("RUNTIME_ERROR: Failed to create Solution(): " + e.getMessage());
              return;
          }
  
          ${testLines.join("\n")}
  
          System.out.println("ACCEPTED");
      }
  }
  `;
  }
  