import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthedRequest } from '../middleware/auth';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

async function callClaude(system: string, user: string, maxTokens = 900): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw Object.assign(new Error('AI is not configured. Set ANTHROPIC_API_KEY.'), { status: 503 });
  }
  const resp = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw Object.assign(new Error(`AI provider error: ${text}`), { status: 502 });
  }
  const data = (await resp.json()) as { content?: { text?: string }[] };
  return data.content?.[0]?.text ?? '';
}

function stripFences(raw: string): string {
  return raw.trim().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
}

// ── Generate a mitigation plan / recommendation for a supplier ──
export async function generateMitigation(req: AuthedRequest, res: Response) {
  const { supplierId, riskEventId } = req.body;
  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId }, include: { country: true } });
  if (!supplier) return res.status(404).json({ error: 'Supplier not found.' });

  const system = 'You are a senior supply chain risk consultant. Analyse disrupted supplier nodes and generate ' +
    'precise, quantitative, business-ready mitigation strategies. Return ONLY valid JSON (no markdown fences) with keys: ' +
    'rootCause, businessImpact, alternativeSuppliers (array of strings), mitigationPlan, inventoryStrategy, ' +
    'shippingRoute, costEstimateUsd (number), recoveryTimeDays (number), confidenceScore (0-1 number).';
  const user = `Supplier: ${supplier.name}\nCountry: ${supplier.country.name}\nTier: ${supplier.tier}\n` +
    `Risk Score: ${supplier.riskScore}/10 (${supplier.riskTier})\nLead Time: ${supplier.leadTimeDays} days\n` +
    `Dependency: ${supplier.dependencyScore}/10\nCriticality: ${supplier.criticalityScore}/10\n\n` +
    'Generate the mitigation strategy. Return ONLY valid JSON.';

  const raw = await callClaude(system, user);
  let parsed: any;
  try { parsed = JSON.parse(stripFences(raw)); } catch { parsed = { mitigationPlan: raw }; }

  const rec = await prisma.recommendation.create({
    data: {
      supplierId, riskEventId: riskEventId || null, createdById: req.user!.userId,
      rootCause: parsed.rootCause, businessImpact: parsed.businessImpact,
      alternativeSuppliers: parsed.alternativeSuppliers ?? [],
      mitigationPlan: parsed.mitigationPlan, inventoryStrategy: parsed.inventoryStrategy,
      shippingRoute: parsed.shippingRoute, costEstimateUsd: parsed.costEstimateUsd,
      recoveryTimeDays: parsed.recoveryTimeDays, confidenceScore: parsed.confidenceScore,
      riskScore: supplier.riskScore, rawAiResponse: parsed, status: 'PENDING',
    },
  });
  res.status(201).json(rec);
}

// ── Classify a news headline into risk dimensions ──
export async function classifyNews(req: AuthedRequest, res: Response) {
  const { headline } = req.body;
  if (!headline) return res.status(400).json({ error: 'headline is required.' });

  const system = 'You are a supply chain risk intelligence analyst. Classify the news headline into risk dimensions. ' +
    'Return ONLY JSON with keys: riskCategory, affectedGeography, probability (0-1), businessImpact (1-10), ' +
    'recoveryTimeDays, confidenceScore (0-1), supplierImpactSummary, recommendedAction.';
  const raw = await callClaude(system, `Headline: ${headline}\n\nClassify it. Return ONLY valid JSON.`, 400);
  let parsed: any;
  try { parsed = JSON.parse(stripFences(raw)); } catch { parsed = { raw }; }
  res.json({ headline, classification: parsed });
}

// ── Run a disruption simulation ──
export async function runSimulation(req: AuthedRequest, res: Response) {
  const { scenario, supplierName, severity } = req.body;
  const system = 'You are a senior supply chain risk analyst running a disruption simulation. Generate a detailed ' +
    'scenario with cascading impact assessment. Return ONLY JSON with keys: initialRiskScore, peakRiskScore, ' +
    'finalRiskScore, revenueAtRiskUsdM, cascadePath (array), phaseTimeline (array of {day, score, action}), ' +
    'executiveDecision, aiRecommendationLog (array of strings).';
  const user = `Scenario: ${scenario}\nSupplier: ${supplierName}\nSeverity: ${severity}\nDuration: 90 days\n\n` +
    'Run the model. Return ONLY valid JSON.';
  const raw = await callClaude(system, user, 1000);
  let parsed: any;
  try { parsed = JSON.parse(stripFences(raw)); } catch { parsed = { raw }; }
  res.json({ scenario, result: parsed });
}

// ── Board-ready executive brief ──
export async function executiveBrief(req: AuthedRequest, res: Response) {
  const critical = await prisma.supplier.findMany({ where: { riskTier: 'CRITICAL' }, include: { country: true } });
  const agg = await prisma.supplier.aggregate({ _avg: { riskScore: true } });

  const system = 'You are a Chief Supply Chain Officer preparing a C-suite board briefing. Be concise and ' +
    'action-oriented. Return ONLY JSON with keys: executiveSummary, top3Risks (array), ' +
    'immediateActions (array of {action, owner, costUsdM, timeline}), financialExposureUsdB, ' +
    'projectedRiskReduction, conclusion.';
  const user = `Overall risk score: ${(agg._avg.riskScore ?? 0).toFixed(2)}/10\n` +
    `Critical suppliers: ${critical.map((s) => `${s.name} (${s.country.name})`).join(', ') || 'none'}\n\n` +
    'Generate the briefing. Return ONLY valid JSON.';
  const raw = await callClaude(system, user, 900);
  let parsed: any;
  try { parsed = JSON.parse(stripFences(raw)); } catch { parsed = { raw }; }
  res.json({ brief: parsed });
}

// ── Deterministic node risk score (no AI needed) ──
export async function scoreNode(req: AuthedRequest, res: Response) {
  const { probability = 0.5, impact = 5, criticality = 5, leadTimeDays = 20, dependency = 5 } = req.body;
  const score = Math.min(10, (probability * impact * criticality * (leadTimeDays / 30) * dependency) / 10);
  const tier = score >= 7.5 ? 'CRITICAL' : score >= 5.5 ? 'HIGH' : score >= 3.5 ? 'MEDIUM' : 'LOW';
  res.json({ nodeRiskScore: Number(score.toFixed(3)), tier });
}

export async function listRecommendations(req: AuthedRequest, res: Response) {
  const items = await prisma.recommendation.findMany({
    include: { supplier: true, riskEvent: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json({ items });
}
