import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// TODO: Add product routes
router.get('/', (req, res) => {
  res.json({ message: 'Products list' });
});

export default router;