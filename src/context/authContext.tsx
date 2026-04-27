import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

// ── Types ──────────────────────────────────────────────────────────────────

interface User {
  id: string;
  phone: string;
  email: string | null;
  name: string | null;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ phone: string; rawPhone: string }>;
  register: (email: string, password: string, phone: string) => Promise<void>;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (otp: string, tempToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Bootstrap ──────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      api.get("/auth/me")
        .then((res) => setUser(res.data.user))
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Register ───────────────────────────────────────────────────────────
  async function register(email: string, password: string, phone: string) {
    await api.post("/auth/register", { email, password, phone });
  }

  // ── Login (email + password) → tempToken ──────────────────────────────
  async function login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("tempToken", res.data.tempToken);
    return {
      phone:    res.data.phone,
      rawPhone: res.data.rawPhone,
    };
  }

  // ── Send OTP via Firebase Emulator REST API ────────────────────────────
  // ── Send OTP via Firebase Emulator REST API ────────────────────────────
async function sendOTP(phone: string) {
  console.log("=== sendOTP called ===");
  console.log("phone:", phone);

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || 'fake-api-key';
  const res = await fetch(
    `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: phone,
        iosReceipt: "test",
      }),
    }
  );
  const data = await res.json();
  console.log("sendOTP response:", data);
  if (!res.ok) throw new Error(data.error?.message || "Failed to send OTP");
  localStorage.setItem("sessionInfo", data.sessionInfo);
}

// ── Verify OTP → final JWT ─────────────────────────────────────────────
async function verifyOTP(otp: string, tempToken: string) {
  const sessionInfo = localStorage.getItem("sessionInfo");
  console.log("=== verifyOTP called ===");
  console.log("otp:", otp);
  console.log("tempToken:", tempToken);
  console.log("sessionInfo:", sessionInfo);

  if (!sessionInfo) throw new Error("No pending OTP. Please request a new one.");

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || 'fake-api-key';
  const res = await fetch(
    `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionInfo, code: otp }),
    }
  );
  const data = await res.json();
  console.log("emulator verifyOTP response:", data);
  if (!res.ok) throw new Error(data.error?.message || "Invalid OTP");

  console.log("firebaseIdToken:", data.idToken);

  const backendRes = await api.post("/auth/verify-otp", {
    tempToken,
    firebaseIdToken: data.idToken,
  });
  console.log("backend response:", backendRes.data);

  const { accessToken, refreshToken } = backendRes.data;

  // Store tokens
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.removeItem("tempToken");
  localStorage.removeItem("sessionInfo");

  // Set axios header immediately for next call
  api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

  // Fetch user profile
  const meRes = await api.get("/auth/me");
  console.log("me response:", meRes.data);
  setUser(meRes.data.user);
}

  // ── Logout ─────────────────────────────────────────────────────────────
  async function logout() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } finally {
      localStorage.clear();
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      sendOTP,
      verifyOTP,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}