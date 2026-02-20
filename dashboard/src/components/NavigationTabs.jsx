import React from 'react';
import { LayoutDashboard, AlertTriangle, CheckSquare } from 'lucide-react';

function NavigationTabs({ activeTab, setActiveTab, criticalCount }) {
  const tabs = [
    {
      id: 'overview',
      label: 'ภาพรวมยอดเขย่ง (Overview)',
      icon: <LayoutDashboard className="w-4 h-4" />,
      color: 'blue',
    },
    {
      id: 'audit',
      label: 'ตรวจสอบความผิดปกติ (Audit)',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'red',
      badge: criticalCount > 0 ? criticalCount : null,
    },
    {
      id: 'referendum',
      label: 'ประชามติ (Referendum Turnout)',
      icon: <CheckSquare className="w-4 h-4" />,
      color: 'green',
    },
  ];

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
      red: isActive ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
      green: isActive ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
    };
    return colors[color] || colors.blue;
  };

  return (
    <nav className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm border border-slate-100 overflow-x-auto" role="tablist" aria-label="หัวข้อหลัก">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap ${getColorClasses(tab.color, activeTab === tab.id)}`}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`${tab.id}-panel`}
          id={`${tab.id}-tab`}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.badge && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1" aria-label={`${tab.badge} เขตวิกฤติ`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

export default NavigationTabs;
