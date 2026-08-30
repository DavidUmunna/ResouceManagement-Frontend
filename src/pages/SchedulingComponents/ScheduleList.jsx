import { useState } from 'react';
import { MDReviewModal } from '../MDreview';
import { useQuery } from 'react-query';
import { ScheduleCard } from './ScheduleCard';
import axios from 'axios';

export const ScheduleList = () => {
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const API_URL = `${process.env.REACT_APP_API_URL}/api`;
  // Fetch submitted schedules
  const { data: schedules, isLoading } = useQuery(
    'submittedSchedules',
    () => axios.get(`${API_URL}/scheduling/disbursement-schedules-unpaged?status=Submitted to MD`).then(res => res.data                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 )
  );

  const handleOpenModal = (scheduleId) => {
    setSelectedScheduleId(scheduleId);
    setIsModalOpen(true);
  };

  const handleReviewComplete = () => {
    // Optional: Refresh data or show notification
    console.log('MD review completed');
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Schedules Awaiting MD Review</h2>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading schedules…</p>
      ) : (
        <div
        className="
          space-y-4 
          overflow-y-auto 
          max-h-56 
          sm:max-h-72 
          md:max-h-96 
          lg:max-h-[32rem] 
          w-full
        "
      >
        {schedules?.map(schedule => (
          <ScheduleCard
            key={schedule._id}
            schedule={schedule}
            onReviewClick={() => handleOpenModal(schedule._id)}
          />
        ))}
      </div>

      )}

      <MDReviewModal
        scheduleId={selectedScheduleId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleReviewComplete}
      />
    </div>
  );
};