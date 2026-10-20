import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All farmer routes require farmer role
router.use(authenticateToken, requireRole(['farmer']));

// TODO: Add farmer-specific routes
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Farmer dashboard data' });
});

export default router;