import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Car, Zap, ShoppingBag, Recycle, Calculator as CalcIcon, BarChart3, TreePine, Sprout, ArrowRight } from 'lucide-react';
import calculator from '../../engine/calculator';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const sections = [
  { id: 'diet', title: 'Diet & Food', subtitle: 'What best describes your eating habits?', icon: Utensils, color: '#22c55e',
    options: [
      { value: 'heavy_meat', label: 'Heavy Meat Eater', desc: 'Meat with most meals', emission: '7.19 kg CO₂/day' },
      { value: 'medium_meat', label: 'Medium Meat', desc: 'Moderate meat intake', emission: '5.63 kg CO₂/day' },
      { value: 'low_meat', label: 'Low Meat', desc: 'Occasional meat', emission: '4.67 kg CO₂/day' },
      { value: 'vegetarian', label: 'Vegetarian', desc: 'No meat or fish', emission: '3.81 kg CO₂/day' },
      { value: 'pescatarian', label: 'Pescatarian', desc: 'Fish, no meat', emission: '3.91 kg CO₂/day' },
      { value: 'vegan', label: 'Vegan', desc: 'Fully plant-based', emission: '2.89 kg CO₂/day' },
    ]
  },
  { id: 'transport', title: 'Daily Transport', subtitle: 'Primary mode of daily commute', icon: Car, color: '#3b82f6',
    options: [
      { value: 'car_petrol', label: 'Petrol Car', desc: 'Solo driving', emission: '0.192 kg/km' },
      { value: 'motorcycle', label: 'Motorcycle', desc: 'Two-wheeler', emission: '0.113 kg/km' },
      { value: 'bus', label: 'Public Bus', desc: 'City bus', emission: '0.089 kg/km' },
      { value: 'train', label: 'Train/Metro', desc: 'Electric rail', emission: '0.041 kg/km' },
      { value: 'auto_rickshaw', label: 'Auto Rickshaw', desc: 'Three-wheeler', emission: '0.098 kg/km' },
      { value: 'bicycle', label: 'Bicycle/Walking', desc: 'Zero emission', emission: '0.000 kg/km' },
    ]
  },
  { id: 'energy', title: 'Home Energy', subtitle: 'Monthly electricity consumption', icon: Zap, color: '#f59e0b',
    options: [
      { value: 'low', label: 'Low Usage', desc: '<100 kWh/month', emission: '82 kg CO₂/month' },
      { value: 'medium', label: 'Medium Usage', desc: '100-300 kWh/month', emission: '164 kg CO₂/month' },
      { value: 'high', label: 'High Usage', desc: '300-500 kWh/month', emission: '328 kg CO₂/month' },
      { value: 'very_high', label: 'Very High', desc: '>500 kWh/month', emission: '492 kg CO₂/month' },
    ]
  },
  { id: 'shopping', title: 'Shopping Habits', subtitle: 'How often do you shop for non-essentials?', icon: ShoppingBag, color: '#ec4899',
    options: [
      { value: 'shopaholic', label: 'Frequent Shopper', desc: 'Weekly shopping', emission: '80 kg CO₂/month' },
      { value: 'moderate', label: 'Moderate', desc: 'Bi-weekly shopping', emission: '40 kg CO₂/month' },
      { value: 'minimal', label: 'Minimal', desc: 'Monthly shopping', emission: '15 kg CO₂/month' },
      { value: 'conscious', label: 'Conscious', desc: 'Only when needed', emission: '8 kg CO₂/month' },
    ]
  },
  { id: 'waste', title: 'Waste Management', subtitle: 'How do you handle household waste?', icon: Recycle, color: '#a855f7',
    options: [
      { value: 'no_recycling', label: 'No Recycling', desc: 'All to landfill', emission: '1.2 kg CO₂/day' },
      { value: 'some_recycling', label: 'Some Recycling', desc: 'Partial sorting', emission: '0.7 kg CO₂/day' },
      { value: 'active_recycling', label: 'Active Recycling', desc: 'Regular sorting', emission: '0.3 kg CO₂/day' },
      { value: 'composting', label: 'Composting+', desc: 'Compost & recycle', emission: '0.1 kg CO₂/day' },
    ]
  },
];

