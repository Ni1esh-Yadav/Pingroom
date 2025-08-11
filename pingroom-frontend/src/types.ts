export type Message = { from: "me" | "partner"; text: string };

export type User = {
  id: string | number;
  username?: string;
  login?: string;
  displayName?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  email?: string | null;
};
