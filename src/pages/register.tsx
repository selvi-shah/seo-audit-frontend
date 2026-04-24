import { useState } from "react";
import API from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleRegister = async () => {
    try {
      await API.post("/auth/register", form);
      window.location.href = "/";
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}