import React, { useState,useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Sentry from "@sentry/react"
import { fetch_RBAC } from '../../services/rbac_service';
import { EnterpriseCard } from './EnterpriseCard';
import { UserProfileCard } from './UserProfileCard';
import { StatusIndicator } from './StatusIndicator';
import { OrderList } from './OrderList';
import { calculateStats } from "./userDetails.utils";
import { BarChart2 ,FileText,Timer} from 'lucide-react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import RequestBarChart from './RequestsAnalytics/RequestBarchart';
import { ScheduleList } from '../SchedulingComponents/ScheduleList';
import { isProd } from '../../components/env';
const UserDetails = ({ 
  user, 
  request_amount, 
  approvedOrders = [], 
  rejectedOrders = [], 
  pendingOrders = [],
  completedOrders = [],
  MoreInformation=[],
  DepartmentalAcess=[],
  GeneralAccess=[]
}) => {
  const [expandedSections, setExpandedSections] = useState({
    approved: false,
    pending: false,
    rejected: false,
    completed: false
  });
  const [ADMIN_ROLES, set_ADMIN_ROLES] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    approvalRate: 0,
    avgProcessingTime: 0
  });
  const [PROTECTED_USERS,setPROTECTEDUSERS]=useState([])
 
  useEffect(() => {
    const fetchRBAC = async () => {
      try {
        const response = await fetch_RBAC();
        set_ADMIN_ROLES(response.data.data.ADMIN_ROLES_GENERAL);
        setPROTECTEDUSERS(response.data.data.PROTECTED_USERS)
      } catch (error) {
        if (error.message === "Network Error") {
          window.location.href = '/adminlogin';
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          window.location.href = '/adminlogin'; 
        } else {
          if (isProd)Sentry.captureException(error);
        }
      }
    };
    fetchRBAC();
  }, []);

  useEffect(() => {
    setStats(calculateStats(approvedOrders, rejectedOrders, pendingOrders, completedOrders,MoreInformation));
  }, [approvedOrders, rejectedOrders, pendingOrders, completedOrders]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isAdmin = ADMIN_ROLES.includes(user?.role);

  return (
   <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
  {/* Responsive flex: column on mobile, row on lg+ */}
  <div className="flex flex-col lg:flex-row gap-6">

    {/* Main Content: full width on mobile, 2/3 on lg+ */}
    <div className="w-full lg:w-2/3 lg:pr-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        <UserProfileCard user={user} />

        <div className="lg:col-span-2 space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <EnterpriseCard>
            <div className="p-6 text-center">
              <div className="flex justify-center">
                <FileText className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-700">Monthly Requests</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{request_amount}</p>
            </div>
          </EnterpriseCard>

          {isAdmin && (
            <>
              <EnterpriseCard>
                <div className="p-6 text-center">
                  <div className="flex justify-center">
                    <BarChart2 className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="mt-3 text-lg font-medium text-gray-700">Approval Rate</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.approvalRate}%</p>
                </div>
              </EnterpriseCard>
              <EnterpriseCard>
                <div className="p-6 text-center">
                  <div className="flex justify-center">
                    <Timer className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="mt-3 text-lg font-medium text-gray-700">Avg. Processing</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {stats.avgProcessingTime} {stats.avgProcessingTime === 1 ? "day" : "days"}
                  </p>
                </div>
              </EnterpriseCard>
            </>
          )}
          </div>


          {/* Request Details */}
          <EnterpriseCard>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Request Details</h2>
              {[
                { type: 'approved', orders: approvedOrders },
                { type: 'pending', orders: pendingOrders },
                { type: 'completed', orders: completedOrders },
                { type: 'rejected', orders: rejectedOrders },
                { type: 'MoreInformation', orders: MoreInformation },
              ].map(({ type, orders }) => (
                <div key={type} className="mb-6 last:mb-0">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className={`w-full rounded-xl p-4 shadow-sm flex justify-between items-center ${
                      type === 'approved' ? 'bg-green-50' :
                      type === 'pending' ? 'bg-yellow-50' :
                      type === 'MoreInformation' ? 'bg-gray-100' :
                      type === 'completed' ? 'bg-blue-50' : 'bg-red-50'
                    }`}
                    onClick={() => toggleSection(type)}
                  >
                    <StatusIndicator status={type} count={orders.length} />
                    {expandedSections[type]
                      ? <FiChevronUp className="text-xl text-gray-500" />
                      : <FiChevronDown className="text-xl text-gray-500" />
                    }
                  </motion.button>
                  <OrderList orders={orders} isExpanded={expandedSections[type]} />
                </div>
              ))}
            </div>
          </EnterpriseCard>
        </div>
      </div>
    </div>

    {/* Bar Chart: full width on mobile (so stacked), 1/3 on lg+ */}
    <div className="w-full lg:w-1/3 lg:pl-2 mb-10">
      <RequestBarChart DepartmentalAccess={DepartmentalAcess} GeneralAccess={GeneralAccess} />
      {/*<SchedulingButton/>*/}
      
      {(PROTECTED_USERS.includes(String(user.userId)))&&(  
        <ScheduleList />
      )
      }
    </div>
  </div>
</div>


  );
};

export default UserDetails;