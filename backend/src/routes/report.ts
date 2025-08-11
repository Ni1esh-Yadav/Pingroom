import express from 'express';
import { report, addBlock } from '../models/blocklist';
import { ensureAuth } from '../middleware/ensureAuth';

const router = express.Router();

// allow authenticated users to report other users or IPs
router.post('/report', ensureAuth, (req, res) => {
  const { targetKey, block } = req.body as { targetKey: string; block?: boolean };
  if (!targetKey) return res.status(400).json({ error: 'targetKey required' });
  const count = report(targetKey);
  if (block && count > 5) {
     addBlock({ 
        reason: 'reported repeatedly', 
        ip: targetKey, 
        createdAt: new Date().getTime()
    });
  }
  res.json({ ok: true, count });
});

export default router;