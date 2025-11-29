import { FiPlus,FiSearch, FiCalendar } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
const SearchBar=({searchTerm,setSearchTerm,dateRange,handleDateRangeChange,setShowForm,resetForm,setEditingItem})=>{
    return (
        <>
       <div className="flex-1 flex flex-row flex-wrap gap-3 min-w-[250px]">
                 {/* Search input */}
                 <div className="relative flex-2 xs:flex-initial xs:w-48 sm:w-56">
                   <FiSearch className="absolute left-3 top-3 text-gray-400" />
                   <input
                     type="text"
                     placeholder="Search..."
                     className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm sm:text-base"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                 </div>
                 
                 
                 
                 {/* Date range picker */}
                 <div className="relative flex-1  xs:flex-initial xs:w-48 sm:w-56">
                   <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                   <DatePicker
                     selectsRange={true}
                     startDate={dateRange.startDate}
                     endDate={dateRange.endDate}
                      onChange={(update) => {
                       handleDateRangeChange(update);
                     }}
                     isClearable={true}
                     placeholderText="Date range"
                     className="pl-4 pr-10 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                   />
                 </div>

                 <button
                             onClick={() => {
                               setEditingItem(null);
                               resetForm();
                               setShowForm(true);
                             }}
                             className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-[1.02] text-sm sm:text-base"
                           >
                             <FiPlus className="mr-1 sm:mr-2" />
                             <span className="whitespace-nowrap">Add Track</span>
                           </button>
               </div>
             
        </>
    )

}

export default  SearchBar;