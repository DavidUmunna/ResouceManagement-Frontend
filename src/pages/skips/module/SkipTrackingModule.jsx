import React, { useState } from "react";
import { useUser } from "../../../components/usercontext";
import { can } from "./permissions";
import SkipList from "./SkipList";
import SkipDetail from "./SkipDetail";
import TrucksDrivers from "./TrucksDrivers";
import Waybills from "./Waybills";
import Manifests from "./Manifests";
import CreateSkipModal from "./CreateSkipModal";
import ComplianceViewer from "./ComplianceViewer";
import Projects from "./Projects";
import Revenue from "./Revenue";
import SiteApprovers from "./SiteApprovers";

const TABS = [
  { key: "skips", label: "Skips" },
  { key: "trucks", label: "Trucks & Drivers" },
  { key: "waybills", label: "Waybills" },
  { key: "manifests", label: "Manifests" },
  { key: "projects", label: "Projects" },
  { key: "revenue", label: "Revenue" },
  { key: "approvers", label: "Site Approvers", perm: "manageApprovers" },
  { key: "compliance", label: "Compliance", perm: "viewCompliance" },
];

export default function SkipTrackingModule() {
  const { user } = useUser();
  const [tab, setTab] = useState("skips");
  const [selectedSkipId, setSelectedSkipId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [listKey, setListKey] = useState(0);

  const visibleTabs = TABS.filter((t) => !t.perm || can(user, t.perm));

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 mb-20 ">
      <div className="mb-6 pt-11">
        <h1 className="text-2xl font-bold text-gray-800">Skip Tracking</h1>
        <p className="text-sm text-gray-500">Skips, trucks, waybills and manifests across the disposal lifecycle.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSelectedSkipId(null); }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${
              tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "skips" && (
        selectedSkipId ? (
          <SkipDetail skipId={selectedSkipId} user={user} onBack={() => setSelectedSkipId(null)} />
        ) : (
          <SkipList key={listKey} onSelect={setSelectedSkipId} canCreate={can(user, "createSkip")} onNew={() => setShowCreate(true)} />
        )
      )}
      {tab === "trucks" && <TrucksDrivers user={user} />}
      {tab === "waybills" && <Waybills user={user} />}
      {tab === "manifests" && <Manifests user={user} />}
      {tab === "projects" && <Projects user={user} />}
      {tab === "revenue" && <Revenue />}
      {tab === "approvers" && <SiteApprovers />}
      {tab === "compliance" && <ComplianceViewer />}

      {showCreate && (
        <CreateSkipModal
          onClose={() => setShowCreate(false)}
          onDone={() => { setShowCreate(false); setListKey((k) => k + 1); }}
        />
      )}
    </div>
  );
}
