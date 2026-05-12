import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { auth, onAuthStateChanged } from "./firebase";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import QuestionsPage from "./pages/QuestionsPage";
import CodePage from "./pages/CodePage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={loading ? null : user ? <Navigate to="/problems" /> : <LoginPage />}
          />
          <Route
            path="/"
            element={<Navigate to="/problems" />}
          />
          <Route
            path="/problems"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <QuestionsPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/problems/:slug"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <CodePage user={user} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
