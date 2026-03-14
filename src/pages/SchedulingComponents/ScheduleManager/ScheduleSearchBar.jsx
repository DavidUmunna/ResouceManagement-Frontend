import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

const ScheduleSearchBar = ({ schedules, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      onSearch(schedules); // Return all schedules if search is empty
      return;
    }

    const filtered = schedules?.filter(schedule => {
      // Search in schedule name
      if (schedule.name?.toLowerCase().includes(term)) return true;
      
      // Search in status
      if (schedule.status?.toLowerCase().includes(term)) return true;
      
      // Search in request titles
      if (schedule.requests?.some(request => 
        request.requestId?.Title?.toLowerCase().includes(term)
      )) return true;
      
      // Search in total amount
      if (schedule.totalAmount?.toString().includes(term)) return true;
      
      // Search in MD comments
      if (schedule.mdComments?.toLowerCase().includes(term)) return true;
      
      // Search in dates
      const createdAt = new Date(schedule.createdAt).toLocaleDateString();
      if (createdAt.includes(term)) return true;
      
      const reviewedDate = schedule.reviewedByMDAt 
        ? new Date(schedule.reviewedByMDAt).toLocaleDateString()
        : '';
      if (reviewedDate.includes(term)) return true;
      
      return false;
    });

    onSearch(filtered);
  };

  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder="Search by status, name, request titles..."
        value={searchTerm}
        onChange={handleSearch}
      />
    </div>
  );
};

export default ScheduleSearchBar