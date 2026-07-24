import React, { useState } from "react";
import PredictiveMaintenanceForm from "./PredictiveMaintenanceForm";
import LabInterpretationForm from "./LabInterpretationForm";
import OptimizeLogisticsForm from "./OptimizeLogisticsForm";
import ComplianceReportGenerator from "./ComplianceReportGenerator";

const tabs = [
  { key: "maintenance", label: "Predictive Maintenance", component: PredictiveMaintenanceForm },
  { key: "lab", label: "Lab Interpretation", component: LabInterpretationForm },
  { key: "logistics", label: "Logistics Optimization", component: OptimizeLogisticsForm },
  { key: "compliance", label: "Compliance Reporting", component: ComplianceReportGenerator },
];

const AiToolsPage = () => {
  const [activeTab, setActiveTab] = useState("maintenance");
  const ActiveComponent = tabs.find((tab) => tab.key === activeTab)?.component || PredictiveMaintenanceForm;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4 mt-10">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">AI Toolkit</p>
        <h1 className="text-2xl font-semibold text-gray-800">Smart Assistants</h1>
        <p className="text-sm text-gray-600">Run predictions, interpret lab results, optimize logistics, and generate compliance reports.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex flex-wrap border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "text-blue-600 border-blue-600 bg-blue-50"
                  : "text-gray-600 border-transparent hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default AiToolsPage;
