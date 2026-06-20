import { calculateCarbonFootprint, getEmissionRating, EMISSION_FACTORS } from '@/lib/calculator';

describe('calculateCarbonFootprint', () => {
  test('calculates petrol car commuter footprint', () => {
    const result = calculateCarbonFootprint({
      dailyDistance: 30,
      vehicleType: 'petrol',
      electricityUsage: 300,
      renewableShare: 10,
      foodPreference: 'average_meat',
      wasteBags: 3,
      recycles: true,
      shoppingHabit: 'average'
    });
    expect(result.breakdown.transport).toBeCloseTo(162, 0);
    expect(result.breakdown.food).toBe(54);
    expect(result.breakdown.shopping).toBe(140);
    expect(result.total).toBeGreaterThan(300);
  });

  test('zero activity returns minimal footprint', () => {
    const result = calculateCarbonFootprint({
      dailyDistance: 0,
      vehicleType: 'walk_bike',
      electricityUsage: 0,
      renewableShare: 100,
      foodPreference: 'vegan',
      wasteBags: 0,
      recycles: true,
      shoppingHabit: 'minimalist'
    });
    expect(result.total).toBe(18 + 45);
  });

  test('handles empty input with defaults', () => {
    const result = calculateCarbonFootprint({});
    expect(result.breakdown.transport).toBe(0);
    expect(result.breakdown.food).toBe(33);
    expect(result.breakdown.shopping).toBe(140);
    expect(result.treesEquivalent).toBeGreaterThan(0);
  });

  test('recycling reduces waste emissions compared to non-recycling', () => {
    const withRecycling = calculateCarbonFootprint({ wasteBags: 4, recycles: true });
    const withoutRecycling = calculateCarbonFootprint({ wasteBags: 4, recycles: false });
    expect(withRecycling.breakdown.waste).toBeLessThan(withoutRecycling.breakdown.waste);
  });

  test('negative distances are clamped to zero', () => {
    const result = calculateCarbonFootprint({
      dailyDistance: -10,
      vehicleType: 'petrol'
    });
    expect(result.breakdown.transport).toBe(0);
  });

  test('renewable share above 100% is clamped', () => {
    const result = calculateCarbonFootprint({
      electricityUsage: 100,
      renewableShare: 200
    });
    expect(result.breakdown.electricity).toBe(0);
  });

  test('invalid vehicle type defaults to zero emission factor', () => {
    const result = calculateCarbonFootprint({
      dailyDistance: 10,
      vehicleType: 'spaceship'
    });
    expect(result.breakdown.transport).toBe(0);
  });

  test('invalid food preference defaults to vegetarian', () => {
    const result = calculateCarbonFootprint({
      foodPreference: 'paleo'
    });
    expect(result.breakdown.food).toBe(33);
  });

  test('treesEquivalent is correctly calculated', () => {
    const result = calculateCarbonFootprint({
      dailyDistance: 50,
      vehicleType: 'petrol',
      electricityUsage: 500,
      foodPreference: 'heavy_meat',
      wasteBags: 5,
      shoppingHabit: 'heavy'
    });
    const expectedTrees = Math.round(result.total / 1.83);
    expect(result.treesEquivalent).toBe(expectedTrees);
  });
});

describe('getEmissionRating', () => {
  test('returns Eco Hero for very low emissions', () => {
    const rating = getEmissionRating(100);
    expect(rating.grade).toContain('Eco Hero');
  });

  test('returns Sustainable for moderate-low emissions', () => {
    const rating = getEmissionRating(300);
    expect(rating.grade).toContain('Sustainable');
  });

  test('returns Moderate for average emissions', () => {
    const rating = getEmissionRating(600);
    expect(rating.grade).toContain('Moderate');
  });

  test('returns High Impact for very high emissions', () => {
    const rating = getEmissionRating(1000);
    expect(rating.grade).toContain('High Impact');
  });

  test('handles zero emission rating', () => {
    const rating = getEmissionRating(0);
    expect(rating.grade).toContain('Eco Hero');
  });

  test('boundary at 180 kg switches from Eco Hero to Sustainable', () => {
    const hero = getEmissionRating(179);
    const sustainable = getEmissionRating(180);
    expect(hero.grade).toContain('Eco Hero');
    expect(sustainable.grade).toContain('Sustainable');
  });
});

describe('EMISSION_FACTORS integrity', () => {
  test('all transport factors are non-negative', () => {
    Object.values(EMISSION_FACTORS.transport).forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
    });
  });

  test('walk_bike has zero emissions', () => {
    expect(EMISSION_FACTORS.transport.walk_bike).toBe(0);
  });

  test('all food factors are positive', () => {
    Object.values(EMISSION_FACTORS.food).forEach(v => {
      expect(v).toBeGreaterThan(0);
    });
  });
});
