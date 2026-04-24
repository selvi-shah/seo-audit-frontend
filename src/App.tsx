import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Audit from "./pages/Audit";
import ProtectedRoute from "./pages/ProtectedRoute";

export default function App() {
  return (
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

      </Routes>
    </BrowserRouter>
  );
}