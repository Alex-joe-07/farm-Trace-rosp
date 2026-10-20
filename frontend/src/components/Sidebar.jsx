import React from "react";
import { Package, GitFork, Users as UsersIcon, Layers } from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { name: "Food Items", key: "foodItems", icon: Package },
    { name: "Food Journey", key: "foodJourney", icon: GitFork },
    { name: "Network Users", key: "users", icon: UsersIcon },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-5 space-y-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-6 px-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </h2>
        </div>

        <nav className="flex flex-col space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-emerald-400" : "text-slate-400"
                  }`}
                />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500">
        <p className="font-semibold text-slate-700 mb-0.5">Secure Node</p>
        <p className="text-[11px] leading-relaxed">
          Logged into cryptographic trace ledger.
        </p>
      </div>
    </aside>
  );
}
