function nodeRiskScore(probability: number, impact: number, criticality: number, leadTimeDays: number, dependency: number) {
  return Math.min(10, (probability * impact * criticality * (leadTimeDays / 30) * dependency) / 10);
}

describe('Node risk score formula', () => {
  it('computes a score within 0-10 bounds', () => {
    const score = nodeRiskScore(0.9, 9, 9, 20, 9);
    expect(score).toBeLessThanOrEqual(10);
    expect(score).toBeGreaterThan(0);
  });

  it('returns higher score for higher probability', () => {
    const low = nodeRiskScore(0.2, 5, 5, 20, 5);
    const high = nodeRiskScore(0.9, 5, 5, 20, 5);
    expect(high).toBeGreaterThan(low);
  });

  it('caps at 10 for extreme inputs', () => {
    const score = nodeRiskScore(1, 10, 10, 60, 10);
    expect(score).toBe(10);
  });
});
