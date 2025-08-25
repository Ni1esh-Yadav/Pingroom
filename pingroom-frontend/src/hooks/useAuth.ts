import { useEffect, useState } from "react";
import type { User } from "../types";
import { logoutUser } from "../utils/api";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://pingroom.onrender.com/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data ?? null);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch /auth/me", err);
        setUser(null);
      }
    })();
  }, []);

  const onLogout = async () => {
    const ok = await logoutUser();
    if (ok) {
      setUser(null);
      // Option 1: update UI only
      // Option 2: fully reload to clear any cookies and UI state:
      // window.location.href = "/";
    } else {
      // optionally show an error to the user
      throw new Error("Logout failed");
    }
    return ok;
  };

  return { user, setUser, onLogout  };
};
