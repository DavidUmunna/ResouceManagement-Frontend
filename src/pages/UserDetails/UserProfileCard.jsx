import React from 'react';

import { EnterpriseCard } from './EnterpriseCard';
import { colorPalette } from './enterpriseUI.constants';
import { FiMail, FiCalendar, FiBriefcase } from 'react-icons/fi';
import { FaSitemap } from 'react-icons/fa';
import { formatDate, getInitials } from './userDetails.utils';
import userImg from "../../components/assets/user.png"

const STATUS_STYLES = {
  'Available': { dot: 'bg-green-500',  pill: 'bg-green-50 text-green-700'  },
  'Busy':      { dot: 'bg-yellow-500', pill: 'bg-yellow-50 text-yellow-700' },
  'On Leave':  { dot: 'bg-red-400',    pill: 'bg-red-50 text-red-700'       },
  'Remote':    { dot: 'bg-blue-500',   pill: 'bg-blue-50 text-blue-700'     },
};

const WorkStatusBadge = ({ status }) => {
  const styles = STATUS_STYLES[status] || { dot: 'bg-gray-400', pill: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${styles.pill}`}>
      <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
      {status}
    </span>
  );
};

const ProfileBadge = ({ role }) => (
  <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
    role === 'Admin'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800'
  }`}>
    {role}
  </span>
);

export const UserProfileCard = ({ user }) => (
  <EnterpriseCard hoverEffect={false} className="relative h-full">
    {/* Gradient header */}
    <div
      className="h-28 w-full"
      style={{
        background: `linear-gradient(135deg, ${colorPalette.primary.dark} 0%, ${colorPalette.primary.light} 100%)`
      }}
    ></div>

    {user?.role && <ProfileBadge role={user.role} />}

    <div className="px-6 pb-8 pt-2 relative">
      {/* Profile image */}
      <div className="flex justify-center -mt-16 mb-5">
        <div className="relative">
          {user?.imageurl ? (
            <img 
              src={userImg} 
              alt={user.name || "User"} 
              className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-xl" 
            />
          ) : (
            <div 
              className="w-28 h-28 rounded-full border-4 border-white flex items-center justify-center shadow-xl"
              style={{ backgroundColor: colorPalette.primary.dark }}
            >
              <span className="text-3xl font-bold text-white"> {/* Larger initials */}
                {getInitials(user?.name)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* User name */}
      <div className="text-center mb-5">
        <h2 className="text-xl font-bold text-gray-900">
          {user?.name || "Unknown User"}
        </h2>
      </div>

      {/* Details */}
      <div className="space-y-1.5">
        <div className="flex items-center space-x-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors"> {/* Larger padding */}
          <FiMail className="text-gray-500 text-base flex-shrink-0" /> {/* Larger icon */}
          <span className="text-gray-700 text-sm truncate">{user?.email || "No email provided"}</span> {/* Larger text */}
        </div>
        
        {user?.Department && (
          <div className="flex items-center space-x-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors">
            <FaSitemap className="text-gray-500 text-base flex-shrink-0" />
            <span className="text-gray-700 text-sm">{user.Department}</span>
          </div>
        )}
      
        {user?.WorkStatus && (
          <div className="flex items-center space-x-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors">
            <FiBriefcase className="text-gray-500 text-base flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Work Status</span>
              <WorkStatusBadge status={user.WorkStatus} />
            </div>
          </div>
        )}
        
        {user?.createdAt && (
          <div className="flex items-center space-x-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors">
            <FiCalendar className="text-gray-500 text-base flex-shrink-0" />
            <span className="text-gray-700 text-sm">
              Member since: {formatDate(user.createdAt.split("T")[0])}
            </span>
          </div>
        )}
      </div>
    </div>
  </EnterpriseCard>
);