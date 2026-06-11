import { PlusSquare, History, FileSearch, Truck, Building2, Briefcase, Activity, Brain, CalendarDays, ShieldCheck, BarChart2, TrendingUp } from 'lucide-react';
import { AiOutlineWarning } from 'react-icons/ai';
import { FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { forwardRef } from 'react';
import { useUser } from './usercontext';
import { ROUTE_ROLES as R } from '../constants/roles';

const NAV_ITEMS = [
  { name: 'Assets Management',    to: '/admin/assetsmanagement',    icon: Briefcase,        visibleTo: R.assetsmanagement },
  { name: 'Vendor',               to: '/admin/supplierlist',        icon: Truck,            visibleTo: R.supplierlist },
  { name: 'Inventory management', to: '/admin/inventorymanagement', icon: PlusSquare,       visibleTo: R.inventorymanagement },
  { name: 'Inventory logs',       to: '/admin/inventorylogs',       icon: History,          visibleTo: R.inventorylogs },
  { name: 'Tenders',              to: '/admin/tenders',             icon: Briefcase,        visibleTo: R.tenders },
  { name: 'File Tracking',        to: '/admin/filetracking',        icon: FileSearch,       visibleTo: R.filetracking },
  { name: 'AI Tools',             to: '/admin/ai-tools',            icon: Brain,            visibleTo: R['ai-tools'] },
  { name: 'Department Assignment',to: '/admin/departmentassignment',icon: Building2,        visibleTo: R.departmentassignment },
  { name: 'Skips Tracking',       to: '/admin/skipstracking',       icon: FiFileText,       visibleTo: R.skipstracking },
  { name: 'App Monitoring',       to: '/admin/monitoring',          icon: Activity,         visibleTo: R.monitoring },
  { name: 'Issues',               to: '/admin/feedback',            icon: AiOutlineWarning },
  { name: 'My Leave',             to: '/admin/leave',               icon: CalendarDays },
  { name: 'Leave Admin',          to: '/admin/leave-admin',         icon: ShieldCheck,      visibleTo: R['leave-admin'] },
  { name: 'Leave Summary',        to: '/admin/leave-summary',       icon: BarChart2,        visibleTo: R['leave-summary'] },
  { name: 'PO Analytics',         to: '/admin/po-analytics',        icon: TrendingUp,       visibleTo: R['po-analytics'] },
];

const Sidebar = forwardRef(({ isOpen, onClose }, ref) => {
  const { user } = useUser();

  const visibleItems = NAV_ITEMS.filter(item =>
    !item.visibleTo || item.visibleTo.includes(user?.role)
  );

  return (
    <div
      ref={ref}
      className={`fixed top-16 left-0 h-[calc(100%-4rem)] w-64 bg-gray-800 text-white z-20 shadow-xl
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold tracking-wide">Utilities</h2>
      </div>

      <nav className="flex flex-col gap-2 p-4">
        {visibleItems.map((item) => (
          <Link
            to={item.to}
            key={item.name}
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-md transition-all duration-200 hover:bg-gray-700 hover:scale-[1.02]"
          >
            <item.icon className="w-5 h-5 text-gray-300" />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
});

export default Sidebar;
