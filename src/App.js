import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuestionsPage from "./pages/QuestionsPage.jsx";
import CodePage from "./pages/CodePage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuestionsPage />} />
        <Route path="/questions/:id" element={<CodePage />} />
      </Routes>
    </BrowserRouter>
  );
}
