// Standard Carbon Footprint Calculation Utilities
// Values represent approximate kg CO2 equivalents.

export const EMISSION_FACTORS = {
  // Vehicle transport: kg CO2 per km
  transport: {
    petrol: 0.18,
    diesel: 0.17,
    hybrid: 0.10,
    electric: 0.04,
    motorcycle: 0.10,
    transit: 0.03, // bus or train average
    walk_bike: 0.0
  },
  // Electricity: kg CO2 per kWh
  electricity: {
    gridIntensity: 0.42, // average kg CO2 per kWh
  },
  // Food preference: kg CO2 per day
  food: {
    heavy_meat: 2.5,
    average_meat: 1.8,
    vegetarian: 1.1,
    vegan: 0.6
  },
  // Waste: kg CO2 per trash bag (average size, ~10kg)
  waste: {
    perBag: 2.1,
    recycleDiscount: 0.4 // 40% reduction if they recycle
  },
  // Shopping habits: kg CO2 per month
  shopping: {
    minimalist: 45,
    average: 140,
    heavy: 320
  }
};

/**
 * Calculate the monthly carbon footprint in kg CO2.
 * @param {Object} inputs
 * @param {number} inputs.dailyDistance - Daily travel distance in km
 * @param {string} inputs.vehicleType - Type of vehicle (petrol, diesel, hybrid, electric, motorcycle, transit, walk_bike)
 * @param {number} inputs.electricityUsage - Monthly electricity usage in kWh
 * @param {number} inputs.renewableShare - Renewable energy share in percentage (0 to 100)
 * @param {string} inputs.foodPreference - Diet style (heavy_meat, average_meat, vegetarian, vegan)
 * @param {number} inputs.wasteBags - Number of trash bags per week
 * @param {boolean} inputs.recycles - Whether they recycle regularly
 * @param {string} inputs.shoppingHabit - Shopping style (minimalist, average, heavy)
 * @returns {Object} Calculated carbon breakdown in kg CO2/month and total score
 */
export function calculateCarbonFootprint(inputs) {
  const {
    dailyDistance = 0,
    vehicleType = 'walk_bike',
    electricityUsage = 0,
    renewableShare = 0,
    foodPreference = 'vegetarian',
    wasteBags = 0,
    recycles = false,
    shoppingHabit = 'average'
  } = inputs;

  // 1. Transport emissions (monthly = daily distance * 30 * factor)
  const transportFactor = EMISSION_FACTORS.transport[vehicleType] || 0;
  const transportEmissions = parseFloat((dailyDistance * 30 * transportFactor).toFixed(2));

  // 2. Electricity emissions (monthly = usage * intensity * (1 - renewableShare %))
  const cleanElectricityIntensity = EMISSION_FACTORS.electricity.gridIntensity * (1 - (renewableShare / 100));
  const electricityEmissions = parseFloat((electricityUsage * cleanElectricityIntensity).toFixed(2));

  // 3. Food emissions (monthly = daily emissions * 30)
  const foodFactor = EMISSION_FACTORS.food[foodPreference] || EMISSION_FACTORS.food.vegetarian;
  const foodEmissions = parseFloat((foodFactor * 30).toFixed(2));

  // 4. Waste emissions (monthly = weekly bags * 4.33 weeks/month * emissions * recycle offset)
  const wasteFactor = EMISSION_FACTORS.waste.perBag;
  const recycleMultiplier = recycles ? (1 - EMISSION_FACTORS.waste.recycleDiscount) : 1.0;
  const wasteEmissions = parseFloat((wasteBags * 4.33 * wasteFactor * recycleMultiplier).toFixed(2));

  // 5. Shopping emissions (monthly)
  const shoppingEmissions = EMISSION_FACTORS.shopping[shoppingHabit] || EMISSION_FACTORS.shopping.average;

  // Sum everything up
  const totalEmissions = parseFloat(
    (transportEmissions + electricityEmissions + foodEmissions + wasteEmissions + shoppingEmissions).toFixed(2)
  );

  return {
    breakdown: {
      transport: transportEmissions,
      electricity: electricityEmissions,
      food: foodEmissions,
      waste: wasteEmissions,
      shopping: shoppingEmissions
    },
    total: totalEmissions,
    // Add references like trees needed to offset this monthly footprint
    // 1 mature tree absorbs about 22kg of CO2 per year, which is ~1.83kg per month
    treesEquivalent: Math.round(totalEmissions / 1.83)
  };
}

/**
 * Get friendly comparative context for a footprint score.
 * US Average: ~1,300 kg CO2/month per person
 * European Average: ~600 kg CO2/month per person
 * World Target for Climate Goals: ~160 kg CO2/month per person
 */
export function getEmissionRating(monthlyTotal) {
  if (monthlyTotal < 180) {
    return {
      grade: 'Eco Hero (A+)',
      color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      description: 'Superb! Your footprint aligns with international climate targets.'
    };
  } else if (monthlyTotal < 450) {
    return {
      grade: 'Sustainable (A)',
      color: 'text-green-400 bg-green-400/10 border-green-400/20',
      description: 'Excellent. Your impact is much lower than the national average.'
    };
  } else if (monthlyTotal < 800) {
    return {
      grade: 'Moderate (B)',
      color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      description: 'Average. You have several opportunities to trim down emissions.'
    };
  } else {
    return {
      grade: 'High Impact (C)',
      color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
      description: 'High. Explore switching diets or transport modes to reduce your footprint.'
    };
  }
}
