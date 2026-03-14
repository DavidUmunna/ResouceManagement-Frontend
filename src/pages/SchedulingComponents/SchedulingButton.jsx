import React from "react"


const SchedulingButton=({setScheduleData, ScheduleData})=>{
    
    return(
        <>
          <div className="p-3 rounded-xl w-full mt-4">
            <button className="bg-blue-900 p-6  rounded-xl w-full">
                <strong className="text-white">Request Schedules</strong>
            </button>
          </div>
        
        </>
    )
}

export default SchedulingButton;