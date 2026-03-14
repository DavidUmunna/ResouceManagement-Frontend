import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import AddSupplierModal from "./AddSupplierModal";


export default function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [expandedSupplierId, setExpandedSupplierId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openAddSupplierModal,setOpenAddSupplierModal]=useState(false)
  //const [requests, setRequests] = useState({}); // supplierId -> [requests]

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const API_URL = `${process.env.REACT_APP_API_URL}/api`
        const res = await fetch(`${API_URL}/supplier`,{headers:{"ngrok-skip-browser-warning": "true"}});
        const data = await res.json();
        setSuppliers(data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSuppliers();
  }, []);

  const toggleSupplier = async (supplierId) => {
    if (expandedSupplierId === supplierId) {
      setExpandedSupplierId(null);
    } else {
      setExpandedSupplierId(supplierId);
      
    }
  };

  if (loading) return <p className="text-center mt-10">Loading suppliers...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-20 p-4 ">
      {openAddSupplierModal&&(
        <AddSupplierModal 
        onClose={()=>setOpenAddSupplierModal(false)}
        />
      )}
      <div className="flex justify-between items-center align-middle mb-6">

      <h2 className="text-2xl font-bold">Suppliers</h2>
      <button
      onClick={()=>setOpenAddSupplierModal(true)}
       className="bg-gray-700 p-3 text-white rounded-lg font-bold">
        Add Supplier
      </button>
      </div>

      {suppliers.length === 0 ? (
        <p>No suppliers found.</p>
      ) : (
        <div className="space-y-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier._id}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{supplier.name}</h3>
                      <p className="text-gray-600 text-sm">{supplier.email}</p>
                      <p className="text-gray-600 text-sm">{supplier.phone}</p>
                    </div>
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        supplier.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {supplier.status}
                    </span>
                  </div>
                  
                  {supplier.description && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Supplies:</span> {supplier.description}
                      </p>
                    </div>
                  )}
                  
                  {supplier.address && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Address:</span> {supplier.address}
                    </p>
                  )}
                </div>
                
                <button 
                  onClick={() => toggleSupplier(supplier._id)}
                  className="ml-4 p-1 hover:bg-gray-100 rounded-full"
                >
                  {expandedSupplierId === supplier._id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

             
            </div>
          ))}
        </div>
      )}
    </div>
  );
}