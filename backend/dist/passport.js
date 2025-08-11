"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_github2_1 = require("passport-github2");
const config_1 = require("./config");
console.log("hello 14");
// Corrected Passport strategy
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: config_1.GITHUB_CLIENT_ID,
    clientSecret: config_1.GITHUB_CLIENT_SECRET,
    callbackURL: config_1.GITHUB_CALLBACK_URL || "http://localhost:4000/auth/github/callback",
    scope: ["read:user", "user:email"], // Required scopes to fetch email
}, async (accessToken, _refreshToken, profile, done) => {
    try {
        let email = null;
        // 1. Try to get email directly from the profile object first
        if (profile.emails && profile.emails[0]) {
            email = profile.emails[0].value;
        }
        // 2. If no email is found, try fetching it manually
        if (!email) {
            console.log("[GitHub Auth] No email from profile, fetching manually…");
            // ---- DEBUGGING LOGS ADDED HERE ----
            console.log("[GitHub Auth] Access Token received:", accessToken);
            try {
                const emailResponse = await fetch("https://api.github.com/user/emails", {
                    headers: {
                        Authorization: `token ${accessToken}`,
                        "User-Agent": "pingroom-app",
                        Accept: "application/vnd.github.v3+json",
                    },
                });
                console.log("[GitHub Auth] API Response Status:", emailResponse.status);
                if (!emailResponse.ok) {
                    console.warn("[GitHub Auth] Email fetch failed:", await emailResponse.text());
                    // Important: We should not fail the login if email cannot be fetched
                }
                else {
                    // Cast the JSON response to an array to resolve the 'unknown' type error
                    const emails = (await emailResponse.json());
                    console.log("[GitHub Auth] /user/emails response:", emails);
                    const primaryEmail = emails.find((e) => e.primary && e.verified);
                    if (primaryEmail) {
                        email = primaryEmail.email;
                    }
                }
            }
            catch (fetchErr) {
                console.warn("[GitHub Auth] Error fetching email manually:", fetchErr);
                // Continue with the login even if email fetch fails
            }
        }
        // 3. Build the final user object and pass it to the 'done' callback
        const user = {
            id: profile.id,
            username: profile.username,
            displayName: profile.displayName || profile.username,
            email: email,
            avatar: profile.photos?.[0]?.value || null,
        };
        console.log("[GitHub Auth] Final user object:", user);
        return done(null, user);
    }
    catch (err) {
        console.error("[GitHub Auth] Unexpected error during authentication:", err);
        return done(err, null);
    }
}));
// Session serialization and deserialization
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((obj, done) => {
    done(null, obj);
});
exports.default = passport_1.default;
