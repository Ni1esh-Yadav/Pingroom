type BlockEntry = {
  userId?: number;
  ip?: string;
  reason?: string;
  createdAt: number;
};

const blocks: BlockEntry[] = [];
const reports: { key: string; count: number }[] = [];

export function addBlock(entry: BlockEntry) {
  blocks.push({ ...entry, createdAt: Date.now() });
}

export function isBlocked({ userId, ip }: { userId?: number; ip?: string }) {
  return blocks.some(b => (userId && b.userId === userId) || (ip && b.ip === ip));
}

export function report(key: string) {
  const found = reports.find(r => r.key === key);
  if (found) found.count++;
  else reports.push({ key, count: 1 });
  return reports.find(r => r.key === key)?.count ?? 0;
}