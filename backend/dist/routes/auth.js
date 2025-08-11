"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const router = express_1.default.Router();
// Step 1: Redirect to GitHub for login
router.get("/github", (_req, res) => {
    const redirect = `https://github.com/login/oauth/authorize?client_id=${config_1.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(config_1.GITHUB_CALLBACK_URL)}&scope=read:user user:email`;
    res.redirect(redirect);
});
// Step 2: GitHub callback - exchange code for token and fetch user data
router.get("/github/callback", async (req, res) => {
    const code = req.query.code;
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
                client_id: config_1.GITHUB_CLIENT_ID,
                client_secret: config_1.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: config_1.GITHUB_CALLBACK_URL,
            }),
        });
        const tokenData = (await tokenRes.json());
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
        const profile = (await profileRes.json());
        // Fetch user emails
        let email = null;
        try {
            const emailRes = await fetch("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `token ${tokenData.access_token}`,
                    "User-Agent": "pingroom-app",
                },
            });
            if (emailRes.ok) {
                const emails = (await emailRes.json());
                email = emails.find((e) => e.primary && e.verified)?.email || null;
                console.log(email);
            }
            else {
                console.warn("[GitHub OAuth] Email fetch failed:", await emailRes.text());
            }
        }
        catch (err) {
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
        res.redirect(config_1.ORIGIN);
    }
    catch (err) {
        console.error("[GitHub OAuth] Unexpected error:", err);
        res.status(500).send("Authentication failed");
    }
});
// Get current logged-in user
router.get("/me", (req, res) => {
    res.json(req.session.user || null);
});
// Logout
router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ ok: true });
    });
});
exports.default = router;
