"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://192.168.1.72:3000/api/admin-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStep("code");
    } catch (err: any) {
      setError(err.message || "Error enviando código");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // ✅ GUARDAR SESIÓN DE ADMIN
      localStorage.setItem("isAdminLogged", "true");

      // 🚀 REDIRIGIR AL PANEL ADMIN
      router.push("/");

    } catch (err: any) {
      setError(err.message || "Código incorrecto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-bold text-center mb-4">TELMEX ADMIN</h1>
          <img src="/trabajador.jpg" alt="Login" className="w-40 h-32 mb-2" />
        </div>
        
        {error && (
          <p className="mb-4 text-red-600 text-sm text-center">
            {error}
          </p>
        )}

        {step === "email" && (
          <form onSubmit={sendCode} className="space-y-4">
            <input
              type="email"
              placeholder="Correo del admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={verifyCode} className="space-y-4">
            <input
              type="text"
              placeholder="Código de 6 dígitos"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {loading ? "Verificando..." : "Verificar código"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
