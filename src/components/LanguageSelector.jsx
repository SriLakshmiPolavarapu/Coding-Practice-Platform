import { Box, Menu, MenuButton, MenuItem, MenuList, Button, Text } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

const LANGUAGES = [
  { label: "Python", value: "python" },
  { label: "JavaScript (JS)", value: "javascript" },
];

const LanguageSelector = ({ language, setLanguage }) => {
  const current = LANGUAGES.find(l => l.value === language);
  return (
    <Box mb={4}>
      <Text mb={2} fontSize="md">Language</Text>
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
          {current.label}
        </MenuButton>
        <MenuList>
          {LANGUAGES.map((lang) => (
            <MenuItem
              key={lang.value}
              fontWeight={lang.value === language ? "bold" : "normal"}
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