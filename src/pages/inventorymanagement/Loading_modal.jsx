import React from "react"
import {motion, AnimatePresence} from "framer-motion"
import { Loader2 } from "lucide-react"

const Loading_modal=({isSubmitting})=>{
    
    return(
        <>
            <AnimatePresence>
                { (
                  <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center max-w-md w-full mx-4"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      transition={{ type: "spring", damping: 20 }}
                    >
                      <Loader2 className="animate-spin h-12 w-12 text-blue-500 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Operation processing </h3>
                      <p className="text-gray-600 text-center">
                        Please wait while operation is being processed. 
                        This may take a moment.
                      </p>
                    </motion.div>
                  </motion.div>
                )}
            </AnimatePresence>
        
        </>
    )


}

export default Loading_modal