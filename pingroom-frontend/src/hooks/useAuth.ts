import { useEffect, useState } from "react";
import type { User } from "../types";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/auth/me", {
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

  return { user, setUser };
};
