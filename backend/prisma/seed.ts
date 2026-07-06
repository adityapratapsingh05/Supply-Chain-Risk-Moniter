import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const COUNTRIES = [
  { name: 'Taiwan', isoCode: 'TWN', latitude: 23.7, longitude: 121.0 },
  { name: 'South Korea', isoCode: 'KOR', latitude: 35.9, longitude: 127.7 },
  { name: 'Japan', isoCode: 'JPN', latitude: 36.2, longitude: 138.2 },
  { name: 'USA', isoCode: 'USA', latitude: 37.0, longitude: -95.7 },
  { name: 'Vietnam', isoCode: 'VNM', latitude: 14.0, longitude: 108.2 },
  { name: 'China', isoCode: 'CHN', latitude: 35.8, longitude: 104.1 },
  { name: 'India', isoCode: 'IND', latitude: 20.5, longitude: 78.9 },
  { name: 'Belgium', isoCode: 'BEL', latitude: 50.5, longitude: 4.4 },
  { name: 'France', isoCode: 'FRA', latitude: 46.6, longitude: 2.2 },
  { name: 'DR Congo', isoCode: 'COD', latitude: -4.0, longitude: 21.7 },
];

const SUPPLIERS = [
  { name: 'TSMC Taiwan', code: 'S1-01', country: 'Taiwan', tier: 1, risk: 9.8, dep: 9.5, crit: 9.8, lead: 14 },
  { name: 'Samsung SDI Korea', code: 'S1-02', country: 'South Korea', tier: 1, risk: 7.8, dep: 8.2, crit: 8.9, lead: 7 },
  { name: 'Sony Semiconductor JP', code: 'S1-03', country: 'Japan', tier: 1, risk: 7.2, dep: 7.8, crit: 8.5, lead: 10 },
  { name: 'Corning USA', code: 'S1-04', country: 'USA', tier: 1, risk: 5.5, dep: 6.5, crit: 7.2, lead: 21 },
  { name: 'Qualcomm USA', code: 'S1-05', country: 'USA', tier: 1, risk: 8.5, dep: 8.8, crit: 9.2, lead: 12 },
  { name: 'Foxconn Vietnam', code: 'S2-01', country: 'Vietnam', tier: 2, risk: 7.5, dep: 7.1, crit: 7.8, lead: 18 },
  { name: 'BYD Electronics China', code: 'S2-02', country: 'China', tier: 2, risk: 6.5, dep: 6.9, crit: 7.5, lead: 22 },
  { name: 'Murata Japan', code: 'S2-03', country: 'Japan', tier: 2, risk: 5.8, dep: 6.3, crit: 6.8, lead: 9 },
  { name: 'Flex India', code: 'S2-04', country: 'India', tier: 2, risk: 5.2, dep: 5.4, crit: 5.9, lead: 25 },
  { name: 'Luxshare China', code: 'S2-05', country: 'China', tier: 2, risk: 5.9, dep: 5.8, crit: 6.2, lead: 20 },
  { name: 'Umicore Belgium', code: 'S3-01', country: 'Belgium', tier: 3, risk: 4.2, dep: 4.2, crit: 4.8, lead: 30 },
  { name: 'Ganfeng Lithium China', code: 'S3-02', country: 'China', tier: 3, risk: 7.8, dep: 5.1, crit: 5.5, lead: 28 },
  { name: 'Rhodia France', code: 'S3-03', country: 'France', tier: 3, risk: 4.5, dep: 3.8, crit: 4.2, lead: 35 },
  { name: 'Albemarle USA', code: 'S3-04', country: 'USA', tier: 3, risk: 3.8, dep: 4.5, crit: 4.9, lead: 32 },
  { name: 'Ivanhoe Mines DRC', code: 'S3-05', country: 'DR Congo', tier: 3, risk: 6.1, dep: 5.8, crit: 6.1, lead: 45 },
];

function tier(score: number) {
  if (score >= 7.5) return 'CRITICAL';
  if (score >= 5.5) return 'HIGH';
  if (score >= 3.5) return 'MEDIUM';
  return 'LOW';
}

async function main() {
  console.log('Seeding countries...');
  const countryMap: Record<string, string> = {};
  for (const c of COUNTRIES) {
    const created = await prisma.country.upsert({
      where: { name: c.name },
      update: {},
      create: { ...c, riskScore: 0, riskTier: 'LOW' },
    });
    countryMap[c.name] = created.id;
  }

  console.log('Seeding suppliers...');
  for (const s of SUPPLIERS) {
    await prisma.supplier.upsert({
      where: { code: s.code },
      update: {},
      create: {
        name: s.name, code: s.code, countryId: countryMap[s.country], tier: s.tier,
        dependencyScore: s.dep, criticalityScore: s.crit, leadTimeDays: s.lead,
        riskScore: s.risk, riskTier: tier(s.risk) as any,
      },
    });
  }

  console.log('Seeding admin + manager + viewer users...');
  const users = [
    { name: 'Admin User', email: 'admin@samsung.com', password: 'Admin@2026', role: 'ADMIN' as const },
    { name: 'Risk Analyst', email: 'analyst@samsung.com', password: 'Samsung@2026', role: 'MANAGER' as const },
    { name: 'Executive Viewer', email: 'cpo@samsung.com', password: 'Exec@2026', role: 'VIEWER' as const },
  ];
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, passwordHash, role: u.role, isEmailVerified: true },
    });
  }

  console.log('Seed complete. Demo logins:');
  users.forEach((u) => console.log(`  ${u.email} / ${u.password} (${u.role})`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
