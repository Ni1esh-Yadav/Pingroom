export async function logoutUser(): Promise<boolean> {
 
  try {
    const res = await fetch("https://pingroom.onrender.com/auth/logout", {
      method: "POST",
      credentials: "include", // IMPORTANT: send cookies
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      console.warn("logout failed", res.status, await res.text());
      return false;
    }
    const body = await res.json().catch(() => ({}));
    return !!body.ok;
  } catch (err) {
    console.error("logoutUser error:", err);
    return false;
  }
}
