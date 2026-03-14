import React, { useState } from "react";
import TenderDashboard from "./TenderDashboard";
import TenderUploadPage from "./TenderUploadPage";
import RequirementChecklistPage from "./RequirementChecklistPage";
import DraftEditorPage from "./DraftEditorPage";
import ComplianceIssuesPage from "./ComplianceIssuesPage";
import ExportPage from "./ExportPage";

const tabs = [
  { key: "dashboard", label: "Tender Dashboard", component: TenderDashboard },
  { key: "upload", label: "Upload & Overview", component: TenderUploadPage },
  { key: "checklist", label: "Requirement Checklist", component: RequirementChecklistPage },
  { key: "draft", label: "Draft Editor", component: DraftEditorPage },
  { key: "compliance", label: "Compliance Issues", component: ComplianceIssuesPage },
  { key: "export", label: "Export & Finalize", component: ExportPage },
];

const TendersPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const ActiveComponent = tabs.find((t) => t.key === activeTab)?.component || TenderDashboard;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4 mt-7">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">ERP</p>
        <h1 className="text-2xl font-semibold text-gray-800">Tender Module</h1>
        <p className="text-sm text-gray-600">
          Manage tender intake, drafting, compliance, and exports in a single workspace.
        </p>
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

export default TendersPage;
