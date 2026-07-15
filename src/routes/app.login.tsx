import { useState, type FormEvent } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import beaconLogoSignin from "@/assets/beacon-logo-signin.png.asset.json";

export const Route = createFileRoute("/app/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Voya Beacon" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith("@voya.com")) {
      setError("Please use your @voya.com email address.");
      return;
    }

    // Temporary shared-secret gate until server-side auth is implemented.
    const SHARED_SECRET = "activation-studio";
    if (password.trim() !== SHARED_SECRET) {
      setError("Invalid password. Contact your team lead for access.");
      return;
    }

    sessionStorage.setItem("activation-studio-user", trimmedEmail);
    router.navigate({ to: "/app" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
      <div className="w-full max-w-sm mx-4">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-2xl p-8 shadow-2xl shadow-black/30">
            <img
              src={beaconLogoSignin.url}
              alt="Beacon by Voya"
              className="h-[21rem] w-auto"
            />
          </div>
          <p className="mt-4 text-sm text-white/60">Sign in with your Voya credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-white/70 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@voya.com"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/50 focus:border-[#FF4B00]/50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-white/70 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/50 focus:border-[#FF4B00]/50"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#FF4B00] hover:bg-[#e04400] text-white font-medium py-2.5 text-sm transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-white/30">Internal use only</p>
      </div>
    </div>
  );
}
