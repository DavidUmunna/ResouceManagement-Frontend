import axios from "axios"
import { Loader2 } from "lucide-react"
import  { useState } from "react"
import { toast } from "react-toastify"
import { FiX } from "react-icons/fi"
import { FaPlus, FaTrash } from "react-icons/fa"
import { motion } from "framer-motion"


const EditOrderModal=({Order, Onclose,setOrders,setEditingModalId})=>{
  
    
    const [formdata,setformdata]=useState({
         Title:Order.Title,
        supplier:Order.supplier,
            remarks:Order.remarks,
         products:Order.products.map((product)=>({

             _id:product?._id,
             name:product?.name,
             quantity:product?.quantity,
             price:product?.price
             
            }
        ))
    })
    const [IsLoading,setIsLoading]=useState(false)
   

    const handleInputChange=(e)=>{
        const {name,value}=e.target
        if (name==="name"|| name==="quantity"|| name==="price"){
            setformdata(prev=>(
                {...prev,
                products:{

                    ...prev.products,
                    [name]:value
                }
                }
            ))
        }
        setformdata(prev=>(
            {...prev,[name]:value}
        ))

    }
    const handleRemoveProduct=(index)=>{{

      setformdata((prev)=>(
        {...prev,
          products:prev.products.filter((_,i)=>i!==index)
        }
        ))
    }
    }
    const handleAddProduct = () => {
     setformdata((prev) => ({
       ...prev,
       products: [
         ...prev.products,
         { name: "", quantity: "", price: "" } // no _id means it's a new item
       ]
     }));
     };


    const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formdata.products];
    updatedProducts[index][field] = value;
    setformdata((prev)=>({...prev,products:updatedProducts}));
    };

   const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    setIsLoading(true);
    const API_URL = `${process.env.REACT_APP_API_URL}/api`;

    const updateResponse = await axios.put(
      `${API_URL}/orders/existingorder/${Order._id}`,
      formdata,
      { withCredentials: true }
    );

    if (updateResponse.data.success === true) {
      toast.success("Order Detail Updated Successfully");

      // update local state with the new data
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === Order._id ? { ...order, ...updateResponse.data.data }  : order
        )
      );
    } else {
      // if success flag is false
      toast.error(updateResponse.data.message || "Update failed");
    }
  } catch (error) {
    console.error("Update error:", error);
    toast.error(
      error.response?.data?.message || "Update Unsuccessful"
    );

    if (error.response?.status === 401 || error.response?.status === 403) {
      window.location.href = "/adminlogin";
    }
  } finally {
    setIsLoading(false);
    setEditingModalId(null)
    
  }
};

    return(
        <>
        <div onClick={Onclose}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
          onClick={(e)=>e.stopPropagation()}
           className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-2">
                <h2><strong>Order Update (#{Order.orderNumber})</strong></h2>
                <button
                onClick={Onclose}
                >
                  <FiX/>
                </button>
            </div>
            <form onSubmit={handleUpdate}>
                <div className="space-y-4">
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            name="Title"
                            value={formdata.Title}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                    </div>
                     <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                          <input
                            type="text"
                            name="supplier"
                            value={formdata.supplier}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                    </div>
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                          <input
                            type="text"
                            name="remarks"
                            value={formdata.remarks}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Item Entry</h3>
                               
                        {formdata.products.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4"
                        
                        >
                          <div>
        
                          <label>Item Name</label>
                          <input
                            type="text"
                            placeholder="Requested Item"
                            value={item.name}
                            onChange={(e) => handleProductChange(index, "name", e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                          <label>Quantity</label>
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={item.quantity}
                            onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                          <label>Unit Price</label>
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
                          onClick={()=>handleRemoveProduct(index)}
                          className="p-2 py-2 bg-red-600 m-2 rounded-lg text-white hover:-translate-y-1 hover:scale-105 transition-transform duration-200 hover;bg-red-700"
                          whileHover={{scale:1.05}}
                          >
                             <FaTrash/>
                          </motion.button>
                    </div>
                    
                    ))}
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex justify-center items-center"
                    >
                      <FaPlus/>  Add Entry
                    </button>
                </div>
                <button type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex justify-center items-center gap-2 mb-24"
                disabled={IsLoading}
               
                >{
                    IsLoading? (
                        <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        <span>Updating...</span>
                        </>
                    ):(
                    "Update Request"
                    )
                }

                </button>
                </div>



            </form>

              
          </div>
        </div>
        </>
    )

}


export default EditOrderModal