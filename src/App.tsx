import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ProtectedRoute from "./components/common/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div style={{ minHeight: "100vh", backgroundColor: "#0a0e27", color: "white", padding: "40px", textAlign: "center" }}>
                <h1>Dashboard</h1>
                <p>Loading...</p>
              </div>
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
