import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Divider,
  Code,
  VStack,
  Button,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import CodeEditor from "../components/CodeEditor";
import Output from "../components/Output";

const problems = {
  "two-sum": {
    title: "Two Sum",
    starterCode: `class Solution:
    def twoSum(self, nums, target):
        pass
`,
    description: (
      <>
        <Text>
          Given an array of integers <Code>nums</Code> and an integer{" "}
          <Code>target</Code>, return indices of the two numbers such that they
          add up to <Code>target</Code>.
        </Text>

        <Text>
          You may assume that each input would have exactly one solution, and
          you may not use the same element twice.
        </Text>

        <Divider />

        <Heading size="md">Example 1</Heading>
        <Code p={2} bg="gray.100" display="block">
          nums = [2,7,11,15]
          <br />
          target = 9
        </Code>
        <Text>Output: [0,1]</Text>

        <Divider />

        <Heading size="md">Example 2</Heading>
        <Code p={2} bg="gray.100" display="block">
          nums = [3,2,4]
          <br />
          target = 6
        </Code>
        <Text>Output: [1,2]</Text>

        <Divider />

        <Heading size="md">Constraints</Heading>
        <Text>2 ≤ nums.length ≤ 10⁴</Text>
        <Text>-10⁹ ≤ nums[i] ≤ 10⁹</Text>
        <Text>-10⁹ ≤ target ≤ 10⁹</Text>
      </>
    ),
  },

  "reverse-string": {
    title: "Reverse String",
    starterCode: `class Solution:
    def reverseString(self, s):
        pass
`,
    description: (
      <>
        <Text>
          Write a function that reverses a string. The input string is given as a
          string <Code>s</Code>.
        </Text>

        <Divider />

        <Heading size="md">Example 1</Heading>
        <Code p={2} bg="gray.100" display="block">
          s = "hello"
        </Code>
        <Text>Output: "olleh"</Text>

        <Divider />

        <Heading size="md">Example 2</Heading>
        <Code p={2} bg="gray.100" display="block">
          s = "abcd"
        </Code>
        <Text>Output: "dcba"</Text>

        <Divider />

        <Heading size="md">Constraints</Heading>
        <Text>1 ≤ s.length ≤ 10⁵</Text>
        <Text>s consists of printable ASCII characters</Text>
      </>
    ),
  },
};

export default function CodePage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const problem = problems[questionId];

  const editorRef = useRef(null);
  const [language] = useState("python");

  if (!problem) {
    return <Box p={6}>Problem not found</Box>;
  }

  return (
    <Grid templateColumns="1fr 1.7fr" height="100vh">
      <GridItem p={6} overflowY="auto" borderRight="1px solid #e5e7eb">
        <Button
          size="sm"
          mb={4}
          onClick={() => navigate("/")}
        >
          ← Back to Problems
        </Button>

        <VStack align="start" spacing={4}>
          <Heading>{problem.title}</Heading>
          {problem.description}
        </VStack>
      </GridItem>

      <GridItem p={4} display="flex" flexDirection="column" gap={3}>
        <Box border="1px solid #e5e7eb" borderRadius="6px" overflow="hidden">
          <CodeEditor
            editorRef={editorRef}
            language={language}
            initialCode={problem.starterCode}
          />
        </Box>

        <Box flex="1" overflowY="auto">
          <Output
            editorRef={editorRef}
            questionId={questionId}
            language={language}
          />
        </Box>
      </GridItem>
    </Grid>
  );
}
