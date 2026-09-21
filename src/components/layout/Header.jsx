import { Cpu, Recycle } from 'lucide-react';

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-title">
        <div>
          <h1>EcoSense AI</h1>
          <span className="subtitle">Personal Carbon Footprint Advisor</span>
        </div>
        <span className="header-badge">
          <span className="pulse-dot" />
          <Cpu size={13} />
          AI Powered
        </span>
      </div>
      <div className="header-actions">
        <span className="sdg-badge">
          <Recycle size={13} />
          SDG 12 — Responsible Consumption
        </span>
      </div>
    </header>
  );
}
