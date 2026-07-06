import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res) => {
  const items = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ items, unreadCount: items.filter((n) => !n.isRead).length });
});

router.patch('/:id/read', async (req: AuthedRequest, res) => {
  const notif = await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user!.userId },
    data: { isRead: true },
  });
  if (notif.count === 0) return res.status(404).json({ error: 'Notification not found.' });
  res.json({ message: 'Marked as read.' });
});

router.patch('/read-all', async (req: AuthedRequest, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user!.userId, isRead: false }, data: { isRead: true } });
  res.json({ message: 'All notifications marked as read.' });
});

export default router;
