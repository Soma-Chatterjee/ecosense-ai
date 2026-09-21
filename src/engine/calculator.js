// Carbon Footprint Calculator Engine
import emissionFactorsData from '../data/emission-factors.json';

class CarbonCalculator {
  constructor() {
    this.emissionFactors = emissionFactorsData;
    this.selections = { diet: null, transport: null, commuteDistance: 20, energy: null, shopping: null, waste: null };
    this.results = null;
  }

  setSelection(category, value) {
    this.selections[category] = value;
  }

  resetSelections() {
    this.selections = { diet: null, transport: null, commuteDistance: 20, energy: null, shopping: null, waste: null };
    this.results = null;
  }

  calculate() {
    const ef = this.emissionFactors;
    const sel = this.selections;
    const breakdown = {};

    let foodDaily = sel.diet && ef.food.items[sel.diet] ? ef.food.items[sel.diet].co2_per_day_kg : 5.63;
    breakdown.food = { daily: foodDaily, label: sel.diet ? ef.food.items[sel.diet].label : 'Medium Meat', color: '#22c55e', icon: 'Utensils' };

    let transportDaily = sel.transport && ef.transport.items[sel.transport] ? ef.transport.items[sel.transport].co2_per_km_kg * sel.commuteDistance : 0.192 * 20;
    breakdown.transport = { daily: transportDaily, label: sel.transport ? ef.transport.items[sel.transport].label : 'Petrol Car', distance: sel.commuteDistance, color: '#3b82f6', icon: 'Car' };

    let energyDaily = sel.energy && ef.energy.monthly_usage[sel.energy] ? ef.energy.monthly_usage[sel.energy].co2_per_month_kg / 30 : 164 / 30;
    breakdown.energy = { daily: energyDaily, label: sel.energy ? ef.energy.monthly_usage[sel.energy].label : 'Medium Usage', color: '#f59e0b', icon: 'Zap' };

    let shoppingDaily = sel.shopping && ef.shopping.frequency[sel.shopping] ? ef.shopping.frequency[sel.shopping].co2_per_month_kg / 30 : 40 / 30;
    breakdown.shopping = { daily: shoppingDaily, label: sel.shopping ? ef.shopping.frequency[sel.shopping].label : 'Moderate', color: '#ec4899', icon: 'ShoppingBag' };

    let wasteDaily = sel.waste && ef.waste.items[sel.waste] ? ef.waste.items[sel.waste].co2_per_day_kg : 0.7;
    breakdown.waste = { daily: wasteDaily, label: sel.waste ? ef.waste.items[sel.waste].label : 'Some Recycling', color: '#a855f7', icon: 'Recycle' };

    const totalDaily = Object.values(breakdown).reduce((sum, cat) => sum + cat.daily, 0);
    const totalAnnual = totalDaily * 365;
    const totalAnnualTonnes = totalAnnual / 1000;

    const comparisons = {
      you: Math.round(totalAnnualTonnes * 100) / 100,
      india_avg: ef.averages.india_per_capita_annual_tonnes,
      global_avg: ef.averages.global_per_capita_annual_tonnes,
      us_avg: ef.averages.us_per_capita_annual_tonnes,
      eu_avg: ef.averages.eu_per_capita_annual_tonnes,
      paris_target: ef.averages.paris_target_per_capita_annual_tonnes
    };

    const treesNeeded = Math.ceil(totalAnnual / 22);

    this.results = {
      breakdown,
      totalDaily: Math.round(totalDaily * 100) / 100,
      totalAnnual: Math.round(totalAnnual),
      totalAnnualTonnes: Math.round(totalAnnualTonnes * 100) / 100,
      comparisons,
      treesNeeded,
      selections: { ...sel }
    };
    return this.results;
  }

  getRecommendations() {
    if (!this.results) return [];
    const recs = [];
    const bd = this.results.breakdown;
    const sel = this.results.selections;

    if (sel.diet === 'heavy_meat' || sel.diet === 'medium_meat') {
      recs.push({ category: 'food', icon: 'Utensils', title: 'Reduce Meat Consumption', description: `Switching to vegetarian could save ~${Math.round((bd.food.daily - 3.81) * 365)} kg CO₂/year. Start with Meatless Mondays!`, potential_saving: Math.round((bd.food.daily - 3.81) * 365), priority: 'high' });
    }
    if (['car_petrol', 'car_diesel', 'motorcycle'].includes(sel.transport) && sel.commuteDistance > 5) {
      const busSaving = (bd.transport.daily - (0.089 * sel.commuteDistance)) * 250;
      recs.push({ category: 'transport', icon: 'Bus', title: 'Switch to Public Transport', description: `Taking the bus for your ${sel.commuteDistance} km commute could save ~${Math.round(busSaving)} kg CO₂/year.`, potential_saving: Math.round(busSaving), priority: 'high' });
    }
    if (sel.energy === 'high' || sel.energy === 'very_high') {
      recs.push({ category: 'energy', icon: 'Lightbulb', title: 'Reduce Energy Consumption', description: `Switch to LED bulbs, use fans instead of AC, and unplug standby devices to save 200+ kg CO₂/year.`, potential_saving: 200, priority: 'high' });
    }
    if (sel.shopping === 'shopaholic' || sel.shopping === 'moderate') {
      recs.push({ category: 'shopping', icon: 'ShoppingBag', title: 'Shop More Consciously', description: `Choose second-hand items and reduce frequency to save ~${Math.round((bd.shopping.daily - 8/30) * 365)} kg CO₂/year.`, potential_saving: Math.round((bd.shopping.daily - 8/30) * 365), priority: 'medium' });
    }
    if (sel.waste === 'no_recycling' || sel.waste === 'some_recycling') {
      recs.push({ category: 'waste', icon: 'Recycle', title: 'Improve Waste Management', description: `Active recycling and composting could save ~${Math.round((bd.waste.daily - 0.1) * 365)} kg CO₂/year.`, potential_saving: Math.round((bd.waste.daily - 0.1) * 365), priority: 'medium' });
    }
    recs.push({ category: 'general', icon: 'TreePine', title: 'Plant Trees to Offset', description: `To offset ${this.results.totalAnnualTonnes} tonnes/year, plant ${this.results.treesNeeded} trees. Even 1-2 trees make a difference!`, potential_saving: 22, priority: 'low' });

    return recs.sort((a, b) => b.potential_saving - a.potential_saving);
  }
}

const calculator = new CarbonCalculator();
export default calculator;
