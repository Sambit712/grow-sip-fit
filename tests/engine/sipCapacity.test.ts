import { describe, it, expect } from 'vitest';
import { calculateSipCapacity } from '../../src/engine/sipCapacityCalculator';

describe('sipCapacityCalculator — calculateSipCapacity', () => {

  it('computes indicative SIP range from uncommitted surplus', () => {
    // surplus=20000, reserveContrib=0 → afterReserve=20000
    // buffer=10%=2000, uncommitted=18000
    // min=round(18000*0.6/500)*500=10500, max=round(18000/500)*500=18000
    const result = calculateSipCapacity(20000, 0);
    expect(result.uncommittedSurplus).toBe(18000);
    expect(result.indicativeSipMin).toBe(11000); // round(10800/500)*500=11000
    expect(result.indicativeSipMax).toBe(18000);
  });

  it('rounds both values to the nearest ₹500', () => {
    const result = calculateSipCapacity(15000, 0);
    // buffer=1500, uncommitted=13500
    // min=round(8100/500)*500=8000, max=round(13500/500)*500=13500
    expect(result.indicativeSipMin % 500).toBe(0);
    expect(result.indicativeSipMax % 500).toBe(0);
  });

  it('returns 0 for both values when surplus is 0', () => {
    const result = calculateSipCapacity(0, 0);
    expect(result.indicativeSipMin).toBe(0);
    expect(result.indicativeSipMax).toBe(0);
    expect(result.uncommittedSurplus).toBe(0);
  });

  it('returns 0 when surplus is negative', () => {
    const result = calculateSipCapacity(-5000, 0);
    expect(result.indicativeSipMin).toBe(0);
    expect(result.indicativeSipMax).toBe(0);
  });

  it('returns 0 when entire surplus is consumed by reserve contribution', () => {
    const result = calculateSipCapacity(10000, 10000);
    expect(result.indicativeSipMin).toBe(0);
    expect(result.indicativeSipMax).toBe(0);
  });

  it('deducts reserve contribution before calculating buffer', () => {
    const result = calculateSipCapacity(30000, 5000);
    // afterReserve=25000, buffer=2500, uncommitted=22500
    expect(result.uncommittedSurplus).toBe(22500);
  });

  it('never returns negative SIP amounts', () => {
    const result = calculateSipCapacity(100, 0);
    expect(result.indicativeSipMin).toBeGreaterThanOrEqual(0);
    expect(result.indicativeSipMax).toBeGreaterThanOrEqual(0);
  });

  it('min is always ≤ max', () => {
    const result = calculateSipCapacity(50000, 5000);
    expect(result.indicativeSipMin).toBeLessThanOrEqual(result.indicativeSipMax);
  });
});

