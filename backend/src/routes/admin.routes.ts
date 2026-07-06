import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));

router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, isEmailVerified: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ items: users });
});

router.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['ADMIN', 'MANAGER', 'VIEWER'].includes(role)) return res.status(400).json({ error: 'Invalid role.' });
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
  res.json(user);
});

router.patch('/users/:id/status', async (req, res) => {
  const { isActive } = req.body;
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: !!isActive } });
  res.json(user);
});

router.delete('/users/:id', async (req: AuthedRequest, res) => {
  if (req.params.id === req.user!.userId) return res.status(400).json({ error: 'You cannot delete your own account.' });
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted.' });
});

router.get('/analytics', async (req, res) => {
  const [userCount, supplierCount, shipmentCount, riskEventCount, criticalCount] = await Promise.all([
    prisma.user.count(),
    prisma.supplier.count(),
    prisma.shipment.count(),
    prisma.riskEvent.count(),
    prisma.supplier.count({ where: { riskTier: 'CRITICAL' } }),
  ]);
  res.json({ userCount, supplierCount, shipmentCount, riskEventCount, criticalCount });
});

router.get('/audit-logs', async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  res.json({ items: logs });
});

export default router;
