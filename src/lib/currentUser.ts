import { useEffect, useState } from "react";

const STORAGE_KEY = "activation-studio-user";

export interface CurrentUser {
  email: string;
  name: string;
  firstName: string;
  initials: string;
}

function titleCase(s: string) {
  return s
    .split(/[.\-_ ]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

export function deriveUser(email: string | null): CurrentUser | null {
  if (!email) return null;
  const local = email.split("@")[0] ?? email;
  const name = titleCase(local) || email;
  const parts = name.split(" ");
  const firstName = parts[0] ?? name;
  const initials =
    (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "");
  return { email, name, firstName, initials: initials.toUpperCase() || "U" };
}

export function readCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;
  return deriveUser(sessionStorage.getItem(STORAGE_KEY));
}

export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);
  useEffect(() => {
    setUser(readCurrentUser());
    const onStorage = () => setUser(readCurrentUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return user;
}
