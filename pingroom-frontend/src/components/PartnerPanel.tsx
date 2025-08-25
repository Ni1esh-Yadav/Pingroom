import type { User } from "../types";

type Props = {
  partner: User;
  partnerName: string;
  leave: (shouldRequeue?: boolean) => void;
};

export default function PartnerPanel({ partner, partnerName, leave }: Props) {
  return (
    <div className="w-full backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl px-5 py-3 mb-5 flex items-center">
      {/* Avatar */}
      {(partner.avatar || partner.avatar_url) && (
        <img
          src={partner.avatar || partner.avatar_url || ""}
          alt="avatar"
          className="w-12 h-12 rounded-full border-2 border-indigo-500 shadow-md object-cover"
        />
      )}

      {/* Partner Info */}
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">Chatting with</span>
        <span className="font-semibold text-lg text-gray-800">
          {partnerName}
        </span>
      </div>

      {/* Actions */}
      <div className="ml-auto flex gap-3">
        <button
          onClick={() => leave(false)}
          className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium shadow hover:from-red-600 hover:to-pink-600 transition-transform transform hover:scale-105"
        >
          Leave
        </button>
        <button
          onClick={() => leave(true)}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-xl font-medium shadow hover:from-yellow-500 hover:to-orange-600 transition-transform transform hover:scale-105"
        >
          Next
        </button>
      </div>
    </div>
  );
}
