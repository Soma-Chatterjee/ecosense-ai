import { motion } from 'framer-motion';
import { Recycle, Scale, Search, Shield, Ban, Cpu, Leaf, BookOpen } from 'lucide-react';
import sdgData from '../../data/sdg-info.json';

const responsibleAI = [
  { icon: Scale, title: 'Fairness', text: 'Tips and calculations are designed to be inclusive across different income levels, geographies, and lifestyles. No assumptions about user demographics.' },
  { icon: Search, title: 'Transparency', text: 'All emission factors are sourced from IPCC, EPA, and verified databases. The AI\'s reasoning process is visible in its responses.' },
  { icon: Shield, title: 'Privacy', text: 'All data stays in your browser. No personal information is collected, stored, or transmitted. Everything runs locally.' },
  { icon: Ban, title: 'No Harmful Use', text: 'The AI provides informational guidance only. It does not guilt, shame, or discriminate. It encourages positive action without judgment.' },
];

const projectInfo = [
  { label: 'Project', value: 'EcoSense AI' },
  { label: 'Internship', value: '1M1B AI for Sustainability' },
  { label: 'Collaboration', value: 'IBM SkillsBuild & AICTE' },
  { label: 'SDG Focus', value: 'SDG 12 — Responsible Consumption', highlight: true },
  { label: 'AI Tools Used', value: 'IBM BOB, Prompt Engineering, RAG' },
  { label: 'Developer', value: 'Soma Chatterjee' },
];

export default function AboutView() {
  const sdg12 = sdgData.sdg12;

  return (
    <div className="about-view">
      <motion.div className="about-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2>About EcoSense AI</h2>
        <p>An AI-powered personal carbon footprint advisor designed to help individuals understand and reduce their environmental impact through responsible consumption choices.</p>
      </motion.div>

      <motion.div className="info-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3><Recycle size={18} style={{ color: '#D4A84B' }} /> SDG 12 — Responsible Consumption and Production</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14, lineHeight: 1.7 }}>
          Ensure sustainable consumption and production patterns. This project directly addresses SDG 12 by empowering individuals with AI-driven insights about their consumption patterns.
        </p>
        <div>
          {sdg12?.targets?.map(target => (
            <div key={target.id} className="sdg-target">
              <span className="sdg-target-id">{target.id}</span>
              <span className="sdg-target-text">{target.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={18} /> Did You Know?
        </h3>
        <div className="fact-cards">
          {sdg12?.facts?.map((fact, i) => (
            <motion.div key={i} className="fact-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
              {fact}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="info-card" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', marginTop: 32 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h3 style={{ color: 'var(--color-primary-light)' }}><Cpu size={18} /> Responsible AI Considerations</h3>
        {responsibleAI.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="responsible-ai-item">
              <div className="rai-icon"><Icon size={18} /></div>
              <div>
                <div className="rai-title">{item.title}</div>
                <div className="rai-text">{item.text}</div>
              </div>
            </div>
          );
        })}
      </motion.div>

      <motion.div className="info-card" style={{ borderColor: 'rgba(59, 130, 246, 0.2)', marginTop: 32 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 style={{ color: '#60A5FA' }}><Leaf size={18} /> Project Information</h3>
        {projectInfo.map((row, i) => (
          <div key={i} className="project-info-row">
            <span className="project-info-label">{row.label}</span>
            <span className="project-info-value" style={row.highlight ? { color: '#D4A84B' } : {}}>{row.value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
