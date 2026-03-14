import React from 'react';

import { EnterpriseCard } from './EnterpriseCard';
import { colorPalette, typography} from './enterpriseUI.constants';
import { FiMail, FiCalendar } from 'react-icons/fi';
import { FaSitemap,FaUser } from 'react-icons/fa';
import { formatDate, getInitials } from './userDetails.utils';
import userImg from "../../components/assets/user.png"
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
    {/* Gradient Header with more padding */}
    <div 
      className="h-48 w-full bg-gradient-to-r from-indigo-600 to-blue-600"
      style={{ 
        background: `linear-gradient(135deg, ${colorPalette.primary.dark} 0%, ${colorPalette.primary.light} 100%)`
      }}
    ></div>
    
    {user?.role && <ProfileBadge role={user.role} />}
    
    <div className="px-8 pb-10 pt-2 relative"> {/* Increased padding */}
      {/* Profile Image with more margin */}
      <div className="flex justify-center -mt-20 mb-6"> {/* Increased negative margin and bottom margin */}
        <div className="relative">
          {user?.imageurl ? (
            <img 
              src={userImg} 
              alt={user.name || "User"} 
              className="w-36 h-36 rounded-full border-4 border-white object-cover shadow-xl" 
            />
          ) : (
            <div 
              className="w-36 h-36 rounded-full border-4 border-white flex items-center justify-center shadow-xl"
              style={{ backgroundColor: colorPalette.primary.dark }}
            >
              <span className="text-5xl font-bold text-white"> {/* Larger initials */}
                {getInitials(user?.name)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* User Info with more spacing */}
      <div className="text-center space-y-3 mb-8"> {/* Added bottom margin */}
        <h2 className={`${typography.h2} text-gray-900`}>
          {user?.name || "Unknown User"}
        </h2>
        {/*<p className="text-gray-500 text-lg">{user?.position || "No position specified"}</p> {/* Larger text */}
      </div>
      
      {/* Details with more spacing */}
      <div className="space-y-4"> {/* Increased spacing between items */}
        <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"> {/* Larger padding */}
          <FiMail className="text-gray-500 text-xl flex-shrink-0" /> {/* Larger icon */}
          <span className="text-gray-700 text-lg truncate">{user?.email || "No email provided"}</span> {/* Larger text */}
        </div>
        
        {user?.Department && (
          <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <FaSitemap className="text-gray-500 text-xl flex-shrink-0" />
            <span className="text-gray-700 text-lg">{user.Department}</span>
          </div>
        )}

        {user?.Availability &&(
          <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <FaUser className="text-gray-500 text-xl flex-shrink-0" />
            <span className="text-gray-700 text-lg">{user.Department}</span>
          </div>
        )}
        
        {user?.createdAt && (
          <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <FiCalendar className="text-gray-500 text-xl flex-shrink-0" />
            <span className="text-gray-700 text-lg">
              Member since: {formatDate(user.createdAt.split("T")[0])}
            </span>
          </div>
        )}
      </div>
    </div>
  </EnterpriseCard>
);