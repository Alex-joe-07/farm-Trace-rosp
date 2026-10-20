import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// TODO: Add journey routes
router.get('/', (req, res) => {
  res.json({ message: 'Journey data' });
});

export default router;