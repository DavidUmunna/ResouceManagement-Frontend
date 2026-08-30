import {
  PlusSquare, History, FileSearch, Truck, Building2, Briefcase, Activity,
  Brain, CalendarDays, ShieldCheck, BarChart2, TrendingUp,
  ChevronDown, Package, Users, Wrench, Settings2,
} from 'lucide-react';
import { AiOutlineWarning } from 'react-icons/ai';
import { FiFileText, FiTruck } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { forwardRef, useState } from 'react';
import { useUser } from './usercontext';
import { ROUTE_ROLES as R } from '../constants/roles';

const NAV_GROUPS = [
  {
    label: 'Procurement',
    icon: Package,
    items: [
      { name: 'Assets Management',     to: '/admin/assetsmanagement',    icon: Briefcase,       visibleTo: R.assetsmanagement },
      { name: 'Vendor',                to: '/admin/supplierlist',        icon: Truck,           visibleTo: R.supplierlist },
      { name: 'Inventory',             to: '/admin/inventorymanagement', icon: PlusSquare,      visibleTo: R.inventorymanagement },
      { name: 'Inventory Logs',        to: '/admin/inventorylogs',       icon: History,         visibleTo: R.inventorylogs },
      { name: 'Tenders',               to: '/admin/tenders',             icon: Briefcase,       visibleTo: R.tenders },
      { name: 'PO Analytics',          to: '/admin/po-analytics',        icon: TrendingUp,      visibleTo: R['po-analytics'] },
    ],
  },
  {
    label: 'Human Resources',
    icon: Users,
    items: [
      { name: 'Department Assignment', to: '/admin/departmentassignment', icon: Building2,      visibleTo: R.departmentassignment },
      { name: 'My Leave',              to: '/admin/leave',                icon: CalendarDays },
      { name: 'Leave Admin',           to: '/admin/leave-admin',          icon: ShieldCheck,    visibleTo: R['leave-admin'] },
      { name: 'Leave Summary',         to: '/admin/leave-summary',        icon: BarChart2,      visibleTo: R['leave-summary'] },
    ],
  },
  {
    label: 'Operations',
    icon: Wrench,
    items: [
      { name: 'Skips Tracking',        to: '/admin/skipstracking',       icon: FiFileText,      visibleTo: R.skipstracking },
      { name: 'Skip Insights',         to: '/admin/skip-insights',       icon: TrendingUp,      visibleTo: R.skipstracking },
      { name: 'Skip Tracking (RFID)',  to: '/admin/skip-tracking',       icon: FiTruck,         visibleTo: R.skipstracking },
      { name: 'File Tracking',         to: '/admin/filetracking',        icon: FileSearch,      visibleTo: R.filetracking },
    ],
  },
  {
    label: 'Admin & Tools',
    icon: Settings2,
    items: [
      { name: 'AI Tools',              to: '/admin/ai-tools',            icon: Brain },
      { name: 'App Monitoring',        to: '/admin/monitoring',          icon: Activity,        visibleTo: R.monitoring },
      { name: 'Issues',                to: '/admin/feedback',            icon: AiOutlineWarning },
    ],
  },
];

const Sidebar = forwardRef(({ isOpen, onClose }, ref) => {
  const { user } = useUser();
  const [openGroups, setOpenGroups] = useState({});

  const toggle = (label) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.visibleTo || item.visibleTo.includes(user?.role)),
  })).filter((group) => group.items.length > 0);

  return (
    <div
      ref={ref}
      className={`fixed top-16 left-0 h-[calc(100%-4rem)] w-64 bg-gray-800 text-white z-20 shadow-xl
        transform transition-all duration-300 ease-in-out overflow-y-auto
        ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold tracking-wide">Utilities</h2>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {visibleGroups.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = !!openGroups[group.label];

          return (
            <div key={group.label}>
              <button
                onClick={() => toggle(group.label)}
                className="w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150"
              >
                <span className="flex items-center gap-3">
                  <GroupIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-semibold tracking-wide">{group.label}</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l border-gray-700 pl-3">
                  {group.items.map((item) => (
                    <Link
                      to={item.to}
                      key={item.name}
                      onClick={onClose}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-150"
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
});

export default Sidebar;
