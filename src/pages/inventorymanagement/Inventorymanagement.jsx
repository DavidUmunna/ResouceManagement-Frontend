/*eslint-disable react-hooks/exhaustive-deps */
/*eslint-disable no-unused-vars */
import * as Sentry from '@sentry/react';
import React, { useState, useEffect } from 'react';
import { useUser } from '../../components/usercontext';
import axios from "axios";
import { Plus, Minus,Trash2 } from "lucide-react"
import PaginationControls from '../../components/Paginationcontrols';
import Categoryform from './Category_form';
import CategorySelect from "./Category_select"
import LoadingModal from "./Loading_modal"
import { isProd } from '../../components/env';
const InventoryManagement = ({ setAuth , onInventoryChange,  }) => {
 
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting]=useState(false)
  const [data, setData] = useState({
    activities: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  });
 

  const [categories, setCategories] = useState([]);
  const [formdata, setformdata] = useState({
    name: '',
    category: '',
    quantity: 1,
  });
  const [inventoryItems, setInventoryItems] = useState([]);
  const [Activities, setActivities] = useState([]);
  const [Error, setError] = useState("");
  const [loading, setloading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'lastUpdated', direction: 'desc' });
  const [expandedItem, setExpandedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingQuantities, setEditingQuantities] = useState({});
  
  const fetchData = async (page=data.pagination?.page,limit=data.pagination?.limit) => {
    
    try {
      
      const token = localStorage.getItem('sessionId');
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
      const [inventoryRes, categoriesRes] = await Promise.all([
        
        axios.get(`${API_URL}/inventory/${user.Department}`, { params: { page, limit },
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
            withCredentials: true,
          }),
          axios.get(`${API_URL}/inventory/categories`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
            withCredentials: true,
          }),
        ]);
        setData({
          orders: inventoryRes.data.data,
          pagination: inventoryRes.data.Pagination
        });
        
        setInventoryItems(inventoryRes.data.data);
        setCategories(categoriesRes.data.data.categories || []);
        
        //console.log(categoriesRes.data.data.categories)
      
        // Initialize editing quantities
        const initialEditingQuantities = {};
        inventoryRes.data.data.forEach(item => {
          initialEditingQuantities[item._id] = item.quantity;
        });
        setEditingQuantities(initialEditingQuantities);
        
        // Fetch recent activities
        const activitiesRes = await axios.get(`${API_URL}/inventory/activities`, {params: {
          page: 2,
          limit: 15
        },
        headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          withCredentials: true,
        })
        setActivities(activitiesRes.data.data || []);
        
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem('sessionId');
          
          window.location.href = '/adminlogin'; 
        } else {
          Sentry.captureException( err);
        }
      } finally {
        setloading(false);
      }
    };
  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setformdata({
      name: '',
      category: '',
      quantity: 1,
    });
  };

  const handleQuantityInputChange = (itemId, value) => {
    setEditingQuantities({
      ...editingQuantities,
      [itemId]: parseInt(value) 
    });
  };

  const updateQuantity = async (itemId) => {
    try {
      const currentQuantity = inventoryItems.find(item => item._id === itemId)?.quantity || 0;
      const newQuantity = editingQuantities[itemId] || 0;
      const quantityDifference = newQuantity - currentQuantity;

      if (quantityDifference === 0) return;

      const token = localStorage.getItem('sessionId');
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
      const res = await axios.put(`${API_URL}/inventory/${itemId}`, {
        quantity: quantityDifference,
        userId: user?.name
      }, {
        headers: { Authorization: `Bearer ${token}`,"ngrok-skip-browser-warning":"true" }
      });
      
      setInventoryItems(inventoryItems.map(item => 
        item._id === itemId ? res.data.data : item
      ));
      
      // Add to activities
      const updatedItem = inventoryItems.find(item => item._id === itemId);
      setActivities([{
        action: quantityDifference > 0 ? 'Added' : 'Removed',
        name: updatedItem?.name,
        quantity: Math.abs(quantityDifference),
        timestamp: new Date().toISOString(),
        user: user?.name || 'Unknown'
      }, ...Activities]);
      
    } catch (err) {
      if(isProd)Sentry.captureException(err);
      // Revert to original quantity in UI if update fails
      setEditingQuantities({
        ...editingQuantities,
        [itemId]: inventoryItems.find(item => item._id === itemId)?.quantity || 0
      });
    }
  };

  const addQuantity = async (itemId) => {
    try {
      const token = localStorage.getItem('sessionId');
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
      const res = await axios.put(`${API_URL}/inventory/${itemId}`, {
        quantity: 1,
        userId: user?.userId
      }, {
         withCredentials:true
      });
      
      // Update both inventoryItems and editingQuantities
      setInventoryItems(prevItems => 
        prevItems.map(item => 
          item._id === itemId ? { ...item, quantity: res.data.data.quantity } : item
        )
      );
      
      setEditingQuantities(prev => ({
        ...prev,
        [itemId]: res.data.data.quantity
      }));
      
      // Add to activities
      const updatedItem = inventoryItems.find(item => item._id === itemId);
      setActivities([{
        action: 'Added',
        name: updatedItem?.name,
        quantity: 1,
        timestamp: new Date().toISOString(),
        user: user?.name || 'Unknown'
      }, ...Activities]);
      onInventoryChange()
      
    } catch (err) {
      if(isProd)Sentry.captureException(err);
      // Revert to original quantity in UI if update fails
      setEditingQuantities(prev => ({
        ...prev,
        [itemId]: inventoryItems.find(item => item._id === itemId)?.quantity || 0
      }));
    }
  };
  
  const removeQuantity = async (itemId) => {
    try {
      const token = localStorage.getItem('sessionId');
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
      const res = await axios.put(`${API_URL}/inventory/${itemId}`, {
        quantity: -1,
        userId: user?.userId
      }, {
        withCredentials:true
      });
      
      // Update both inventoryItems and editingQuantities
      setInventoryItems(prevItems => 
        prevItems.map(item => 
          item._id === itemId ? { ...item, quantity: res.data.data.quantity } : item
        )
      );
      
      setEditingQuantities(prev => ({
        ...prev,
        [itemId]: res.data.data.quantity
      }));
      
      // Add to activities
      const updatedItem = inventoryItems.find(item => item._id === itemId);
      setActivities([{
        action: 'Removed',
        name: updatedItem?.name,
        quantity: 1,
        timestamp: new Date().toISOString(),
        user: user?.name || 'Unknown'
      }, ...Activities]);
      onInventoryChange()
      
    } catch (err) {
      if(isProd)Sentry.captureException(err)
      // Revert to original quantity in UI if update fails
      setEditingQuantities(prev => ({
        ...prev,
        [itemId]: inventoryItems.find(item => item._id === itemId)?.quantity || 0
      }));
    }finally{
      setloading(false)
    }
  };
  const formatCategory = (category) => {
    const formatted = category
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/(^|\s)\S/g, l => l.toUpperCase()); // Capitalize first letters
    
    // Special case for "PVT" to keep it uppercase
    return category === 'PVT' ? 'PVT' : formatted;
  };
  const DeleteItem=async(itemId)=>{
    try{
      setloading(true)
      const token = localStorage.getItem('sessionId');
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
      const response=await axios.delete(`${API_URL}/inventory/${itemId}`,{
        headers: { Authorization: `Bearer ${token}` }
      })

      setInventoryItems(prevItems => 
        prevItems.filter(item => item._id!==itemId
          
        )
      );



    }catch(error){
      if(isProd)Sentry.captureException(error)
     
      setEditingQuantities(prev => ({
        ...prev,
        [itemId]: inventoryItems.find(item => item._id === itemId)?.quantity || 0
      }));

    }finally{
      setloading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setformdata({
      ...formdata,
      [name]: name === 'quantity' ? parseInt(value)  : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true)
      const API_URL = `${process.env.REACT_APP_API_URL}/api`;
      const token = localStorage.getItem('sessionId');
      const res = await axios.post(`${API_URL}/inventory`, {
        ...formdata,
        AddedBy: user?.userId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setInventoryItems([res.data.data, ...inventoryItems]);
      setEditingQuantities({
        ...editingQuantities,
        [res.data.data._id]: res.data.data.quantity
      });
      
      // Add to activities
      setActivities([{
        action: 'Added',
        name: formdata.name,
        quantity: formdata.quantity,
       
        timestamp: new Date().toISOString(),
        AddedBy: user?.name || 'Unknown'
      }, ...Activities]);
      
      resetForm();
      setShowForm(false);
      onInventoryChange()
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem('sessionId');
        setAuth(false);
          window.location.href = '/adminlogin'; 
      } else {
        console.error('Create failed:', err.response?.data || err.message);
      }
    }finally{
      setIsSubmitting(false)
    }
  };

  const filteredItems = inventoryItems
    .filter(item => {
      const nameMatch = item?.name?.toLowerCase().includes(searchTerm?.toLowerCase() || '');
      const descMatch = item?.description?.toLowerCase().includes(searchTerm?.toLowerCase() || '');
      return nameMatch || descMatch;
    })
    .filter(item => {
       return selectedCategory === 'All'||item?.category === selectedCategory;
    })
    .sort((a, b) => {
      const aVal = a?.[sortConfig.key];
      const bVal = b?.[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    const handlePageChange = (newPage) => {
      fetchData(newPage, data.pagination?.limit);
    };
  
    const handleItemsPerPageChange = (newLimit) => {
      fetchData(1, newLimit); // Reset to page 1 when changing limit
    };
 

  return (
    
     
       
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Inventory Management</h1>
              <button 
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {showForm ? 'Cancel' : 'Add New Item'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Item Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formdata.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <Categoryform user={user} categories={categories}
                     formdata={formdata} handleInputChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={formdata.quantity}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <button 

                type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Add item
                </button>
              </form>
            )}

            <div>
              <CategorySelect user={user} categories={categories} searchTerm={searchTerm}
              setSearchTerm={setSearchTerm} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
              
              />
            </div>

            {loading ? (
              <div className="text-center py-8">Loading inventory...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No items found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500">{item.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={editingQuantities[item._id] || 0}
                              onChange={(e) => handleQuantityInputChange(item._id, e.target.value)}
                              onBlur={() => updateQuantity(item._id)}
                              onKeyPress={(e) => e.key === 'Enter' && updateQuantity(item._id)}
                              className="w-20 p-1 border rounded text-center"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => addQuantity(item._id)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                              title="Add one"
                            >
                              <Plus size={18}/>
                            </button>
                            <button 
                              onClick={() => removeQuantity(item._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                              disabled={item.quantity <= 0}
                              title="Remove one"
                            >
                              <Minus size={18}/>
                            </button>
                            <button 
                              onClick={() => DeleteItem(item._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                             
                              title="Delete"
                            >
                              <Trash2 size={18}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
           {Error && (
            <div className="p-4 flex  justify-center items-center  text-red-600 border-l-4 border-red-500 bg-red-200">
              {Error}
            </div>

            )}
            {isSubmitting &&(
              <div>
                <LoadingModal/>
              </div>
            ) 

            }
                  <div>
                        {/* Your data display */}
                        <PaginationControls
                          currentPage={data.pagination?.page}
                          totalPages={data.pagination?.totalPages}
                          itemsPerPage={data.pagination?.limit}
                          totalItems={data.pagination?.total}
                          onPageChange={handlePageChange}
                          onItemsPerPageChange={handleItemsPerPageChange}
                          isLoading={loading}
                        />
                  </div>
  </div>

       
      
    
  );
};

export default InventoryManagement;