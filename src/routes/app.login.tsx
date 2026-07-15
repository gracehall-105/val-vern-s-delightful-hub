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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-6">
      <div className="w-full max-w-sm mx-4">
        <div className="flex flex-col items-center">
          <img
            src={beaconLogoSignin.url}
            alt="Beacon by Voya"
            className="h-[25.5rem] w-auto"
          />
          <p className="mt-0 mb-2 text-sm text-gray-600">Sign in with your Voya credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
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
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/50 focus:border-[#FF4B00]/50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
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
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4B00]/50 focus:border-[#FF4B00]/50"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#FF570C] hover:bg-[#e64e00] text-white font-medium py-2 text-sm transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <p className="mt-3 text-center text-[11px] text-gray-400">Internal use only</p>
      </div>
    </div>
  );
}
