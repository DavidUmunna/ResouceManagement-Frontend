import React, { useState, useEffect } from "react";
import { createOrder } from "../services/OrderService";
import { FileText, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../components/usercontext";
import { FiInfo } from "react-icons/fi";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const inputVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { yoyo: Infinity } },
};

const CreateOrder = () => {
  const { user } = useUser();
  const [targetDepartment,setTargetDepartment]=useState("")
  const [supplier, setSupplier] = useState("Halden");
  const [products, setProducts] = useState([{ name: "", quantity: 1, price: 0 }]);
  const [urgency, setUrgency] = useState("");
  const [files, setFiles] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [email, setEmail] = useState("");
  const [filenames, setfilenames] = useState([]);
  const [Title, settitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const[Error,setError]=useState("")
  const [staff,setStaff]=useState("")
  const [role,setrole]=useState("")
  const [IsTarget,setIsTarget]=useState(false)
  const [showInfo, setShowInfo] = useState(false);
  useEffect(() => {
    if (user) {
    
      setEmail(user.email);
      setStaff(user.userId)
    }
  }, [user]);

  const handleFileChange = (event) => {
    const uploadedFiles = event.target.files ? Array.from(event.target.files) : [];
    setFiles(uploadedFiles);
    if (uploadedFiles.length > 0) {
      setfilenames(uploadedFiles.map(file => file.name));
    }
  };
  
  const handleInputChange=(e)=>{
    const checked=e.target.checked
    setIsTarget(checked)
    if(!checked){
      setTargetDepartment("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const payload = {
      supplier,
      email,
      filenames,
      urgency,
      remarks,
      products,
      Title,
      staff,
      role,

    };
    formData.append("email", email);
    formData.append("userId",user.userId)
    if (IsTarget){
      payload.targetDepartment=targetDepartment
    }
   

    files.forEach((file) => {
      formData.append("files", file);
    });
   

    try {
      setIsSubmitting(true);
      const requestupload = await createOrder({ formData: formData, orderData: payload });
     
      if (requestupload.order?.data?.success===true){

        // Reset form
        setSupplier("Halden");
        setProducts([{ name: "", quantity: 1, price: 0 }]);
        setUrgency("");
        setFiles([]);
        setRemarks("");
        settitle("");
        setError("")
        setrole("")
        setTargetDepartment("")
      }else{
        setError("the file/Request was not sent please Refresh Page")
        
      }
    
    } catch (error) {
      console.error("Error creating order:", error);
      setError(" It seems there was an error processing your Request")
      if (error.response?.status===401|| error.response?.status===403){
          setError("Session expired. Please log in again.");
          //localStorage.removeItem('sessionId');
          
          window.location.href = '/adminlogin';}

      //alert("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

   

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);
  };

  const addProduct = () => {
     setProducts([...products, { name: "", quantity: 1, price: 0 }]);
  
  };

  const removeProduct = (index) => {
    if(products.length>1 ){

      const updatedProducts = products.filter((_, i) => i !== index);
      setProducts(updatedProducts);
    }
  };
  if(showInfo){
    setTimeout(()=>setShowInfo(false),2500)
  }
  return (
    <div className="relative mt-10 mb-40">
      {/* Loading Modal */}
      <AnimatePresence>
        {isSubmitting && (
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
              <h3 className="text-xl font-semibold mb-2">Processing Your Request</h3>
              <p className="text-gray-600 text-center">
                Please wait while we submit your purchase request. 
                This may take a moment, especially if you've attached files.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="min-h-screen bg-gray-100 flex justify-center items-center p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Purchase Request</h2>
          <motion.form onSubmit={handleSubmit} 
          className="space-y-4">

            <motion.div className="mb-4" variants={inputVariants} initial="hidden" animate="visible">
            
              <motion.div className="mb-4" variants={inputVariants} initial="hidden" animate="visible">
                <label className="block text-gray-700 font-bold mb-2">Title:</label>
                <input
                  type="text"
                  value={Title}
                  onChange={(e) => settitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>
              <label className="block text-gray-700 font-bold mb-2">Supplier:</label>
              <input
                type="text"
                placeholder="Optional"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>

            <div className="flex justify-center items-center">
                  <input
                    type="checkbox"
                    name="IsTarget"
                    checked={IsTarget}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Target Department?
                  </label>
                  <div className="relative ">
                     {showInfo && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute left-10 mt-2 w-64 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10"
                          >
                            <p className="text-sm text-gray-700">
                              This parameter is for those who want to make a request to 
                              another department from their current (those functioning in two Departments)                             
                            </p>
                          </motion.div>
                        )}
                  <button
                  onClick={(e)=>{
                    
                    e.stopPropagation()
                    e.preventDefault()
                    setShowInfo(!showInfo)}
                  }
                  className="text-gray-500 hover:text-blue-600 transition-colors ml-3 "
                  aria-label="What is Target Department"
                  >
                    <FiInfo size={18}/>
                  </button>
                  </div>
            </div>
            {IsTarget&&(
               <div className="">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="targetDepartment"
                    value={targetDepartment}
                    onChange={(e)=>setTargetDepartment(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Department</option>
                    <option value="waste_management_dep">Waste Management</option>
                    <option value="PVT">PVT</option>
                    <option value="Environmental_lab_dep">Environmental Lab</option>
                    <option value="accounts_dep">Accounts</option>
                    <option value="Human resources">Human Resources</option>
                    <option value="IT">Information Technology</option>
                    <option value="Administration">Administration</option>
                    <option value="QHSE_dep">QHSE</option>
                    <option value="Procurement_department">Procurement Department</option>
                               
                  </select>
                </div>
            )}
           

            <label className="block mb-2">Urgency</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              required
            >
              <option value="">Select Urgency</option>
              <option className="text-red-500" value="VeryUrgent">Very Urgent</option>
              <option value="Urgent">Urgent</option>
              <option value="NotUrgent">Not Urgent</option>
            </select>

            <div className="flex flex-col items-center justify-center w-full">
              <label className="w-64 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition p-4">
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                {files.length === 0 ? (
                  <div className="flex flex-col items-center text-gray-500">
                    <FileText size={40} />
                    <p className="text-sm mt-2">Click or drag files here (not more than 16mb)</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {files.map((file, index) => (
                      <span key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm">
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </label>
            </div>

            <label className="block mb-2">Remarks/Message(Include Payment Details of third Party If Applicable)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="(If Third party Involved, Include Payment Details)Describe your request..."
              required
            ></textarea>

            {targetDepartment!=="Procurement_department"&&
            (<div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">Item Entry(At Least One Required)</h3>
            <AnimatePresence>
              {products.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div>

                  <label>Item Name(Request Name)</label>
                  <input
                    type="text"
                    placeholder="Requested Item"
                    value={item.name}
                    onChange={(e) => handleProductChange(index, "name", e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                 { /*<div>
                  <label>Quantity</label>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={item.quantity}
                    onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>*/}
                  <div>
                  <label>Unit Price(Or Total)</label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => handleProductChange(index, "price", e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="px-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    whileHover={{ scale: 1.1 }}
                    >
                    Remove
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
            <motion.button
              type="button"
              onClick={addProduct}
              className="p-2 y-4 w-full bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              variants={buttonVariants}
              whileHover="hover"
              >
              Add Product
            </motion.button>
              </div>
            )}
            <motion.button 
              type="submit" 
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex justify-center items-center gap-2 mb-24"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Processing Request...</span>
                </>
              ) : (
                "Create Request"
              )}
            </motion.button>
            {Error && (
            <div className="p-4 flex  justify-center items-center  text-red-600 border-l-4 border-red-500 bg-red-200">
              {Error}
            </div>
          )}
          </motion.form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CreateOrder;