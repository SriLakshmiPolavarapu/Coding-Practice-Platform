import {
  Box,
  Heading,
  HStack,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const questions = [
  { id: "two-sum", title: "Two Sum", difficulty: "Easy" },
  { id: "reverse-string", title: "Reverse String", difficulty: "Easy" },
  { id: "palindrome", title: "Palindrome Number", difficulty: "Easy" },
  { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Medium" },
  { id: "merge-sorted", title: "Merge Two Sorted Lists", difficulty: "Hard" },
];

const difficultyTagStyle = {
  Easy: {
    bg: "#22c55e",   
    color: "white",
  },
  Medium: {
    bg: "#facc15",   
    color: "black",
  },
  Hard: {
    bg: "#ef4444",   
    color: "white",
  },
};

export default function QuestionsPage() {
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      display="flex"
      justifyContent="center"
      pt={12}
    >
      <Box
        width="700px"
        bg="white"
        p={6}
        borderRadius="10px"
        boxShadow="md"
      >
        <Heading mb={6}>Problems</Heading>

        <VStack align="stretch" spacing={3}>
          {questions.map((q) => (
            <HStack
              key={q.id}
              p={4}
              border="1px solid #e5e7eb"
              borderRadius="8px"
              justify="space-between"
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              transition="background 0.2s"
              onClick={() => navigate(`/problems/${q.id}`)}
            >
              <Text fontWeight="500">{q.title}</Text>

              <Box
                px={3}
                py={1}
                borderRadius="1px"
                fontSize="0.85em"
                fontWeight="600"
                bg={difficultyTagStyle[q.difficulty].bg}
                color={difficultyTagStyle[q.difficulty].color}
                minW="80px"
                textAlign="center"
              >
                {q.difficulty}
              </Box>
            </HStack>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}
