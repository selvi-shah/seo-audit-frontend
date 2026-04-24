import { useState } from "react";
import api from "../services/api";

export default function Compare() {
  const [urlA, setUrlA] = useState("");
  const [urlB, setUrlB] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleCompare = async () => {
    try {
      setLoading(true);
      setSent(false);

      const res = await api.post("/audit/compare", {
        urlA,
        urlB,
      });

      setResult(res.data);
    } catch (err) {
      alert("Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      if (!email) return alert("Enter email");

      setLoading(true);

      await api.post("/audit/compare", {
        urlA,
        urlB,
        email,
      });

      setSent(true);
    } catch (err) {
      alert("Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Website Comparison</h2>

        <input
          style={styles.input}
          placeholder="Enter Website A"
          value={urlA}
          onChange={(e) => setUrlA(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Enter Website B"
          value={urlB}
          onChange={(e) => setUrlB(e.target.value)}
        />

        <button
          style={styles.primaryBtn}
          onClick={handleCompare}
          disabled={loading}
        >
          {loading ? "Comparing..." : "Compare Websites"}
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div style={styles.resultCard}>
          <h3>Comparison Result</h3>
          <pre style={styles.pre}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* EMAIL SECTION */}
      {result && (
        <div style={styles.card}>
          <h3>Send Report</h3>

          <input
            style={styles.input}
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            style={styles.secondaryBtn}
            onClick={handleSendEmail}
            disabled={loading}
          >
            Send Email Report
          </button>

          {sent && <p style={styles.success}>✅ Report sent successfully</p>}
        </div>
      )}
    </div>
  );
}

/* STYLES */
const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f8",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  title: {
    marginBottom: "15px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },

  primaryBtn: {
    width: "100%",
    padding: "10px",
    background: "#2c3e50",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  secondaryBtn: {
    width: "100%",
    padding: "10px",
    background: "#2980b9",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  resultCard: {
    width: "100%",
    maxWidth: "700px",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  pre: {
    background: "#f9f9f9",
    padding: "10px",
    borderRadius: "6px",
    overflowX: "auto",
  },

  success: {
    marginTop: "10px",
    color: "green",
  },
};