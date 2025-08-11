import express, { Request, Response } from "express";
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL, ORIGIN } from "../config";

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
}

interface SessionUser {
  id: number;
  username: string;
  displayName: string | null;
  email: string | null;
  avatar: string;
}

declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}

const router = express.Router();

// Step 1: Redirect to GitHub for login
router.get("/github", (_req: Request, res: Response) => {
  const redirect = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    GITHUB_CALLBACK_URL
  )}&scope=read:user user:email`;
  res.redirect(redirect);
});

// Step 2: GitHub callback - exchange code for token and fetch user data
router.get("/github/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send("Missing code parameter");
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL,
      }),
    });

    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      console.error("[GitHub OAuth] No access token:", tokenData);
      return res.status(500).send("Authentication failed");
    }

    // Fetch GitHub user profile
    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${tokenData.access_token}`,
        "User-Agent": "pingroom-app",
      },
    });
    const profile = (await profileRes.json()) as GitHubUser;

    // Fetch user emails
    let email: string | null = null;
    try {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${tokenData.access_token}`,
          "User-Agent": "pingroom-app",
        },
      });

      if (emailRes.ok) {
        const emails = (await emailRes.json()) as GitHubEmail[];
          email = emails.find((e) => e.primary && e.verified)?.email || null;
          console.log(email)
      } else {
        console.warn("[GitHub OAuth] Email fetch failed:", await emailRes.text());
      }
    } catch (err) {
      console.warn("[GitHub OAuth] Error fetching emails:", err);
    }

    // Save in session
    req.session.user = {
      id: profile.id,
      username: profile.login,
      displayName: profile.name,
      email,
      avatar: profile.avatar_url,
    };

    // Redirect back to frontend
    res.redirect(ORIGIN);
  } catch (err) {
    console.error("[GitHub OAuth] Unexpected error:", err);
    res.status(500).send("Authentication failed");
  }
});

// Get current logged-in user
router.get("/me", (req: Request, res: Response) => {
  res.json(req.session.user || null);
});

// Logout
router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

export default router;
