"use client";
import { useEffect, useState } from "react";
import { useAuthModal } from "@/contexts/auth-modal-context";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function AuthModal() {
  const { modal, close } = useAuthModal();
  const { user } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && modal) {
      close();
      router.push("/dashboard");
      router.refresh();
    }
  }, [user, modal, close, router]);

  useEffect(() => {
    if (!modal) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modal, close]);

  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal]);

  if (!modal) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        modal === "sign-in" ? "/api/auth/login" : "/api/auth/register";
      const body =
        modal === "sign-in"
          ? { identifier, password }
          : { email, password, username };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || "Gagal melakukan autentikasi");
      } else {
        // success — auth hook will revalidate
        setIdentifier("");
        setEmail("");
        setUsername("");
        setPassword("");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={close}
    >
      <div
        className="relative animate-fade-up w-90 bg-surface-container-low p-6 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute -right-3 -top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-lg transition hover:scale-110"
          style={{
            background: "var(--surface-container-highest)",
            color: "var(--on-surface)",
            border: "1px solid var(--outline-variant)",
          }}
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold mb-4">
          {modal === "sign-in" ? "Masuk" : "Daftar"}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {modal === "sign-in" ? (
            <input
              type="text"
              placeholder="Email atau username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="input"
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </>
          )}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          {error && <div className="text-sm text-red-500">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full px-5 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--gradient-cta)" }}
          >
            {loading
              ? "Memproses..."
              : modal === "sign-in"
                ? "Masuk"
                : "Daftar"}
          </button>
        </form>
      </div>
    </div>
  );
}
