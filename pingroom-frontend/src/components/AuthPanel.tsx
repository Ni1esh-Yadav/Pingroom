import type { User } from "../types";

type Props = {
  user: User | null;
  queued: boolean;
  joinQueue: () => void;
};

export default function AuthPanel({ user, queued, joinQueue }: Props) {
  if (!user) {
    return (
      <div className=" backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl p-6 max-w-md text-center">
        <p className="mb-6 text-gray-700 text-lg font-medium">
          Welcome to <span className="font-bold text-indigo-600">Pingroom</span>{" "}
          — login to meet developers worldwide 🌍
        </p>
        <a
          href="http://localhost:4000/auth/github"
          className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 transition text-white px-5 py-3 rounded-xl shadow font-semibold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 008 11c.6.1.82-.27.82-.6v-2.2c-3.25.7-3.9-1.57-3.9-1.57-.55-1.4-1.35-1.78-1.35-1.78-1.1-.77.08-.75.08-.75 1.2.08 1.84 1.25 1.84 1.25 1.1 1.9 2.9 1.35 3.6 1.04.1-.8.43-1.35.77-1.65-2.6-.3-5.35-1.3-5.35-5.75 0-1.25.44-2.25 1.2-3.05-.1-.3-.5-1.52.1-3.15 0 0 1-.32 3.3 1.2a11.2 11.2 0 016 0c2.3-1.52 3.3-1.2 3.3-1.2.6 1.63.2 2.85.1 3.15.75.8 1.2 1.8 1.2 3.05 0 4.46-2.75 5.44-5.37 5.73.45.4.85 1.15.85 2.35v3.48c0 .34.22.72.83.6A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
          </svg>
          Login with GitHub
        </a>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl p-6 max-w-md">
      {/* User Profile */}
      <div className="flex items-center gap-4 mb-6">
        {(user.avatar || user.avatar_url) && (
          <img
            src={user.avatar || user.avatar_url || ""}
            alt="avatar"
            className="w-14 h-14 rounded-full border-2 border-indigo-500 shadow-sm object-cover"
          />
        )}
        <div>
          <div className="font-semibold text-lg text-gray-900">
            {user.displayName ?? user.username ?? user.login}
          </div>
          {user.email && (
            <div className="text-sm text-gray-500">{user.email}</div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={joinQueue}
        disabled={queued}
        className={`w-full px-5 py-3 rounded-xl font-semibold shadow-md transition-transform transform hover:scale-105 ${
          queued
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
        }`}
      >
        {queued ? " Waiting for partner..." : " Find a Partner "}
      </button>
    </div>
  );
}
