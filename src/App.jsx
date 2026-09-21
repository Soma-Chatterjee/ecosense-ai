import { useState, useCallback, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ChatView from './components/chat/ChatView';
import CalculatorView from './components/calculator/CalculatorView';
import DashboardView from './components/dashboard/DashboardView';
import TipsView from './components/tips/TipsView';
import AboutView from './components/about/AboutView';
import Background3D from './components/three/Background3D';

const viewComponents = {
  chat: ChatView,
  calculator: CalculatorView,
  dashboard: DashboardView,
  tips: TipsView,
  about: AboutView,
};

export default function App() {
  const [activeView, setActiveView] = useState('chat');
  const [isDark, setIsDark] = useState(true);
  const [calcResults, setCalcResults] = useState(null);

  const handleViewChange = useCallback((view) => setActiveView(view), []);
  const handleThemeToggle = useCallback(() => setIsDark(prev => !prev), []);
  const handleCalcResults = useCallback((results) => setCalcResults(results), []);

  const ActiveComponent = viewComponents[activeView];

  return (
    <>
      <Suspense fallback={null}>
        <Background3D />
      </Suspense>

      <div className="app-container">
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          isDark={isDark}
          onThemeToggle={handleThemeToggle}
        />

        <main className="main-content">
          <Header />

          <div className="content-area">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                className="view-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeView === 'calculator' ? (
                  <ActiveComponent onResults={handleCalcResults} />
                ) : activeView === 'dashboard' ? (
                  <ActiveComponent results={calcResults} />
                ) : (
                  <ActiveComponent />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}
