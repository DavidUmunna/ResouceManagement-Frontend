import {  PlusSquare,History, FileSearch, Truck, Building2, Briefcase,Activity } from 'lucide-react';
import {FiFileText} from "react-icons/fi"
import { Link } from 'react-router-dom';
import { forwardRef } from 'react';

import { useUser } from './usercontext';
const Sidebar=forwardRef(({ isOpen, onClose },ref) =>{
  
  const {user}=useUser()
  const sidebar = [
    //{ name: "Inventory", to: "/#", icon: Boxes,visibleTo: ["procurement_officer","human_resources","internal_auditor","admin","global_admin"]  },
    { name: "Assets Management", to: "/admin/assetsmanagement", icon: Briefcase,visibleTo: ["procurement_officer","human_resources","global_admin","Accountant","Financial_manager" ] },
    { name: "Vendor", to: "/admin/supplierlist", icon: Truck,visibleTo:["procurement_officer",'global_admin',"internal_auditor"] },
    { name:"Inventory management" ,to:"/admin/inventorymanagement", icon:PlusSquare, visibleTo: ["procurement_officer","admin","human_resources","global_admin","Environmental_lab_manager","lab_supervisor","QHSE Coordinator"] },
    { name:"Inventory logs" ,to:"/admin/inventorylogs", icon:History, visibleTo: ["global_admin","admin","QHSE Coordinator","lab_supervisor","procurement_officer","Environmental_lab_manager"] },
    { name:"File Tracking", to:"/admin/filetracking",icon:FileSearch, visibleTo:["Contracts_manager","global_admin"]},
    { name: "Department Assignment", to: "/admin/departmentassignment", icon: Building2,visibleTo:["human_resources","global_admin","Waste Management Manager","Financial_manager"] },
    { name: "Skips Tracking", to: "/admin/skipstracking", icon: FiFileText,visibleTo:["global_admin","Waste Management Manager","Waste Management Supervisor","Logistics Manager"] },
    { name: "App Monitoring", to: "/admin/monitoring", icon: Activity,visibleTo:["global_admin"] },

  ];

  return (
    <div
      ref={ref} 
      className={`fixed top-16 left-0 h-[calc(100%-4rem)] w-64 bg-gray-800 text-white z-20 shadow-xl
      transform transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold tracking-wide">Utilities</h2>
      </div>

      <nav className="flex flex-col gap-2 p-4">
        {sidebar.filter(item => {
                          // If `visibleTo` exists, check if user has permission
                          if (item.visibleTo) {
                            return item.visibleTo.includes(user?.role);
                          }
                          // If no restriction, show it to everyone
                          return true;
                        }).map((item) => (
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


export default Sidebar
