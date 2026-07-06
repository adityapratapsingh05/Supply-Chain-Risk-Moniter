import { Router } from 'express';
import multer from 'multer';
import * as ctrl from '../controllers/supplier.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.use(requireAuth);

router.get('/', ctrl.listSuppliers);
router.get('/export', requireRole('ADMIN', 'MANAGER'), ctrl.exportSuppliers);
router.get('/:id', ctrl.getSupplier);
router.post('/', requireRole('ADMIN', 'MANAGER'), ctrl.createSupplier);
router.post('/import', requireRole('ADMIN', 'MANAGER'), upload.single('file'), ctrl.importSuppliers);
router.put('/:id', requireRole('ADMIN', 'MANAGER'), ctrl.updateSupplier);
router.delete('/:id', requireRole('ADMIN'), ctrl.deleteSupplier);

export default router;