export default function CalculatorView({ onResults }) {
  const [selections, setSelections] = useState({});
  const [distance, setDistance] = useState(20);
  const [results, setResults] = useState(null);

  const handleSelect = useCallback((group, value) => {
    setSelections(prev => ({ ...prev, [group]: value }));
    calculator.setSelection(group, value);
  }, []);

  const handleCalculate = useCallback(() => {
    calculator.setSelection('commuteDistance', distance);
    Object.entries(selections).forEach(([k, v]) => calculator.setSelection(k, v));
    const res = calculator.calculate();
    if (res) {
      setResults(res);
      onResults?.(res);
    }
  }, [selections, distance, onResults]);

  const chartData = results ? {
    labels: Object.values(results.breakdown).map(b => b.label),
    datasets: [{ data: Object.values(results.breakdown).map(b => Math.round(b.daily * 100) / 100), backgroundColor: Object.values(results.breakdown).map(b => b.color), borderColor: Object.values(results.breakdown).map(b => b.color + '33'), borderWidth: 2, hoverOffset: 8 }]
  } : null;

  const chartOptions = { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, font: { size: 11, family: "'Inter', sans-serif" }, usePointStyle: true } }, tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(16, 185, 129, 0.3)', borderWidth: 1, padding: 12, cornerRadius: 8, callbacks: { label: (ctx) => { const total = ctx.dataset.data.reduce((a, b) => a + b, 0); return ` ${ctx.parsed} kg CO₂/day (${Math.round((ctx.parsed / total) * 100)}%)`; } } } } };

  const recommendations = results ? calculator.getRecommendations() : [];
  const comparisons = results ? [
    { label: 'You', value: results.comparisons.you, color: '#10B981', highlight: true },
    { label: 'India Avg', value: results.comparisons.india_avg, color: '#3B82F6' },
    { label: 'Global Avg', value: results.comparisons.global_avg, color: '#F59E0B' },
    { label: 'EU Avg', value: results.comparisons.eu_avg, color: '#8B5CF6' },
    { label: 'US Avg', value: results.comparisons.us_avg, color: '#EF4444' },
    { label: 'Paris Target', value: results.comparisons.paris_target, color: '#06B6D4' },
  ] : [];
  const maxComparison = comparisons.length ? Math.max(...comparisons.map(c => c.value)) * 1.1 : 1;

  return (
    <div className="calculator-view">
      <div className="calc-form-panel">
        <h2 className="section-title">Carbon Footprint Calculator</h2>
        <p className="section-subtitle">Estimate your daily carbon emissions based on your lifestyle</p>

        {sections.map((section, si) => {
          const SIcon = section.icon;
          return (
            <motion.div key={section.id} className="calc-section" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.05 }}>
              <div className="calc-section-header">
                <div className="calc-section-icon" style={{ background: `${section.color}15`, color: section.color }}>
                  <SIcon size={20} />
                </div>
                <div>
                  <div className="calc-section-title">{section.title}</div>
                  <div className="calc-section-subtitle">{section.subtitle}</div>
                </div>
              </div>
              <div className="option-grid">
                {section.options.map(opt => (
                  <div key={opt.value} className={`option-card ${selections[section.id] === opt.value ? 'selected' : ''}`} onClick={() => handleSelect(section.id, opt.value)}>
                    <span className="option-card-label">{opt.label}</span>
                    <span className="option-card-desc">{opt.desc}</span>
                    <span className="option-card-emission">{opt.emission}</span>
                  </div>
                ))}
              </div>
              {section.id === 'transport' && (
                <div className="slider-group">
                  <div className="slider-label">
                    <span>Daily commute distance</span>
                    <span className="slider-value">{distance} km</span>
                  </div>
                  <input type="range" min="0" max="100" value={distance} step="5" onChange={e => setDistance(parseInt(e.target.value))} />
                </div>
              )}
            </motion.div>
          );
        })}

        <button className="calc-btn" onClick={handleCalculate}>
          <CalcIcon size={18} /> Calculate My Footprint
        </button>
      </div>

      <div className="calc-results-panel">
        {!results ? (
          <div className="empty-state">
            <div className="empty-state-icon"><BarChart3 size={28} /></div>
            <div className="empty-state-text">Fill in your lifestyle choices and click <strong>"Calculate"</strong> to see your carbon footprint breakdown</div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="result-card">
              <div className="result-card-header"><span className="result-card-title">Your Estimated Carbon Footprint</span></div>
              <div className="result-big-number">
                <div className="number">{results.totalDaily}</div>
                <div className="unit">kg CO₂e per day</div>
                <div className="context">≈ {results.totalAnnualTonnes} tonnes CO₂ per year ({results.totalAnnual} kg)</div>
              </div>
            </div>

            <div className="result-card">
              <div className="result-card-header"><span className="result-card-title">How You Compare</span></div>
              {comparisons.map((bar, i) => (
                <div key={i} className={`comparison-bar ${bar.highlight ? 'highlight' : ''}`}>
                  <span className="comparison-label">{bar.label}</span>
                  <div className="comparison-track">
                    <motion.div className="comparison-fill" style={{ background: bar.color }} initial={{ width: 0 }} animate={{ width: `${Math.min((bar.value / maxComparison) * 100, 100)}%` }} transition={{ duration: 1, delay: i * 0.1 }} />
                  </div>
                  <span className="comparison-value" style={{ color: bar.color }}>{bar.value}t</span>
                </div>
              ))}
            </div>

            <div className="result-card">
              <div className="result-card-header"><span className="result-card-title">Emission Breakdown</span></div>
              <div className="chart-container"><Doughnut data={chartData} options={chartOptions} /></div>
            </div>

            <div className="result-card">
              <div className="result-card-header"><span className="result-card-title"><Sprout size={16} style={{ display: 'inline', marginRight: 6 }} />Personalized Recommendations</span></div>
              {recommendations.map((rec, i) => {
                const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
                const priorityLabels = { high: 'High Impact', medium: 'Medium Impact', low: 'Quick Win' };
                return (
                  <motion.div key={i} className="tip-card" style={{ marginBottom: 10 }} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                    <div className="tip-card-header">
                      <span className="tip-card-category" style={{ background: `${priorityColors[rec.priority]}22`, color: priorityColors[rec.priority] }}>{priorityLabels[rec.priority]}</span>
                    </div>
                    <div className="tip-card-title">{rec.title}</div>
                    <div className="tip-card-body" dangerouslySetInnerHTML={{ __html: rec.description }} />
                    {rec.category !== 'general' && (
                      <div className="tip-card-footer"><span className="tip-card-stat saving"><TreePine size={12} /> Could save ~{rec.potential_saving} kg CO₂/year</span></div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
