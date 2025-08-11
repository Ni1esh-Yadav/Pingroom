import type { User } from "../types";

type Props = {
  partner: User;
  partnerName: string;
  leave: (shouldRequeue?: boolean) => void;
};

export default function PartnerPanel({ partner, partnerName, leave }: Props) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-4 mb-4 flex items-center gap-3">
      {(partner.avatar || partner.avatar_url) && (
        <img
          src={partner.avatar || partner.avatar_url || ""}
          alt="avatar"
          className="w-10 h-10 rounded-full border"
        />
      )}
      <div className="text-gray-800">
        <strong>Chatting with {partnerName}</strong>
      </div>
      <div className="ml-auto flex gap-2">
        <button
          onClick={() => leave(false)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
        >
          Leave
        </button>
        <button
          onClick={() => leave(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
}
