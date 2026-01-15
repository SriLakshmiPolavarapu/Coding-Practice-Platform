import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuestionsPage from "./pages/QuestionsPage";
import CodePage from "./pages/CodePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuestionsPage />} />
        <Route path="/problems/:questionId" element={<CodePage />} />
      </Routes>
    </BrowserRouter>
  );
}
