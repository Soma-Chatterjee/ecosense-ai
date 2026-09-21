import { MessageSquare, Calculator, BarChart3, Lightbulb, Globe, Moon, Sun, Leaf } from 'lucide-react';

const navItems = [
  { id: 'chat', icon: MessageSquare, label: 'AI Chat' },
  { id: 'calculator', icon: Calculator, label: 'Carbon Calculator' },
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'tips', icon: Lightbulb, label: 'Eco Tips' },
  { id: 'about', icon: Globe, label: 'About & SDG' },
];

export default function Sidebar({ activeView, onViewChange, isDark, onThemeToggle }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => onViewChange('chat')} title="EcoSense AI">
        <Leaf size={22} />
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-btn ${activeView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon size={20} />
              <span className="tooltip">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-btn" onClick={onThemeToggle} title="Toggle theme">
          {isDark ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </aside>
  );
}
