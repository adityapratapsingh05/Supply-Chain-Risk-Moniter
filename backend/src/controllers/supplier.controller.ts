import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { parseCsvBuffer, parseExcelBuffer, buildExcelBuffer } from '../utils/csv';
import { AuthedRequest } from '../middleware/auth';

function riskTier(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 7.5) return 'CRITICAL';
  if (score >= 5.5) return 'HIGH';
  if (score >= 3.5) return 'MEDIUM';
  return 'LOW';
}

export async function listSuppliers(req: AuthedRequest, res: Response) {
  const { search = '', tier, country, page = '1', pageSize = '20' } = req.query as Record<string, string>;
  const take = Math.min(Number(pageSize) || 20, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const where: any = {};
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (tier) where.riskTier = tier;
  if (country) where.country = { name: country };

  const [items, total] = await Promise.all([
    prisma.supplier.findMany({ where, include: { country: true }, skip, take, orderBy: { riskScore: 'desc' } }),
    prisma.supplier.count({ where }),
  ]);

  res.json({ items, total, page: Number(page), pageSize: take, totalPages: Math.ceil(total / take) });
}

export async function getSupplier(req: AuthedRequest, res: Response) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: req.params.id },
    include: { country: true, shipments: true, riskEvents: true },
  });
  if (!supplier) return res.status(404).json({ error: 'Supplier not found.' });
  res.json(supplier);
}

export async function createSupplier(req: AuthedRequest, res: Response) {
  const { name, code, countryId, tier, category, dependencyScore, criticalityScore, leadTimeDays, latitude, longitude } = req.body;
  if (!name || !code || !countryId) {
    return res.status(400).json({ error: 'name, code and countryId are required.' });
  }
  const score = (Number(dependencyScore) || 0 + Number(criticalityScore) || 0) / 2;
  const supplier = await prisma.supplier.create({
    data: {
      name, code, countryId, tier: Number(tier) || 1, category,
      dependencyScore: Number(dependencyScore) || 0,
      criticalityScore: Number(criticalityScore) || 0,
      leadTimeDays: Number(leadTimeDays) || 0,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      riskScore: score,
      riskTier: riskTier(score),
    },
  });
  await prisma.auditLog.create({ data: { userId: req.user!.userId, action: 'CREATE_SUPPLIER', entity: 'Supplier', entityId: supplier.id } });
  res.status(201).json(supplier);
}

export async function updateSupplier(req: AuthedRequest, res: Response) {
  const existing = await prisma.supplier.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Supplier not found.' });

  const data = { ...req.body };
  if (data.dependencyScore !== undefined || data.criticalityScore !== undefined) {
    const dep = Number(data.dependencyScore ?? existing.dependencyScore);
    const crit = Number(data.criticalityScore ?? existing.criticalityScore);
    data.riskScore = (dep + crit) / 2;
    data.riskTier = riskTier(data.riskScore);
  }
  const supplier = await prisma.supplier.update({ where: { id: req.params.id }, data });
  await prisma.auditLog.create({ data: { userId: req.user!.userId, action: 'UPDATE_SUPPLIER', entity: 'Supplier', entityId: supplier.id } });
  res.json(supplier);
}

export async function deleteSupplier(req: AuthedRequest, res: Response) {
  const existing = await prisma.supplier.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Supplier not found.' });
  await prisma.supplier.delete({ where: { id: req.params.id } });
  await prisma.auditLog.create({ data: { userId: req.user!.userId, action: 'DELETE_SUPPLIER', entity: 'Supplier', entityId: req.params.id } });
  res.json({ message: 'Supplier deleted.' });
}

export async function importSuppliers(req: AuthedRequest, res: Response) {
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: 'No file uploaded.' });

  const rows = file.originalname.endsWith('.csv')
    ? parseCsvBuffer(file.buffer)
    : parseExcelBuffer(file.buffer);

  let created = 0;
  const errors: string[] = [];
  for (const row of rows) {
    try {
      const country = await prisma.country.upsert({
        where: { name: row.country || row.Country },
        update: {},
        create: {
          name: row.country || row.Country,
          isoCode: (row.country || row.Country || 'NA').slice(0, 3).toUpperCase(),
          latitude: 0, longitude: 0,
        },
      });
      const dep = Number(row.dependencyScore || row.dependency || 0);
      const crit = Number(row.criticalityScore || row.criticality || 0);
      const score = (dep + crit) / 2;
      await prisma.supplier.create({
        data: {
          name: row.name || row.Name,
          code: row.code || `${(row.name || 'SUP').slice(0, 3).toUpperCase()}-${Date.now()}`,
          countryId: country.id,
          tier: Number(row.tier) || 1,
          dependencyScore: dep,
          criticalityScore: crit,
          leadTimeDays: Number(row.leadTimeDays || row.lead || 0),
          riskScore: score,
          riskTier: riskTier(score),
        },
      });
      created++;
    } catch (e: any) {
      errors.push(`Row "${row.name}": ${e.message}`);
    }
  }
  res.json({ created, failed: errors.length, errors });
}

export async function exportSuppliers(req: AuthedRequest, res: Response) {
  const suppliers = await prisma.supplier.findMany({ include: { country: true } });
  const rows = suppliers.map((s) => ({
    Name: s.name, Code: s.code, Country: s.country.name, Tier: s.tier,
    DependencyScore: s.dependencyScore, CriticalityScore: s.criticalityScore,
    LeadTimeDays: s.leadTimeDays, RiskScore: s.riskScore, RiskTier: s.riskTier,
  }));
  const buffer = buildExcelBuffer(rows);
  res.setHeader('Content-Disposition', 'attachment; filename="suppliers.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
}
