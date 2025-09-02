import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard'
import ProductivityChart from '../components/productivityChart'
import ProjectFilter from '../components/ProjectTagFilter'
import LanguagePieChart from '../components/LanguagePieChart'
import LanguageRadarChart from '../components/LanguageRadarChart'
import ThemeToggle from '../components/ThemeToggle'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext';

// --- Animation Variants ---
// We define them here as they are specific to this page's layout.
const cardsContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      // A short delay after the page loads before the cards start animating in.
      delayChildren: 0.3,
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'tween', duration: 0.4 },
  },
};


export default function DashboardPage({

  filteredData,
  projectNames,
  selectedProjects,
  onProjectClick
}) {
  // --- The Deferred Rendering State ---
  // This is the key to our performance optimization.
  const [renderCharts, setRenderCharts] = useState(false);
  const { theme, handleThemeToggle } = useTheme();

  useEffect(() => {
    // This effect runs only once after the component mounts.
    const timer = setTimeout(() => {
      // After a very short delay, we set the state to true,
      // which will trigger a re-render and show the charts.
      setRenderCharts(true);
    }, 300); // 300ms delay to allow animations to finish

    // Cleanup function to clear the timer
    return () => clearTimeout(timer);
  }, []); // Empty dependency array means it runs only on mount


  return (
    <motion.main
      className="min-h-screen"
      // A simple fade for the overall page container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <header className="flex justify-between items-center my-8">
          {/* The title participates in the shared layout animation */}
          <h1

            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            Dashboard
          </h1>

        </header>

        <ProjectFilter
          array={projectNames}
          selectedProject={selectedProjects}
          handleClick={onProjectClick}
        />

        {/* --- The Stat Cards Row --- */}
        {/* It is now a motion.div again, with the correct variants */}
        <motion.div
          className="flex flex-wrap gap-4"
          variants={cardsContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Each card is wrapped in a motion.div for the stagger effect */}
          <motion.div variants={cardVariants}>
            <StatCard sessions={filteredData} title={"Total Hours Coded"} dataKey={'duration'} />
          </motion.div>
          <motion.div variants={cardVariants}>
            <StatCard sessions={filteredData} title={"Total Keystrokes"} dataKey={'keystrokes'} />
          </motion.div>
          <motion.div variants={cardVariants}>
            <StatCard sessions={filteredData} title={"Total Lines Added"} dataKey={'linesAdded'} />
          </motion.div>
        </motion.div>

        {/* --- The Charts Section --- */}
        {/* This entire section is now conditionally rendered */}
        {renderCharts && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16'>
            <div className="bg-slate-100 dark:bg-gray-800 rounded-xl p-6">
              <ProductivityChart sessions={filteredData} dataKey="duration" strokeColor="#8884d8" title={'Duration'} />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
              <LanguagePieChart sessions={filteredData} title="Language Breakdown" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
              <ProductivityChart sessions={filteredData} dataKey="keystrokes" strokeColor="#10b981" title={'Keystrokes'} />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
              <LanguageRadarChart sessions={filteredData} />
            </div>
          </div>
        )}
      </div>
    </motion.main>
  );
}