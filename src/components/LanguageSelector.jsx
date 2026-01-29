import {
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
  Text,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

const LANGUAGES = [
  { label: "Python", value: "python" },
  { label: "JavaScript (JS)", value: "javascript" },
];

const LanguageSelector = ({ language, setLanguage }) => {
  const current = LANGUAGES.find(l => l.value === language);

  return (
    <Box mb={4}>
      <Text mb={2} fontSize="md">
        Language
      </Text>

      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          bg="gray.800"
          _hover={{ bg: "gray.700" }}
        >
          {current.label}
        </MenuButton>

        <MenuList bg="gray.900">
          {LANGUAGES.map((lang) => (
            <MenuItem
              key={lang.value}
              bg={lang.value === language ? "gray.800" : "transparent"}
              _hover={{ bg: "gray.700" }}
              onClick={() => setLanguage(lang.value)}
            >
              {lang.label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default LanguageSelector;
