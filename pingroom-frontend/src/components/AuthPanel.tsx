import React from "react";
import type { User } from "../types";

type Props = {
  user: User | null;
  queued: boolean;
  joinQueue: () => void;
};

export default function AuthPanel({ user, queued, joinQueue }: Props) {
  if (!user) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-md">
        <p className="mb-4 text-gray-600 text-lg">
          Welcome to Pingroom — login to meet developers.
        </p>
        <a
          href="http://localhost:4000/auth/github"
          className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-5 py-3 rounded-lg shadow"
        >
          Login with GitHub
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 max-w-md">
      <div className="flex items-center gap-4 mb-5">
        {(user.avatar || user.avatar_url) && (
          <img
            src={user.avatar || user.avatar_url || ""}
            alt="avatar"
            className="w-12 h-12 rounded-full border-2 border-indigo-500"
          />
        )}
        <div>
          <strong className="text-lg text-gray-800">
            {user.displayName ?? user.username ?? user.login}
          </strong>
          {user.email && (
            <div className="text-sm text-gray-500">{user.email}</div>
          )}
        </div>
      </div>
      <button
        onClick={joinQueue}
        className="bg-green-500 hover:bg-green-600 transition text-white px-5 py-3 rounded-lg shadow w-full"
      >
        {queued ? "Waiting for partner..." : "Find a partner"}
      </button>
    </div>
  );
}
