import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Audit from "./pages/Audit";
import Compare from "./pages/Compare";
import ProtectedRoute from "./pages/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";


export default function App() {
  return (
  <AuthProvider>
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* PROTECTED AUDIT */}
        <Route
          path="/audit"
          element={
            <ProtectedRoute>
              <Audit />
            </ProtectedRoute>
          }
        />

        {/* PROTECTED COMPARE */}
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <Compare />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  </AuthProvider>
  );
}