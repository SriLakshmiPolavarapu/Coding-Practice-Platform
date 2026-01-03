import { useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import axios from "axios";

export default function Output({ editorRef }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    if (!editorRef?.current) return;

    const code = editorRef.current.getValue();
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/run",
        { code },
        { headers: { "Content-Type": "application/json" } }
      );

      setResult(res.data);
    } catch (err) {
      setResult({
        status: "error",
        error: "Failed to connect to backend",
      });
    }

    setLoading(false);
  };

  return (
    <Box mt={4}>
      <Button
        colorScheme="green"
        onClick={runCode}
        isLoading={loading}
        mb={3}
      >
        Run Code
      </Button>

      {result && (
        <Box
          p={4}
          border="1px solid"
          borderColor="gray.600"
          borderRadius="md"
          fontFamily="monospace"
          whiteSpace="pre-wrap"
        >
          
          {result.status === "correct" && (
            <>
              <Text fontWeight="bold" mb={2}>
                 All {result.totalTests ?? ""} test cases passed
              </Text>

              {Array.isArray(result.results) &&
                result.results.map((tc) => (
                  <Box key={tc.testCase} mb={2}>
                    <Text>Test Case {tc.testCase}: Passed</Text>

                    {tc.input && (
                      <>
                        <Text>
                          nums = {JSON.stringify(tc.input.nums)}
                        </Text>
                        <Text>target = {tc.input.target}</Text>
                      </>
                    )}

                    {tc.expected && (
                      <Text>Expected = {tc.expected}</Text>
                    )}
                  </Box>
                ))}
            </>
          )}

         
          {result.status === "wrong" && (
            <>
              <Text fontWeight="bold" mb={2}>
                 Wrong Answer (Test Case {result.testCase})
              </Text>

              {result.input && (
                <>
                  <Text>
                    nums = {JSON.stringify(result.input.nums)}
                  </Text>
                  <Text>target = {result.input.target}</Text>
                </>
              )}

              {result.expected && (
                <Text>Expected = {result.expected}</Text>
              )}
              {result.got && (
                <Text>Your Output = {result.got}</Text>
              )}
            </>
          )}

          {result.status === "error" && (
            <Text color="red.400">
               Error: {result.error}
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}
