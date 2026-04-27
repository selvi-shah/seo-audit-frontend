import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Step = "credentials" | "otp";

export default function Login() {
  const navigate = useNavigate();
  const { login, register, sendOTP, verifyOTP, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate("/audit");
  }, [isAuthenticated]);

  const [step, setStep]             = useState<Step>("credentials");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone]       = useState("");
  const [otp, setOtp]           = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");

  // ── Step 1 ────────────────────────────────────────────────────────────
  const handleCredentials = async () => {
    try {
      setError("");
      setLoading(true);

      if (!email || !password) {
        setError("Email and password are required");
        return;
      }

      if (!phone) {
        setError("Phone number is required");
        return;
      }

      if (isRegister) {
        await register(email, password, phone);
      }

      // Login → tempToken stored in localStorage inside login()
      const result = await login(email, password);
      setMaskedPhone(result.phone);

      // Send OTP to the rawPhone from backend
      await sendOTP(result.rawPhone);
      setStep("otp");

    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 ────────────────────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    try {
      setError("");
      setLoading(true);

      if (!otp || otp.length < 6) {
        setError("Enter the 6-digit code");
        return;
      }

      // Always read tempToken fresh from localStorage
      const tempToken = localStorage.getItem("tempToken") || "";
      console.log("otp:", otp);
      console.log("tempToken:", tempToken);
      console.log("sessionInfo:", localStorage.getItem("sessionInfo"));

      if (!tempToken) {
        setError("Session expired. Please login again.");
        setStep("credentials");
        return;
      }

      await verifyOTP(otp, tempToken);

    } catch (err: any) {
      console.error("verifyOTP failed:", err);
      const msg = err.response?.data?.error || err.message || "OTP verification failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>

      {/* ── Step 1: Credentials ── */}
      {step === "credentials" && (
        <>
          <h2>{isRegister ? "Register" : "Login"}</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          />
          <input
            placeholder="Phone (e.g. +919876543210)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          />

          <button
            onClick={handleCredentials}
            disabled={loading}
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          >
            {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
          </button>

          <p
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            style={{ cursor: "pointer", color: "blue" }}
          >
            {isRegister ? "Already have account? Login" : "No account? Register"}
          </p>
        </>
      )}

      {/* ── Step 2: OTP ── */}
      {step === "otp" && (
        <>
          <h2>Enter OTP</h2>
          <p style={{ color: "gray" }}>
            Code sent to <strong>{maskedPhone}</strong>
          </p>
          {error && (
            <p style={{
              color: "#b91c1c",
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 6,
              padding: "10px 14px",
              wordBreak: "break-all",
              whiteSpace: "pre-wrap",
            }}>{error}</p>
          )}

          <input
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            inputMode="numeric"
            autoFocus
            style={{ display: "block", marginBottom: 8, width: "100%", fontSize: 24, letterSpacing: 8 }}
          />

          <button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length < 6}
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <p
            onClick={() => { setStep("credentials"); setError(""); setOtp(""); }}
            style={{ cursor: "pointer", color: "blue" }}
          >
            ← Go back
          </p>
        </>
      )}
    </div>
  );
}