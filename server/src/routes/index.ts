import { Router } from 'express';
import authRoutes from './authRoutes';
import busRoutes from './busRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/buses', busRoutes);

export default router;