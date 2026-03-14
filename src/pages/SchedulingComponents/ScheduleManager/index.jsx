import { useState } from 'react';
import { Tab } from '@headlessui/react';
import ScheduleCreator from './ScheduleCreator';
import DraftSchedules from './DraftSchedules';
import SubmittedSchedules from './SubmittedSchedules';

const ScheduleManager = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = [
    { name: 'Create New', component: <ScheduleCreator onSuccess={() => setRefreshKey(prev => prev + 1)} /> },
    { name: 'Draft Schedules', component: <DraftSchedules refreshKey={refreshKey} /> },
    { name: 'Submitted Schedules', component: <SubmittedSchedules refreshKey={refreshKey} /> }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Disbursement Schedules</h2>
      
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
          {tabs.map((tab, idx) => (
            <Tab
              key={idx}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
                ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                ${selected ? 'bg-white shadow' : 'text-blue-500 hover:bg-white/[0.12] hover:text-gray-600'}`
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        
        <Tab.Panels>
          {tabs.map((tab, idx) => (
            <Tab.Panel key={idx}>
              {tab.component}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default ScheduleManager;