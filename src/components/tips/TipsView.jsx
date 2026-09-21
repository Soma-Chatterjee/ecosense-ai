import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Globe, Utensils, Car, Zap, ShoppingBag, Recycle, Droplets, Sprout, Leaf } from 'lucide-react';
import knowledgeBase from '../../engine/knowledgeBase';

const categoryFilters = [
  { id: 'all', label: 'All Tips', icon: Globe },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'transport', label: 'Transport', icon: Car },
  { id: 'energy', label: 'Energy', icon: Zap },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'waste', label: 'Waste', icon: Recycle },
  { id: 'water', label: 'Water', icon: Droplets },
];

const categoryIcons = { food: Utensils, transport: Car, energy: Zap, shopping: ShoppingBag, waste: Recycle, water: Droplets };

export default function TipsView() {
  const [activeCategory, setActiveCategory] = useState('all');

  const tips = useMemo(() => knowledgeBase.getByCategory(activeCategory), [activeCategory]);

  return (
    <div className="tips-view">
      <h2 className="section-title">Sustainability Tips</h2>
      <p className="section-subtitle">Actionable tips to reduce your carbon footprint, organized by category</p>

      <div className="tips-filter-bar">
        {categoryFilters.map(filter => {
          const Icon = filter.icon;
          return (
            <button key={filter.id} className={`filter-chip ${activeCategory === filter.id ? 'active' : ''}`} onClick={() => setActiveCategory(filter.id)}>
              <Icon size={14} /> {filter.label}
            </button>
          );
        })}
      </div>

      <div className="tips-grid">
        {tips.map((tip, i) => {
          const catInfo = knowledgeBase.getCategoryInfo(tip.category) || {};
          const CatIcon = categoryIcons[tip.category] || Leaf;
          return (
            <motion.div key={tip.id} className="tip-full-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <div className="tip-icon-wrapper" style={{ background: `${catInfo.color || '#10B981'}15`, color: catInfo.color || '#10B981' }}>
                <CatIcon size={18} />
              </div>
              <div className="tip-title">{tip.title}</div>
              <div className="tip-description">{tip.description}</div>
              <div className="tip-meta">
                <span className="tip-saving-badge"><Sprout size={12} /> {tip.co2_saving_kg_year} kg CO₂/yr</span>
                <span className={`tip-difficulty ${tip.difficulty}`}>{tip.difficulty}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
