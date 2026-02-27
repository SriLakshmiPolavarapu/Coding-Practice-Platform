import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import QuestionsPage from "./pages/QuestionsPage";
import CodePage from "./pages/CodePage";

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/problems" />} />
          <Route path="/problems" element={<QuestionsPage />} />
          <Route path="/problems/:slug" element={<CodePage />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;