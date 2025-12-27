import { useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import axios from "axios";

export default function Output({ editorRef }) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    const code = editorRef.current.getValue();

    setLoading(true);
    setResult("");

    try {
      const res = await axios.post("http://localhost:5000/api/run", {
        code,
      });

      if (res.data.status === "correct") {
        setResult("✅ Correct Answer");
      } else if (res.data.status === "wrong") {
        setResult(
          `❌ Wrong Answer\nExpected: [0, 1]\nYour Output: ${res.data.output}`
        );
      } else {
        setResult(`❌ Error:\n${res.data.error}`);
      }
    } catch (err) {
      setResult("❌ Failed to connect to backend");
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
          p={3}
          border="1px solid"
          borderColor="gray.600"
          borderRadius="md"
          whiteSpace="pre-wrap"
          fontFamily="monospace"
        >
          <Text>{result}</Text>
        </Box>
      )}
    </Box>
  );
}
