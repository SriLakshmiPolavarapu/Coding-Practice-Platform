import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuestionsPage from "./pages/QuestionsPage";
import CodePage from "./pages/CodePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page 1: Questions List */}
        <Route path="/" element={<QuestionsPage />} />

        {/* Page 2: Problem + Editor */}
        <Route path="/problems/:id" element={<CodePage />} />
      </Routes>
    </BrowserRouter>
  );
}
