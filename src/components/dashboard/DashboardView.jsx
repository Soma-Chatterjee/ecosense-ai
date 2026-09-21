import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, CalendarDays, TrendingDown, TreePine, BarChart3 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import calculator from '../../engine/calculator';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function AnimatedNumber({ value, decimals = 1 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (value - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{value >= 100 ? Math.round(display) : display.toFixed(decimals)}</>;
}

export default function DashboardView({ results }) {
  if (!results) {
    return (
      <div className="dashboard-view">
        <h2 className="section-title">Impact Dashboard</h2>
        <p className="section-subtitle">Visual overview of your environmental impact and potential savings</p>
        <div className="empty-state" style={{ padding: 64 }}>
          <div className="empty-state-icon"><BarChart3 size={28} /></div>
          <div className="empty-state-text">Use the <strong>Carbon Calculator</strong> first to populate your dashboard with personalized data</div>
        </div>
      </div>
    );
  }

  const recs = calculator.getRecommendations();
  const totalSaving = recs.filter(r => r.category !== 'general').reduce((sum, r) => sum + r.potential_saving, 0);
  const vsIndia = results.totalAnnualTonnes - results.comparisons.india_avg;

  const statCards = [
    { title: 'Daily Footprint', value: results.totalDaily, unit: 'kg CO₂', icon: Thermometer, change: vsIndia > 0 ? `↑ ${Math.abs(vsIndia).toFixed(1)}t above India avg` : `↓ ${Math.abs(vsIndia).toFixed(1)}t below India avg`, positive: vsIndia <= 0 },
    { title: 'Annual Estimate', value: results.totalAnnualTonnes, unit: 'tonnes', icon: CalendarDays, change: results.totalAnnualTonnes < results.comparisons.global_avg ? `Below global avg (${results.comparisons.global_avg}t)` : `Above global avg (${results.comparisons.global_avg}t)`, positive: results.totalAnnualTonnes < results.comparisons.global_avg },
    { title: 'Potential Savings', value: totalSaving, unit: 'kg CO₂/yr', icon: TrendingDown, change: `From ${recs.length} recommendations`, positive: true },
    { title: 'Trees Equivalent', value: results.treesNeeded, unit: 'trees/yr', icon: TreePine, change: `To offset ${results.totalAnnualTonnes}t CO₂/yr`, positive: true },
  ];

  const pieData = {
    labels: Object.keys(results.breakdown).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    datasets: [{ data: Object.values(results.breakdown).map(b => Math.round(b.daily * 100) / 100), backgroundColor: Object.values(results.breakdown).map(b => b.color), borderColor: Object.values(results.breakdown).map(b => b.color + '33'), borderWidth: 2, hoverOffset: 6 }]
  };

  const barData = {
    labels: ['You', 'India', 'Paris Target', 'Global', 'EU', 'US'],
    datasets: [{ label: 'Annual CO₂ (tonnes)', data: [results.comparisons.you, results.comparisons.india_avg, results.comparisons.paris_target, results.comparisons.global_avg, results.comparisons.eu_avg, results.comparisons.us_avg], backgroundColor: ['#10B98199', '#3B82F699', '#06B6D499', '#F59E0B99', '#8B5CF699', '#EF444499'], borderColor: ['#10B981', '#3B82F6', '#06B6D4', '#F59E0B', '#8B5CF6', '#EF4444'], borderWidth: 2, borderRadius: 6, borderSkipped: false }]
  };

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(16,185,129,0.3)', borderWidth: 1, padding: 10, cornerRadius: 8 } }, scales: { x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } }, y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b', callback: v => v + 't', font: { size: 11 } } } } };
  const pieOpts = { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, padding: 10, usePointStyle: true } }, tooltip: { backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(16,185,129,0.3)', borderWidth: 1, padding: 10, cornerRadius: 8, callbacks: { label: ctx => { const total = ctx.dataset.data.reduce((a, b) => a + b, 0); return ` ${ctx.parsed} kg CO₂/day (${Math.round((ctx.parsed / total) * 100)}%)`; } } } } };

  return (
    <div className="dashboard-view">
      <h2 className="section-title">Impact Dashboard</h2>
      <p className="section-subtitle">Visual overview of your environmental impact and potential savings</p>

      <div className="dashboard-grid">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} className="dash-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="dash-card-header">
                <span className="dash-card-title">{card.title}</span>
                <Icon size={22} strokeWidth={1.5} style={{ color: 'var(--color-primary)', opacity: 0.6 }} />
              </div>
              <div className="dash-stat"><AnimatedNumber value={card.value} /><span className="dash-stat-unit">{card.unit}</span></div>
              <div className={`dash-stat-change ${card.positive ? 'positive' : 'negative'}`}>{card.change}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <motion.div className="dash-card" style={{ minHeight: 350 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="dash-card-header"><span className="dash-card-title">Emission Sources</span></div>
          <div className="chart-container"><Doughnut data={pieData} options={pieOpts} /></div>
        </motion.div>
        <motion.div className="dash-card" style={{ minHeight: 350 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="dash-card-header"><span className="dash-card-title">Global Comparison</span></div>
          <div className="chart-container"><Bar data={barData} options={chartOpts} /></div>
        </motion.div>
      </div>
    </div>
  );
}
