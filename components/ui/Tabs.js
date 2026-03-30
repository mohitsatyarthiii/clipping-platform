'use client';

import { useState } from 'react';

const Tabs = ({ tabs, defaultTab = 0, onChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    onChange?.(index);
  };

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-800 gap-1">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
              activeTab === index
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {activeTab === index && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-purple-500 to-cyan-500" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;
