"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
      credentials: "include",
    });
    setLoading(false);
    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Registrasi gagal");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Daftar</h2>
        <input
          className="input mb-2"
          type="text"
          placeholder="Username (pilihan)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="input mb-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="rounded-full px-5 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--gradient-cta)" }}
          disabled={loading}
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>
    </div>
  );
}
