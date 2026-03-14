import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { ScheduleForm } from './ScheduleForm'; // Reusable form component

const ScheduleEditor = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  // Fetch schedule data
  const API_URL = `${process.env.REACT_APP_API_URL}`;
  const { data: schedule, isLoading } = useQuery(
    ['schedule', id],
    
    () => axios.get(`${API_URL}/api/scheduling/disbursement-schedules/${id}`).then(res => res.data)
  );

  // Update schedule mutation
  const updateSchedule = useMutation(
    (updatedData) => axios.put(`${API_URL}/api/scheduling/disbursement-schedules/${id}`, updatedData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['schedule', id]);
        queryClient.invalidateQueries('draftSchedules');
      }
    }
  );

  if (isLoading) return <div>Loading schedule...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Edit Schedule</h1>
      <ScheduleForm 
        initialData={schedule}
        onSubmit={updateSchedule.mutate}
        isSubmitting={updateSchedule.isLoading}
      />
    </div>
  );
};

export default ScheduleEditor;