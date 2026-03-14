import { useState } from 'react';
import { useMDReview } from './useMDReview';
import { ScheduleHeader } from './ScheduleHeader';
import { RequestList } from './RequestList';
import { CommentInput } from './CommentInput';
import { ModalFooter } from './Footer';
import * as Sentry from "@sentry/react"
import axios from 'axios';
import { isProd } from '../../components/env';
import DetailsDisplay from './DetailsDisplay';
export const MDReviewModal = ({ scheduleId, isOpen, onClose, onComplete }) => {
  const [comments, setComments] = useState('');
  const [selectedRequests, setSelectedRequests] = useState([]);
  const { schedule, isLoading, reviewSchedule, isReviewing } = useMDReview(scheduleId);

  if (!isOpen) return null;

  const handleToggleRequest = (requestId) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };
 

  const handleSubmit = async () => {
  try {
    // 1. Create array of ONLY included requests with their full data
    const includedRequests = schedule?.requests
      .filter(req => selectedRequests.includes(req.requestId._id))
      .map(req => ({
        requestId: req.requestId._id,
        included: true, // Explicitly mark as included
        processingStatus: "Pending" // Default status for accounts
      }));

    // 2. Identify removed request IDs
    const removedRequests = schedule?.requests
      .filter(req => !selectedRequests.includes(req.requestId._id))
      .map(req =>({
        requestId:req.requestId._id,
        included:false,


      })


      );

    // 3. Submit to API
    await reviewSchedule({
      status: 'Reviewed by MD',
      requests: [...includedRequests,...removedRequests], // Only the selected ones
      mdComments: comments,
      
      reviewedByMDAt: new Date()
    });

    // 4. Only execute on success
    onComplete();
    onClose();
    
  } catch (error) {
     if (error.message === "Network Error") {
              window.location.href = '/adminlogin';
            } else if (error.response?.status === 401 || error.response?.status === 403) {
              window.location.href = '/adminlogin'; 
            } else {
              if(isProd){

                Sentry.captureMessage("an error occurred while submitting review")
                Sentry.captureException(error)
              }
            }
  }
};

  const excludedCount = schedule?.requests.length - selectedRequests.length;
  const totalAmount = schedule?.totalAmount
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[70vh] flex flex-col m-10 mt-16 sm:m-10 lg:m-20 lg:mb-28 overflow-y-auto">
        <ScheduleHeader schedule={schedule} onClose={onClose} />
        <div className="flex-1  p-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading schedule details...</p>
            </div>
          ) : (
            <>
              <CommentInput value={comments} onChange={(e) => setComments(e.target.value)} />
              <RequestList
                requests={schedule?.requests.map(req => req.requestId)}
                selectedRequests={selectedRequests}
                onToggleRequest={handleToggleRequest}
                totalAmount={totalAmount}
              />
              {schedule.paymentDetails&&(
                <DetailsDisplay 
                Schedule={schedule}
                />
              )}
              {schedule.AccountsComment && (
                <div className="bg-blue-50 p-4 border-t">
                  <p className="text-sm font-medium text-gray-700">Information From Accounts:</p>
                  <p className="text-sm text-gray-600 mt-1 break-words">{schedule.AccountsComment}</p>
                </div>
              )}
            </>
          )}
        </div>

        <ModalFooter
          onClose={onClose}
          onSubmit={handleSubmit}
          excludedCount={excludedCount}
          isSubmitting={isReviewing}
        />
      </div>
    </div>
  );
};