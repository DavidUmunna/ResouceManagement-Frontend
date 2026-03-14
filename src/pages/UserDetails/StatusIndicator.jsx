import React from 'react';
import { colorPalette } from './enterpriseUI.constants';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  ClipboardCheck, 
  InfoIcon
} from "lucide-react";
export const StatusIndicator = ({ status, count }) => {
  const statusConfig = {
    approved: {
      color: colorPalette.success,
      icon: <CheckCircle className="w-5 h-5" />,
      label: 'Approved'
    },
    pending: {
      color: colorPalette.warning,
      icon: <Clock className="w-5 h-5" />,
      label: 'Pending'
    },
    rejected: {
      color: colorPalette.error,
      icon: <XCircle className="w-5 h-5" />,
      label: 'Rejected'
    },
    completed: {
      color: colorPalette.primary,
      icon: <ClipboardCheck className="w-5 h-5" />,
      label: 'Completed'
    },
    MoreInformation:{
        color:colorPalette.primary,
        icon:<InfoIcon className="w-5 h-5"/>,
        label:'More Info'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className="flex items-center">
      <div 
        className="p-2 rounded-lg mr-3"
        style={{ backgroundColor: `${config.color.light}20` }}
      >
        {React.cloneElement(config.icon, { className: `w-5 h-5 ${config.color.main}` })}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{config.label}</p>
        <p className="text-lg font-semibold" style={{ color: config.color.main }}>
          {count}
        </p>
      </div>
    </div>
  );
};