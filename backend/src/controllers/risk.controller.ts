import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthedRequest } from '../middleware/auth';

export async function overallRisk(req: AuthedRequest, res: Response) {
  const suppliers = await prisma.supplier.findMany();
  if (suppliers.length === 0) return res.json({ overallScore: 0, tier: 'LOW', criticalCount: 0, total: 0 });

  const weightedSum = suppliers.reduce((sum, s) => sum + s.riskScore * s.criticalityScore, 0);
  const weightTotal = suppliers.reduce((sum, s) => sum + s.criticalityScore, 0) || 1;
  const score = weightedSum / weightTotal;
  const critical = suppliers.filter((s) => s.riskTier === 'CRITICAL');
  const tier = score >= 7.5 ? 'CRITICAL' : score >= 5.5 ? 'HIGH' : score >= 3.5 ? 'MEDIUM' : 'LOW';

  res.json({
    overallScore: Number(score.toFixed(2)), tier,
    criticalSuppliers: critical.map((s) => s.name), criticalCount: critical.length, total: suppliers.length,
  });
}

export async function listRiskEvents(req: AuthedRequest, res: Response) {
  const { page = '1', pageSize = '20', severity, countryId } = req.query as Record<string, string>;
  const take = Math.min(Number(pageSize) || 20, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
  const where: any = {};
  if (severity) where.severity = severity;
  if (countryId) where.countryId = countryId;

  const [items, total] = await Promise.all([
    prisma.riskEvent.findMany({ where, include: { country: true, supplier: true }, orderBy: { detectedAt: 'desc' }, skip, take }),
    prisma.riskEvent.count({ where }),
  ]);
  res.json({ items, total, page: Number(page), totalPages: Math.ceil(total / take) });
}

export async function createRiskEvent(req: AuthedRequest, res: Response) {
  const event = await prisma.riskEvent.create({ data: req.body });
  res.status(201).json(event);
}

export async function heatmapData(req: AuthedRequest, res: Response) {
  const countries = await prisma.country.findMany({ include: { suppliers: true, ports: true } });
  res.json(countries.map((c) => ({
    country: c.name, lat: c.latitude, lng: c.longitude, riskScore: c.riskScore, riskTier: c.riskTier,
    supplierCount: c.suppliers.length, portCount: c.ports.length,
  })));
}
